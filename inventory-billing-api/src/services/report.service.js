const supabase = require('../config/database');

const toNumber = (value) => Number(value || 0);

const getDateRange = (query = {}) => {
    const { dateFrom, dateTo } = query;

    return {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null
    };
};

const applyDateRange = (query, column, dateFrom, dateTo) => {
    let result = query;

    if (dateFrom) {
        result = result.gte(column, dateFrom);
    }

    if (dateTo) {
        result = result.lte(column, dateTo);
    }

    return result;
};

// SALES REPORT
const getSalesReport = async (queryParams = {}) => {
    const { dateFrom, dateTo } = getDateRange(queryParams);

    let query = supabase
        .from('invoices')
        .select(`
            id,
            invoice_number,
            invoice_date,
            customer_id,
            subtotal,
            tax_amount,
            discount_amount,
            total_amount,
            status
        `)
        .order('invoice_date', { ascending: false });

    query = applyDateRange(
        query,
        'invoice_date',
        dateFrom,
        dateTo
    );

    const { data, error } = await query;

    if (error) throw error;

    const invoices = data || [];

    return {
        dateFrom,
        dateTo,
        invoiceCount: invoices.length,
        subtotal: invoices.reduce(
            (sum, item) => sum + toNumber(item.subtotal),
            0
        ),
        taxAmount: invoices.reduce(
            (sum, item) => sum + toNumber(item.tax_amount),
            0
        ),
        discountAmount: invoices.reduce(
            (sum, item) => sum + toNumber(item.discount_amount),
            0
        ),
        totalAmount: invoices.reduce(
            (sum, item) => sum + toNumber(item.total_amount),
            0
        ),
        invoices: invoices.map(item => ({
            id: item.id,
            invoiceNumber: item.invoice_number,
            invoiceDate: item.invoice_date,
            customerId: item.customer_id,
            subtotal: toNumber(item.subtotal),
            taxAmount: toNumber(item.tax_amount),
            discountAmount: toNumber(item.discount_amount),
            totalAmount: toNumber(item.total_amount),
            status: item.status
        }))
    };
};

// PURCHASE REPORT
const getPurchaseReport = async (queryParams = {}) => {
    const { dateFrom, dateTo } = getDateRange(queryParams);

    let query = supabase
        .from('purchase_orders')
        .select(`
            id,
            order_number,
            supplier_id,
            order_date,
            expected_date,
            status,
            subtotal,
            tax_amount,
            total_amount
        `)
        .order('order_date', { ascending: false });

    query = applyDateRange(
        query,
        'order_date',
        dateFrom,
        dateTo
    );

    const { data, error } = await query;

    if (error) throw error;

    const orders = data || [];

    return {
        dateFrom,
        dateTo,
        orderCount: orders.length,
        subtotal: orders.reduce(
            (sum, item) => sum + toNumber(item.subtotal),
            0
        ),
        taxAmount: orders.reduce(
            (sum, item) => sum + toNumber(item.tax_amount),
            0
        ),
        totalAmount: orders.reduce(
            (sum, item) => sum + toNumber(item.total_amount),
            0
        ),
        orders: orders.map(item => ({
            id: item.id,
            orderNumber: item.order_number,
            supplierId: item.supplier_id,
            orderDate: item.order_date,
            expectedDate: item.expected_date,
            status: item.status,
            subtotal: toNumber(item.subtotal),
            taxAmount: toNumber(item.tax_amount),
            totalAmount: toNumber(item.total_amount)
        }))
    };
};

// PAYMENT REPORT
const getPaymentReport = async (queryParams = {}) => {
    const { dateFrom, dateTo } = getDateRange(queryParams);

    let query = supabase
        .from('payments')
        .select(`
            id,
            invoice_id,
            payment_date,
            amount,
            payment_method,
            reference_number,
            notes
        `)
        .order('payment_date', { ascending: false });

    query = applyDateRange(
        query,
        'payment_date',
        dateFrom,
        dateTo
    );

    const { data, error } = await query;

    if (error) throw error;

    const payments = data || [];

    const byMethod = {};

    payments.forEach(payment => {
        const method = payment.payment_method || 'other';

        byMethod[method] =
            (byMethod[method] || 0) +
            toNumber(payment.amount);
    });

    return {
        dateFrom,
        dateTo,
        paymentCount: payments.length,
        totalAmount: payments.reduce(
            (sum, item) => sum + toNumber(item.amount),
            0
        ),
        byMethod,
        payments: payments.map(item => ({
            id: item.id,
            invoiceId: item.invoice_id,
            paymentDate: item.payment_date,
            amount: toNumber(item.amount),
            paymentMethod: item.payment_method,
            referenceNumber: item.reference_number,
            notes: item.notes
        }))
    };
};

// INVENTORY REPORT
const getInventoryReport = async () => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            id,
            sku,
            name,
            category_id,
            unit,
            purchase_price,
            selling_price,
            current_stock,
            minimum_stock,
            is_active
        `)
        .order('name', { ascending: true });

    if (error) throw error;

    const products = data || [];

    const totalStock = products.reduce(
        (sum, item) => sum + toNumber(item.current_stock),
        0
    );

    const inventoryValue = products.reduce(
        (sum, item) =>
            sum +
            toNumber(item.current_stock) *
            toNumber(item.purchase_price),
        0
    );

    const lowStockProducts = products.filter(
        item =>
            toNumber(item.current_stock) <=
            toNumber(item.minimum_stock)
    );

    const outOfStockProducts = products.filter(
        item => toNumber(item.current_stock) <= 0
    );

    return {
        totalProducts: products.length,
        totalStock,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        inventoryValue,
        products: products.map(item => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            categoryId: item.category_id,
            unit: item.unit,
            purchasePrice: toNumber(item.purchase_price),
            sellingPrice: toNumber(item.selling_price),
            currentStock: toNumber(item.current_stock),
            minimumStock: toNumber(item.minimum_stock),
            isActive: item.is_active
        })),
        lowStockProducts: lowStockProducts.map(item => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            currentStock: toNumber(item.current_stock),
            minimumStock: toNumber(item.minimum_stock)
        })),
        outOfStockProducts: outOfStockProducts.map(item => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            currentStock: toNumber(item.current_stock)
        }))
    };
};

module.exports = {
    getSalesReport,
    getPurchaseReport,
    getPaymentReport,
    getInventoryReport
};