const supabase = require('../config/database');

const mapSalesReturnItem = (item, product = null) => ({
    id: item.id,
    salesReturnId: item.sales_return_id,
    productId: item.product_id,
    productName: product?.name || '',
    sku: product?.sku || '',
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unit_price || 0),
    taxRate: Number(item.tax_rate || 0),
    taxAmount: Number(item.tax_amount || 0),
    totalAmount: Number(item.total_amount || 0),
    createdAt: item.created_at
});

const mapSalesReturn = (
    salesReturn,
    invoice = null,
    customer = null,
    items = []
) => ({
    id: salesReturn.id,
    returnNumber: salesReturn.return_number,
    invoiceId: salesReturn.invoice_id,
    invoiceNumber:
        invoice?.invoice_number || '',
    customerId:
        invoice?.customer_id || null,
    customerName:
        customer?.name || '',
    returnDate: salesReturn.return_date,
    status: salesReturn.status,
    subtotal: Number(salesReturn.subtotal || 0),
    taxAmount: Number(salesReturn.tax_amount || 0),
    totalAmount: Number(salesReturn.total_amount || 0),
    reason: salesReturn.reason,
    notes: salesReturn.notes,
    createdBy: salesReturn.created_by,
    createdAt: salesReturn.created_at,
    updatedAt: salesReturn.updated_at,
    items
});

const getInvoice = async (invoiceId) => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            id,
            invoice_number,
            customer_id
        `)
        .eq('id', invoiceId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error(
                'Invoice not found'
            );
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    return data;
};

const getCustomer = async (customerId) => {
    if (!customerId) {
        return null;
    }

    const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('id', customerId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }

        throw error;
    }

    return data;
};

const getProductsByIds = async (productIds) => {
    const ids = [
        ...new Set(
            productIds
                .map(id => Number(id))
                .filter(Number.isFinite)
        )
    ];

    if (ids.length === 0) {
        return new Map();
    }

    const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, current_stock')
        .in('id', ids);

    if (error) throw error;

    return new Map(
        (data || []).map(product => [
            product.id,
            product
        ])
    );
};

const getReturnItems = async (salesReturnId) => {
    const { data, error } = await supabase
        .from('sales_return_items')
        .select('*')
        .eq('sales_return_id', salesReturnId)
        .order('id', { ascending: true });

    if (error) throw error;

    const items = data || [];

    const products = await getProductsByIds(
        items.map(item => item.product_id)
    );

    return items.map(item =>
        mapSalesReturnItem(
            item,
            products.get(item.product_id)
        )
    );
};

const getSalesReturns = async () => {
    const { data, error } = await supabase
        .from('sales_returns')
        .select(`
            *,
            invoice:invoices(
                invoice_number,
                customer_id
            )
        `)
        .order('return_date', {
            ascending: false
        })
        .order('created_at', {
            ascending: false
        });

    if (error) throw error;

    const returns = data || [];

    const customerIds = [
        ...new Set(
            returns
                .map(item => item.invoice?.customer_id)
                .filter(Boolean)
        )
    ];

    let customers = [];

    if (customerIds.length > 0) {
        const { data: customerData, error: customerError } =
            await supabase
                .from('customers')
                .select('id, name')
                .in('id', customerIds);

        if (customerError) throw customerError;

        customers = customerData || [];
    }

    const customerMap = new Map(
        customers.map(customer => [
            customer.id,
            customer
        ])
    );

    const result = [];

    for (const salesReturn of returns) {
        const items = await getReturnItems(
            salesReturn.id
        );

        result.push(
            mapSalesReturn(
                salesReturn,
                salesReturn.invoice,
                customerMap.get(
                    salesReturn.invoice?.customer_id
                ),
                items
            )
        );
    }

    return result;
};

const getSalesReturnById = async (id) => {
    const { data, error } = await supabase
        .from('sales_returns')
        .select(`
            *,
            invoice:invoices(
                invoice_number,
                customer_id
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error(
                'Sales return not found'
            );
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    const customer = await getCustomer(
        data.invoice?.customer_id
    );

    const items = await getReturnItems(data.id);

    return mapSalesReturn(
        data,
        data.invoice,
        customer,
        items
    );
};

const getInvoiceItems = async (invoiceId) => {
    const { data, error } = await supabase
        .from('invoice_items')
        .select(`
            id,
            invoice_id,
            product_id,
            quantity,
            unit_price,
            tax_rate
        `)
        .eq('invoice_id', invoiceId);

    if (error) throw error;

    return data || [];
};

const getAlreadyReturnedQuantities = async (invoiceId) => {
    const { data, error } = await supabase
        .from('sales_return_items')
        .select(`
            product_id,
            quantity,
            sales_return:sales_returns!inner(
                invoice_id,
                status
            )
        `);

    if (error) throw error;

    const totals = new Map();

    for (const item of data || []) {
        const salesReturn = item.sales_return;

        if (
            salesReturn?.invoice_id !== invoiceId ||
            salesReturn?.status === 'cancelled'
        ) {
            continue;
        }

        const productId = Number(item.product_id);
        const quantity = Number(item.quantity || 0);

        totals.set(
            productId,
            (totals.get(productId) || 0) + quantity
        );
    }

    return totals;
};

const validateReturnQuantities = async (
    invoiceId,
    items
) => {
    const invoiceItems =
        await getInvoiceItems(invoiceId);

    const invoiceQuantityMap = new Map(
        invoiceItems.map(item => [
            Number(item.product_id),
            Number(item.quantity || 0)
        ])
    );

    const returnedQuantityMap =
        await getAlreadyReturnedQuantities(
            invoiceId
        );

    const requestedQuantityMap = new Map();

    for (const item of items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity);

        if (!invoiceQuantityMap.has(productId)) {
            const err = new Error(
                `Product ${productId} does not belong to the selected invoice`
            );
            err.statusCode = 409;
            throw err;
        }

        requestedQuantityMap.set(
            productId,
            (requestedQuantityMap.get(productId) || 0) +
                quantity
        );
    }

    for (
        const [
            productId,
            requestedQuantity
        ] of requestedQuantityMap
    ) {
        const invoicedQuantity =
            invoiceQuantityMap.get(productId) || 0;

        const alreadyReturned =
            returnedQuantityMap.get(productId) || 0;

        const remaining =
            invoicedQuantity - alreadyReturned;

        if (requestedQuantity > remaining) {
            const err = new Error(
                `Return quantity for product ${productId} exceeds the remaining quantity of ${remaining}`
            );
            err.statusCode = 409;
            throw err;
        }
    }
};

const createSalesReturn = async (
    returnData,
    returnItems,
    userId
) => {
    const invoiceId = Number(
        returnData.invoiceId
    );

    const invoice = await getInvoice(invoiceId);

    if (
        !Array.isArray(returnItems) ||
        returnItems.length === 0
    ) {
        const err = new Error(
            'At least one return item is required'
        );
        err.statusCode = 422;
        throw err;
    }

    await validateReturnQuantities(
        invoiceId,
        returnItems
    );

    const productMap = await getProductsByIds(
        returnItems.map(item => item.productId)
    );

    for (const item of returnItems) {
        if (!productMap.has(Number(item.productId))) {
            const err = new Error(
                `Product ${item.productId} not found`
            );
            err.statusCode = 404;
            throw err;
        }
    }

    let subtotal = 0;
    let taxAmount = 0;

    const preparedItems = returnItems.map(item => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        const taxRate = Number(item.taxRate);

        const itemSubtotal =
            quantity * unitPrice;

        const itemTax =
            itemSubtotal * taxRate / 100;

        const itemTotal =
            itemSubtotal + itemTax;

        subtotal += itemSubtotal;
        taxAmount += itemTax;

        return {
            product_id: Number(item.productId),
            quantity,
            unit_price: unitPrice,
            tax_rate: taxRate,
            tax_amount: Number(
                itemTax.toFixed(2)
            ),
            total_amount: Number(
                itemTotal.toFixed(2)
            )
        };
    });

    subtotal = Number(subtotal.toFixed(2));
    taxAmount = Number(taxAmount.toFixed(2));

    const totalAmount = Number(
        (subtotal + taxAmount).toFixed(2)
    );

    const returnNumber =
        returnData.returnNumber ||
        `RET-${Date.now()}`;

    const returnPayload = {
        return_number: returnNumber,
        invoice_id: invoiceId,
        return_date: returnData.returnDate,
        status: 'draft',
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        reason: String(returnData.reason).trim(),
        notes: returnData.notes || null,
        created_by: userId
    };

    const { data: createdReturn, error } =
        await supabase
            .from('sales_returns')
            .insert(returnPayload)
            .select()
            .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error(
                'Sales return number already exists'
            );
            err.statusCode = 409;
            throw err;
        }

        if (error.code === '23503') {
            const err = new Error(
                'Invalid invoice or user'
            );
            err.statusCode = 400;
            throw err;
        }

        throw error;
    }

    const itemPayload = preparedItems.map(item => ({
        ...item,
        sales_return_id: createdReturn.id
    }));

    const { error: itemError } =
        await supabase
            .from('sales_return_items')
            .insert(itemPayload);

    if (itemError) {
        await supabase
            .from('sales_returns')
            .delete()
            .eq('id', createdReturn.id);

        throw itemError;
    }

    return getSalesReturnById(
        createdReturn.id
    );
};

const updateSalesReturnStatus = async (
    id,
    status
) => {
    const salesReturn =
        await getSalesReturnById(id);

    if (salesReturn.status === 'cancelled') {
        const err = new Error(
            'Cancelled sales return cannot be changed'
        );
        err.statusCode = 409;
        throw err;
    }

    if (
        ![
            'draft',
            'approved',
            'completed',
            'cancelled'
        ].includes(status)
    ) {
        const err = new Error(
            'Invalid sales return status'
        );
        err.statusCode = 422;
        throw err;
    }

    if (
        status === 'completed' &&
        salesReturn.status !== 'completed'
    ) {
        for (const item of salesReturn.items) {
            const product = await getProduct(
                item.productId
            );

            const newStock =
                Number(product.current_stock || 0) +
                Number(item.quantity);

            const { error: stockError } =
                await supabase
                    .from('products')
                    .update({
                        current_stock: newStock
                    })
                    .eq('id', item.productId);

            if (stockError) {
                throw stockError;
            }

            const { error: movementError } =
                await supabase
                    .from('stock_movements')
                    .insert({
                        product_id: item.productId,
                        movement_type: 'return',
                        quantity: Number(item.quantity),
                        reference_type: 'sales_return',
                        reference_id: salesReturn.id,
                        notes: `Sales return ${salesReturn.returnNumber}`
                    });

            if (movementError) {
                throw movementError;
            }
        }
    }

    const { data, error } = await supabase
        .from('sales_returns')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return getSalesReturnById(data.id);
};

const getProduct = async (productId) => {
    const { data, error } = await supabase
        .from('products')
        .select('id, current_stock')
        .eq('id', productId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error(
                'Product not found'
            );
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    return data;
};

const deleteSalesReturn = async (id) => {
    const salesReturn =
        await getSalesReturnById(id);

    if (salesReturn.status === 'completed') {
        const err = new Error(
            'Completed sales return cannot be deleted'
        );
        err.statusCode = 409;
        throw err;
    }

    const { error } = await supabase
        .from('sales_returns')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') {
            const err = new Error(
                'Sales return cannot be deleted'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    return {
        success: true,
        id: salesReturn.id
    };
};

module.exports = {
    getSalesReturns,
    getSalesReturnById,
    createSalesReturn,
    updateSalesReturnStatus,
    deleteSalesReturn
};