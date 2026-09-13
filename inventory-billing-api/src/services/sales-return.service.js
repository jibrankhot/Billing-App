const supabase = require('../config/database');

const mapSalesReturnItem = (item, product = null) => ({
    id: item.id,
    salesReturnId: item.sales_return_id,
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

const mapSalesReturn = (returnRecord, invoice = null, items = []) => ({
    id: returnRecord.id,
    returnNumber: returnRecord.return_number,
    invoiceId: returnRecord.invoice_id,
    invoiceNumber: invoice?.invoice_number || '',
    customerId: invoice?.customer_id || null,
    customerName: invoice?.customer?.name || '',
    returnDate: returnRecord.return_date,
    status: returnRecord.status,
    subtotal: Number(returnRecord.subtotal),
    taxAmount: Number(returnRecord.tax_amount),
    totalAmount: Number(returnRecord.total_amount),
    reason: returnRecord.reason,
    notes: returnRecord.notes,
    createdBy: returnRecord.created_by,
    createdAt: returnRecord.created_at,
    updatedAt: returnRecord.updated_at,
    items
});

const getInvoice = async (invoiceId) => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            id,
            invoice_number,
            customer_id,
            status
        `)
        .eq('id', invoiceId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('Invoice not found');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    if (data.customer_id) {
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('id, name')
            .eq('id', data.customer_id)
            .single();

        if (customerError && customerError.code !== 'PGRST116') {
            throw customerError;
        }

        data.customer = customer || null;
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

    return data || [];
};

const getInvoiceItems = async (invoiceId) => {
    const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);

    if (error) {
        throw error;
    }

    return data || [];
};

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
            productId: Number(item.productId),
            quantity,
            unitPrice,
            taxRate,
            taxAmount: itemTax,
            totalAmount: itemTotal
        };
    });

    return {
        subtotal,
        taxAmount,
        totalAmount: subtotal + taxAmount,
        items: calculatedItems
    };
};

const getSalesReturnItems = async (returnId) => {
    const { data, error } = await supabase
        .from('sales_return_items')
        .select('*')
        .eq('sales_return_id', returnId)
        .order('id');

    if (error) {
        throw error;
    }

    const items = data || [];

    if (items.length === 0) {
        return [];
    }

    const productIds = [
        ...new Set(items.map((item) => item.product_id))
    ];

    const products = await getProducts(productIds);

    const productMap = new Map(
        products.map((product) => [product.id, product])
    );

    return items.map((item) =>
        mapSalesReturnItem(
            item,
            productMap.get(item.product_id)
        )
    );
};

const getSalesReturnById = async (id) => {
    const { data, error } = await supabase
        .from('sales_returns')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('Sales return not found');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    const invoice = await getInvoice(data.invoice_id);
    const items = await getSalesReturnItems(id);

    return mapSalesReturn(data, invoice, items);
};

const getSalesReturns = async () => {
    const { data, error } = await supabase
        .from('sales_returns')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        throw error;
    }

    const returns = data || [];

    if (returns.length === 0) {
        return [];
    }

    const invoiceIds = [
        ...new Set(returns.map((item) => item.invoice_id))
    ];

    const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, invoice_number, customer_id')
        .in('id', invoiceIds);

    if (invoiceError) {
        throw invoiceError;
    }

    const customerIds = [
        ...new Set(
            (invoices || [])
                .map((invoice) => invoice.customer_id)
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
        customers.map((customer) => [customer.id, customer])
    );

    const invoiceMap = new Map(
        (invoices || []).map((invoice) => [
            invoice.id,
            {
                ...invoice,
                customer:
                    customerMap.get(invoice.customer_id) || null
            }
        ])
    );

    return Promise.all(
        returns.map(async (returnRecord) => {
            const items = await getSalesReturnItems(
                returnRecord.id
            );

            return mapSalesReturn(
                returnRecord,
                invoiceMap.get(returnRecord.invoice_id),
                items
            );
        })
    );
};

const validateReturnQuantities = async (invoiceId, items, returnId = null) => {
    const invoiceItems = await getInvoiceItems(invoiceId);

    if (invoiceItems.length === 0) {
        const err = new Error(
            'Invoice does not contain any items'
        );
        err.statusCode = 409;
        throw err;
    }

    const existingQuery = supabase
        .from('sales_return_items')
        .select(`
            quantity,
            product_id,
            sales_return_id,
            sales_returns!inner(
                invoice_id,
                status
            )
        `)
        .eq('sales_returns.invoice_id', invoiceId)
        .neq('sales_returns.status', 'cancelled');

    const { data: existingReturns, error } = await existingQuery;

    if (error) {
        throw error;
    }

    const returnedQuantities = new Map();

    for (const item of existingReturns || []) {
        if (
            returnId &&
            Number(item.sales_return_id) === Number(returnId)
        ) {
            continue;
        }

        const current =
            returnedQuantities.get(item.product_id) || 0;

        returnedQuantities.set(
            item.product_id,
            current + Number(item.quantity)
        );
    }

    const invoiceQuantityMap = new Map(
        invoiceItems.map((item) => [
            item.product_id,
            Number(item.quantity)
        ])
    );

    for (const item of items) {
        const productId = Number(item.productId);
        const requestedQuantity = Number(item.quantity);

        if (!invoiceQuantityMap.has(productId)) {
            const err = new Error(
                `Product ${productId} does not belong to the invoice`
            );
            err.statusCode = 409;
            throw err;
        }

        const alreadyReturned =
            returnedQuantities.get(productId) || 0;

        const invoiceQuantity =
            invoiceQuantityMap.get(productId);

        if (
            alreadyReturned + requestedQuantity >
            invoiceQuantity
        ) {
            const err = new Error(
                `Return quantity exceeds available invoice quantity for product ${productId}`
            );
            err.statusCode = 409;
            throw err;
        }
    }
};

const createSalesReturn = async (returnData, userId) => {
    const invoice = await getInvoice(
        Number(returnData.invoiceId)
    );

    if (invoice.status === 'cancelled') {
        const err = new Error(
            'Cannot create a return for a cancelled invoice'
        );
        err.statusCode = 409;
        throw err;
    }

    await validateReturnQuantities(
        Number(returnData.invoiceId),
        returnData.items
    );

    const totals = calculateTotals(returnData.items);

    const returnPayload = {
        return_number: String(returnData.returnNumber).trim(),
        invoice_id: Number(returnData.invoiceId),
        return_date: returnData.returnDate,
        status: returnData.status || 'draft',
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        total_amount: totals.totalAmount,
        reason: returnData.reason || null,
        notes: returnData.notes || null,
        created_by: userId
    };

    const { data: returnRecord, error } = await supabase
        .from('sales_returns')
        .insert(returnPayload)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error(
                'Return number already exists'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    const itemPayload = totals.items.map((item) => ({
        sales_return_id: returnRecord.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        tax_amount: item.taxAmount,
        total_amount: item.totalAmount
    }));

    const { error: itemError } = await supabase
        .from('sales_return_items')
        .insert(itemPayload);

    if (itemError) {
        await supabase
            .from('sales_returns')
            .delete()
            .eq('id', returnRecord.id);

        throw itemError;
    }

    const items = await getSalesReturnItems(
        returnRecord.id
    );

    return mapSalesReturn(
        returnRecord,
        invoice,
        items
    );
};

const updateSalesReturn = async (id, returnData) => {
    const existing = await getSalesReturnById(id);

    if (['completed', 'cancelled'].includes(existing.status)) {
        const err = new Error(
            `Cannot update a sales return with status '${existing.status}'`
        );
        err.statusCode = 409;
        throw err;
    }

    const invoice = await getInvoice(
        Number(returnData.invoiceId)
    );

    if (invoice.status === 'cancelled') {
        const err = new Error(
            'Cannot update a return for a cancelled invoice'
        );
        err.statusCode = 409;
        throw err;
    }

    await validateReturnQuantities(
        Number(returnData.invoiceId),
        returnData.items,
        id
    );

    const totals = calculateTotals(returnData.items);

    const returnPayload = {
        return_number: String(returnData.returnNumber).trim(),
        invoice_id: Number(returnData.invoiceId),
        return_date: returnData.returnDate,
        status: returnData.status || existing.status,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        total_amount: totals.totalAmount,
        reason: returnData.reason || null,
        notes: returnData.notes || null
    };

    const { data: returnRecord, error } = await supabase
        .from('sales_returns')
        .update(returnPayload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error(
                'Return number already exists'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    const { error: deleteError } = await supabase
        .from('sales_return_items')
        .delete()
        .eq('sales_return_id', id);

    if (deleteError) {
        throw deleteError;
    }

    const itemPayload = totals.items.map((item) => ({
        sales_return_id: id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        tax_amount: item.taxAmount,
        total_amount: item.totalAmount
    }));

    const { error: itemError } = await supabase
        .from('sales_return_items')
        .insert(itemPayload);

    if (itemError) {
        throw itemError;
    }

    const items = await getSalesReturnItems(id);

    return mapSalesReturn(
        returnRecord,
        invoice,
        items
    );
};

const deleteSalesReturn = async (id) => {
    const existing = await getSalesReturnById(id);

    if (existing.status === 'completed') {
        const err = new Error(
            'Completed sales returns cannot be deleted'
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
                'Sales return cannot be deleted because it is referenced by other records'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    return true;
};

module.exports = {
    getSalesReturns,
    getSalesReturnById,
    createSalesReturn,
    updateSalesReturn,
    deleteSalesReturn
};