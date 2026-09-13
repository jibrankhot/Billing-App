const supabase = require('../config/database');

const mapInvoiceItem = (item, product = null) => ({
    id: item.id,
    invoiceId: item.invoice_id,
    productId: item.product_id,
    productName: product?.name || '',
    sku: product?.sku || '',
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    taxRate: Number(item.tax_rate),
    taxAmount: Number(item.tax_amount),
    discountAmount: Number(item.discount_amount || 0),
    totalAmount: Number(item.total_amount),
    createdAt: item.created_at
});

const mapInvoice = (invoice, customer = null, items = []) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    customerId: invoice.customer_id,
    customerName: customer?.name || '',
    salesOrderId: invoice.sales_order_id,
    invoiceDate: invoice.invoice_date,
    dueDate: invoice.due_date,
    status: invoice.status,
    subtotal: Number(invoice.subtotal),
    taxAmount: Number(invoice.tax_amount),
    discountAmount: Number(invoice.discount_amount || 0),
    totalAmount: Number(invoice.total_amount),
    paidAmount: Number(invoice.paid_amount || 0),
    balanceAmount: Number(invoice.balance_amount || 0),
    notes: invoice.notes,
    createdBy: invoice.created_by,
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at,
    items
});

const getCustomer = async (customerId) => {
    const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('id', customerId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('Customer not found');
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

    return data || [];
};

const calculateTotals = (items) => {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    const calculatedItems = items.map((item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        const taxRate = Number(item.taxRate || 0);
        const itemDiscount = Number(item.discountAmount || 0);

        const grossAmount = quantity * unitPrice;
        const taxableAmount = Math.max(grossAmount - itemDiscount, 0);
        const itemTax = taxableAmount * taxRate / 100;
        const totalAmount = taxableAmount + itemTax;

        subtotal += grossAmount;
        taxAmount += itemTax;
        discountAmount += itemDiscount;

        return {
            productId: Number(item.productId),
            quantity,
            unitPrice,
            taxRate,
            taxAmount: itemTax,
            discountAmount: itemDiscount,
            totalAmount
        };
    });

    return {
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount: subtotal - discountAmount + taxAmount,
        items: calculatedItems
    };
};

const getInvoiceItems = async (invoiceId) => {
    const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('id');

    if (error) {
        throw error;
    }

    const items = data || [];

    if (items.length === 0) {
        return [];
    }

    const productIds = [...new Set(items.map((item) => item.product_id))];
    const products = await getProducts(productIds);

    const productMap = new Map(
        products.map((product) => [product.id, product])
    );

    return items.map((item) =>
        mapInvoiceItem(item, productMap.get(item.product_id))
    );
};

const getInvoiceById = async (id) => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('Invoice not found');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    const customer = await getCustomer(data.customer_id);
    const items = await getInvoiceItems(id);

    return mapInvoice(data, customer, items);
};

const getInvoices = async () => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        throw error;
    }

    const invoices = data || [];

    if (invoices.length === 0) {
        return [];
    }

    const customerIds = [
        ...new Set(invoices.map((invoice) => invoice.customer_id))
    ];

    const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id, name')
        .in('id', customerIds);

    if (customerError) {
        throw customerError;
    }

    const customerMap = new Map(
        (customers || []).map((customer) => [customer.id, customer])
    );

    return Promise.all(
        invoices.map(async (invoice) => {
            const items = await getInvoiceItems(invoice.id);

            return mapInvoice(
                invoice,
                customerMap.get(invoice.customer_id),
                items
            );
        })
    );
};

const createInvoice = async (invoiceData, userId) => {
    const customer = await getCustomer(invoiceData.customerId);

    const totals = calculateTotals(invoiceData.items);

    const invoicePayload = {
        invoice_number: String(invoiceData.invoiceNumber).trim(),
        customer_id: Number(invoiceData.customerId),
        sales_order_id: invoiceData.salesOrderId
            ? Number(invoiceData.salesOrderId)
            : null,
        invoice_date: invoiceData.invoiceDate,
        due_date: invoiceData.dueDate || null,
        status: invoiceData.status || 'draft',
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        discount_amount: totals.discountAmount,
        total_amount: totals.totalAmount,
        paid_amount: 0,
        balance_amount: totals.totalAmount,
        notes: invoiceData.notes || null,
        created_by: userId
    };

    const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoicePayload)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error('Invoice number already exists');
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    const itemPayload = totals.items.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        tax_amount: item.taxAmount,
        discount_amount: item.discountAmount,
        total_amount: item.totalAmount
    }));

    const { error: itemError } = await supabase
        .from('invoice_items')
        .insert(itemPayload);

    if (itemError) {
        await supabase
            .from('invoices')
            .delete()
            .eq('id', invoice.id);

        throw itemError;
    }

    const items = await getInvoiceItems(invoice.id);

    return mapInvoice(invoice, customer, items);
};

const updateInvoice = async (id, invoiceData) => {
    const existing = await getInvoiceById(id);

    if (['paid', 'cancelled'].includes(existing.status)) {
        const err = new Error(
            `Cannot update an invoice with status '${existing.status}'`
        );
        err.statusCode = 409;
        throw err;
    }

    const customer = await getCustomer(invoiceData.customerId);

    const totals = calculateTotals(invoiceData.items);

    const invoicePayload = {
        invoice_number: String(invoiceData.invoiceNumber).trim(),
        customer_id: Number(invoiceData.customerId),
        sales_order_id: invoiceData.salesOrderId
            ? Number(invoiceData.salesOrderId)
            : null,
        invoice_date: invoiceData.invoiceDate,
        due_date: invoiceData.dueDate || null,
        status: invoiceData.status || existing.status,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        discount_amount: totals.discountAmount,
        total_amount: totals.totalAmount,
        notes: invoiceData.notes || null
    };

    const { data: invoice, error } = await supabase
        .from('invoices')
        .update(invoicePayload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error('Invoice number already exists');
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    const { error: deleteItemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

    if (deleteItemsError) {
        throw deleteItemsError;
    }

    const itemPayload = totals.items.map((item) => ({
        invoice_id: id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        tax_amount: item.taxAmount,
        discount_amount: item.discountAmount,
        total_amount: item.totalAmount
    }));

    const { error: itemError } = await supabase
        .from('invoice_items')
        .insert(itemPayload);

    if (itemError) {
        throw itemError;
    }

    const items = await getInvoiceItems(id);

    return mapInvoice(invoice, customer, items);
};

const deleteInvoice = async (id) => {
    const existing = await getInvoiceById(id);

    if (['paid', 'cancelled'].includes(existing.status)) {
        const err = new Error(
            `Cannot delete an invoice with status '${existing.status}'`
        );
        err.statusCode = 409;
        throw err;
    }

    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') {
            const err = new Error(
                'Invoice cannot be deleted because it is referenced by other records'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    return true;
};

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice
};