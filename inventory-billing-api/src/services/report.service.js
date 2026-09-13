const supabase = require('../config/database');

const getSalesReport = async (fromDate, toDate) => {
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

    if (fromDate) {
        query = query.gte('invoice_date', fromDate);
    }

    if (toDate) {
        query = query.lte('invoice_date', toDate);
    }

    const { data: invoices, error } = await query;

    if (error) throw error;

    const invoiceList = invoices || [];

    const totalSales = invoiceList.reduce(
        (total, invoice) =>
            total + Number(invoice.total_amount || 0),
        0
    );

    const totalTax = invoiceList.reduce(
        (total, invoice) =>
            total + Number(invoice.tax_amount || 0),
        0
    );

    const totalDiscount = invoiceList.reduce(
        (total, invoice) =>
            total + Number(invoice.discount_amount || 0),
        0
    );

    return {
        invoices: invoiceList.map(invoice => ({
            id: invoice.id,
            invoiceNumber: invoice.invoice_number,
            invoiceDate: invoice.invoice_date,
            customerId: invoice.customer_id,
            subtotal: Number(invoice.subtotal || 0),
            taxAmount: Number(invoice.tax_amount || 0),
            discountAmount: Number(invoice.discount_amount || 0),
            totalAmount: Number(invoice.total_amount || 0),
            status: invoice.status
        })),
        totalInvoices: invoiceList.length,
        totalSales,
        totalTax,
        totalDiscount
    };
};

const getPurchaseReport = async (fromDate, toDate) => {
    let query = supabase
        .from('purchase_orders')
        .select(`
            id,
            order_number,
            order_date,
            supplier_id,
            subtotal,
            tax_amount,
            total_amount,
            status
        `)
        .order('order_date', { ascending: false });

    if (fromDate) {
        query = query.gte('order_date', fromDate);
    }

    if (toDate) {
        query = query.lte('order_date', toDate);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    const orderList = orders || [];

    const totalPurchases = orderList.reduce(
        (total, order) =>
            total + Number(order.total_amount || 0),
        0
    );

    const totalTax = orderList.reduce(
        (total, order) =>
            total + Number(order.tax_amount || 0),
        0
    );

    return {
        orders: orderList.map(order => ({
            id: order.id,
            orderNumber: order.order_number,
            orderDate: order.order_date,
            supplierId: order.supplier_id,
            subtotal: Number(order.subtotal || 0),
            taxAmount: Number(order.tax_amount || 0),
            totalAmount: Number(order.total_amount || 0),
            status: order.status
        })),
        totalOrders: orderList.length,
        totalPurchases,
        totalTax
    };
};

const getPaymentReport = async (fromDate, toDate) => {
    let query = supabase
        .from('payments')
        .select(`
            id,
            invoice_id,
            payment_date,
            amount,
            payment_method,
            reference_number
        `)
        .order('payment_date', { ascending: false });

    if (fromDate) {
        query = query.gte('payment_date', fromDate);
    }

    if (toDate) {
        query = query.lte('payment_date', toDate);
    }

    const { data: payments, error } = await query;

    if (error) throw error;

    const paymentList = payments || [];

    const totalPayments = paymentList.reduce(
        (total, payment) =>
            total + Number(payment.amount || 0),
        0
    );

    return {
        payments: paymentList.map(payment => ({
            id: payment.id,
            invoiceId: payment.invoice_id,
            paymentDate: payment.payment_date,
            amount: Number(payment.amount || 0),
            paymentMethod: payment.payment_method,
            referenceNumber: payment.reference_number
        })),
        totalPayments,
        totalTransactions: paymentList.length
    };
};

const getInventoryReport = async () => {
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            id,
            sku,
            name,
            category_id,
            unit,
            purchase_price,
            selling_price,
            tax_rate,
            current_stock,
            minimum_stock,
            is_active
        `)
        .order('name');

    if (error) throw error;

    const productList = products || [];

    const totalStock = productList.reduce(
        (total, product) =>
            total + Number(product.current_stock || 0),
        0
    );

    const inventoryValue = productList.reduce(
        (total, product) =>
            total +
            Number(product.current_stock || 0) *
            Number(product.purchase_price || 0),
        0
    );

    const lowStockProducts = productList.filter(
        product =>
            Number(product.current_stock || 0) <=
            Number(product.minimum_stock || 0)
    );

    const outOfStockProducts = productList.filter(
        product =>
            Number(product.current_stock || 0) <= 0
    );

    return {
        products: productList.map(product => ({
            id: product.id,
            sku: product.sku,
            name: product.name,
            categoryId: product.category_id,
            unit: product.unit,
            purchasePrice: Number(product.purchase_price || 0),
            sellingPrice: Number(product.selling_price || 0),
            taxRate: Number(product.tax_rate || 0),
            currentStock: Number(product.current_stock || 0),
            minimumStock: Number(product.minimum_stock || 0),
            isActive: product.is_active
        })),
        totalProducts: productList.length,
        totalStock,
        inventoryValue,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length
    };
};

module.exports = {
    getSalesReport,
    getPurchaseReport,
    getPaymentReport,
    getInventoryReport
};