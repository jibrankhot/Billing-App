const supabase = require('../config/database');

const mapSalesOrderItem = (item, product = null) => ({
    id: item.id,
    salesOrderId: item.sales_order_id,
    productId: item.product_id,
    productName: product?.name || '',
    sku: product?.sku || '',
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    taxRate: Number(item.tax_rate),
    taxAmount: Number(item.tax_amount),
    totalAmount: Number(item.total_amount),
    createdAt: item.created_at
});

const mapSalesOrder = (order, customer = null, items = []) => ({
    id: order.id,
    orderNumber: order.order_number,
    customerId: order.customer_id,
    customerName: customer?.name || '',
    orderDate: order.order_date,
    status: order.status,
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.tax_amount),
    discountAmount: Number(order.discount_amount || 0),
    totalAmount: Number(order.total_amount),
    notes: order.notes,
    createdBy: order.created_by,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items
});

const calculateTotals = (items, discountAmount = 0) => {
    let subtotal = 0;
    let taxAmount = 0;

    const calculatedItems = items.map((item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        const taxRate = Number(item.taxRate || 0);

        const itemSubtotal = quantity * unitPrice;
        const itemTax = itemSubtotal * taxRate / 100;
        const itemTotal = itemSubtotal + itemTax;

        subtotal += itemSubtotal;
        taxAmount += itemTax;

        return {
            product_id: Number(item.productId),
            quantity,
            unit_price: unitPrice,
            tax_rate: taxRate,
            tax_amount: Number(itemTax.toFixed(2)),
            total_amount: Number(itemTotal.toFixed(2))
        };
    });

    const discount = Math.max(0, Number(discountAmount || 0));

    return {
        subtotal: Number(subtotal.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        discountAmount: Number(discount.toFixed(2)),
        totalAmount: Number(
            Math.max(0, subtotal + taxAmount - discount).toFixed(2)
        ),
        items: calculatedItems
    };
};

const getCustomer = async (customerId) => {
    const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('id', customerId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('Customer not found.');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    return data;
};

const getProducts = async (productIds) => {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, sku')
        .in('id', productIds);

    if (error) {
        throw error;
    }

    const productMap = new Map(
        (data || []).map(product => [product.id, product])
    );

    for (const productId of productIds) {
        if (!productMap.has(productId)) {
            const err = new Error(`Product ${productId} not found.`);
            err.statusCode = 404;
            throw err;
        }
    }

    return productMap;
};

const getItems = async (orderId) => {
    const { data, error } = await supabase
        .from('sales_order_items')
        .select('*')
        .eq('sales_order_id', orderId)
        .order('id');

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        return [];
    }

    const productIds = data.map(item => item.product_id);

    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku')
        .in('id', productIds);

    if (productsError) {
        throw productsError;
    }

    const productMap = new Map(
        (products || []).map(product => [product.id, product])
    );

    return data.map(item =>
        mapSalesOrderItem(
            item,
            productMap.get(item.product_id)
        )
    );
};

const getSalesOrders = async () => {
    const { data, error } = await supabase
        .from('sales_orders')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        return [];
    }

    const customerIds = [
        ...new Set(
            data
                .map(order => order.customer_id)
                .filter(Boolean)
        )
    ];

    let customers = [];

    if (customerIds.length > 0) {
        const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('id, name')
            .in('id', customerIds);

        if (customerError) {
            throw customerError;
        }

        customers = customerData || [];
    }

    const customerMap = new Map(
        customers.map(customer => [customer.id, customer])
    );

    return data.map(order =>
        mapSalesOrder(
            order,
            customerMap.get(order.customer_id),
            []
        )
    );
};

const getSalesOrderById = async (id) => {
    const { data, error } = await supabase
        .from('sales_orders')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('Sales order not found.');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    const customer = await getCustomer(data.customer_id);
    const items = await getItems(id);

    return mapSalesOrder(data, customer, items);
};

const createSalesOrder = async (payload, userId) => {
    const customerId = Number(payload.customerId);

    await getCustomer(customerId);

    const totals = calculateTotals(
        payload.items,
        payload.discountAmount
    );

    await getProducts(
        totals.items.map(item => item.product_id)
    );

    const { data: order, error: orderError } = await supabase
        .from('sales_orders')
        .insert({
            order_number: String(payload.orderNumber).trim(),
            customer_id: customerId,
            order_date: payload.orderDate,
            status: payload.status || 'draft',
            subtotal: totals.subtotal,
            tax_amount: totals.taxAmount,
            discount_amount: totals.discountAmount,
            total_amount: totals.totalAmount,
            notes: payload.notes || null,
            created_by: userId || null
        })
        .select()
        .single();

    if (orderError) {
        if (orderError.code === '23505') {
            const err = new Error('Sales order number already exists.');
            err.statusCode = 409;
            throw err;
        }

        throw orderError;
    }

    const itemsToInsert = totals.items.map(item => ({
        ...item,
        sales_order_id: order.id
    }));

    const { error: itemsError } = await supabase
        .from('sales_order_items')
        .insert(itemsToInsert);

    if (itemsError) {
        await supabase
            .from('sales_orders')
            .delete()
            .eq('id', order.id);

        throw itemsError;
    }

    return getSalesOrderById(order.id);
};

const updateSalesOrder = async (id, payload) => {
    const existing = await getSalesOrderById(id);

    if (
        existing.status === 'completed' ||
        existing.status === 'cancelled'
    ) {
        const err = new Error(
            'Completed or cancelled sales orders cannot be edited.'
        );
        err.statusCode = 409;
        throw err;
    }

    const customerId = Number(payload.customerId);

    await getCustomer(customerId);

    const totals = calculateTotals(
        payload.items,
        payload.discountAmount
    );

    await getProducts(
        totals.items.map(item => item.product_id)
    );

    const { data: order, error: orderError } = await supabase
        .from('sales_orders')
        .update({
            order_number: String(payload.orderNumber).trim(),
            customer_id: customerId,
            order_date: payload.orderDate,
            status: payload.status || 'draft',
            subtotal: totals.subtotal,
            tax_amount: totals.taxAmount,
            discount_amount: totals.discountAmount,
            total_amount: totals.totalAmount,
            notes: payload.notes || null
        })
        .eq('id', id)
        .select()
        .single();

    if (orderError) {
        if (orderError.code === '23505') {
            const err = new Error('Sales order number already exists.');
            err.statusCode = 409;
            throw err;
        }

        throw orderError;
    }

    const { error: deleteItemsError } = await supabase
        .from('sales_order_items')
        .delete()
        .eq('sales_order_id', id);

    if (deleteItemsError) {
        throw deleteItemsError;
    }

    const itemsToInsert = totals.items.map(item => ({
        ...item,
        sales_order_id: id
    }));

    const { error: insertItemsError } = await supabase
        .from('sales_order_items')
        .insert(itemsToInsert);

    if (insertItemsError) {
        throw insertItemsError;
    }

    return getSalesOrderById(order.id);
};

const deleteSalesOrder = async (id) => {
    const existing = await getSalesOrderById(id);

    if (
        existing.status === 'completed' ||
        existing.status === 'cancelled'
    ) {
        const err = new Error(
            'Completed or cancelled sales orders cannot be deleted.'
        );
        err.statusCode = 409;
        throw err;
    }

    const { error } = await supabase
        .from('sales_orders')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') {
            const err = new Error(
                'Sales order cannot be deleted because it is referenced by other records.'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    return true;
};

module.exports = {
    getSalesOrders,
    getSalesOrderById,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder
};