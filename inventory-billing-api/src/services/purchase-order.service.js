const supabase = require('../config/database');

const mapPurchaseOrderItem = (item, product = null) => ({
    id: item.id,
    purchaseOrderId: item.purchase_order_id,
    productId: item.product_id,
    productName: product?.name || item.product_name || '',
    sku: product?.sku || item.sku || '',
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    taxRate: Number(item.tax_rate),
    taxAmount: Number(item.tax_amount),
    totalAmount: Number(item.total_amount),
    createdAt: item.created_at
});

const mapPurchaseOrder = (order, supplier = null, items = []) => ({
    id: order.id,
    orderNumber: order.order_number,
    supplierId: order.supplier_id,
    supplierName: supplier?.name || '',
    orderDate: order.order_date,
    expectedDate: order.expected_date,
    status: order.status,
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.tax_amount),
    totalAmount: Number(order.total_amount),
    notes: order.notes,
    createdBy: order.created_by,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items
});

const calculateTotals = (items) => {
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

    return {
        subtotal: Number(subtotal.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        totalAmount: Number((subtotal + taxAmount).toFixed(2)),
        items: calculatedItems
    };
};

const getSupplier = async (supplierId) => {
    const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('id', supplierId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('Supplier not found.');
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
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', orderId)
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
        mapPurchaseOrderItem(
            item,
            productMap.get(item.product_id)
        )
    );
};

const getPurchaseOrders = async () => {
    const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        return [];
    }

    const supplierIds = [
        ...new Set(
            data
                .map(order => order.supplier_id)
                .filter(Boolean)
        )
    ];

    let suppliers = [];

    if (supplierIds.length > 0) {
        const { data: supplierData, error: supplierError } = await supabase
            .from('suppliers')
            .select('id, name')
            .in('id', supplierIds);

        if (supplierError) {
            throw supplierError;
        }

        suppliers = supplierData || [];
    }

    const supplierMap = new Map(
        suppliers.map(supplier => [supplier.id, supplier])
    );

    return data.map(order =>
        mapPurchaseOrder(
            order,
            supplierMap.get(order.supplier_id),
            []
        )
    );
};

const getPurchaseOrderById = async (id) => {
    const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('Purchase order not found.');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    const supplier = await getSupplier(data.supplier_id);
    const items = await getItems(id);

    return mapPurchaseOrder(data, supplier, items);
};

const createPurchaseOrder = async (payload, userId) => {
    const supplierId = Number(payload.supplierId);

    await getSupplier(supplierId);

    const totals = calculateTotals(payload.items);

    await getProducts(
        totals.items.map(item => item.product_id)
    );

    const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .insert({
            order_number: String(payload.orderNumber).trim(),
            supplier_id: supplierId,
            order_date: payload.orderDate,
            expected_date: payload.expectedDate || null,
            status: payload.status || 'draft',
            subtotal: totals.subtotal,
            tax_amount: totals.taxAmount,
            total_amount: totals.totalAmount,
            notes: payload.notes || null,
            created_by: userId || null
        })
        .select()
        .single();

    if (orderError) {
        if (orderError.code === '23505') {
            const err = new Error('Purchase order number already exists.');
            err.statusCode = 409;
            throw err;
        }

        throw orderError;
    }

    const itemsToInsert = totals.items.map(item => ({
        ...item,
        purchase_order_id: order.id
    }));

    const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(itemsToInsert);

    if (itemsError) {
        await supabase
            .from('purchase_orders')
            .delete()
            .eq('id', order.id);

        throw itemsError;
    }

    return getPurchaseOrderById(order.id);
};

const updatePurchaseOrder = async (id, payload) => {
    const existing = await getPurchaseOrderById(id);

    if (existing.status === 'received') {
        const err = new Error('Received purchase orders cannot be edited.');
        err.statusCode = 409;
        throw err;
    }

    const supplierId = Number(payload.supplierId);

    await getSupplier(supplierId);

    const totals = calculateTotals(payload.items);

    await getProducts(
        totals.items.map(item => item.product_id)
    );

    const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .update({
            order_number: String(payload.orderNumber).trim(),
            supplier_id: supplierId,
            order_date: payload.orderDate,
            expected_date: payload.expectedDate || null,
            status: payload.status || 'draft',
            subtotal: totals.subtotal,
            tax_amount: totals.taxAmount,
            total_amount: totals.totalAmount,
            notes: payload.notes || null
        })
        .eq('id', id)
        .select()
        .single();

    if (orderError) {
        if (orderError.code === '23505') {
            const err = new Error('Purchase order number already exists.');
            err.statusCode = 409;
            throw err;
        }

        throw orderError;
    }

    const { error: deleteItemsError } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('purchase_order_id', id);

    if (deleteItemsError) {
        throw deleteItemsError;
    }

    const itemsToInsert = totals.items.map(item => ({
        ...item,
        purchase_order_id: id
    }));

    const { error: insertItemsError } = await supabase
        .from('purchase_order_items')
        .insert(itemsToInsert);

    if (insertItemsError) {
        throw insertItemsError;
    }

    return getPurchaseOrderById(order.id);
};

const deletePurchaseOrder = async (id) => {
    const existing = await getPurchaseOrderById(id);

    if (existing.status === 'received') {
        const err = new Error('Received purchase orders cannot be deleted.');
        err.statusCode = 409;
        throw err;
    }

    const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') {
            const err = new Error(
                'Purchase order cannot be deleted because it is referenced by other records.'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    return true;
};

module.exports = {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
};