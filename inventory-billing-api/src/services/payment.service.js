const supabase = require('../config/database');

const mapPayment = (payment, invoice = null, customer = null) => ({
    id: payment.id,
    invoiceId: payment.invoice_id,
    invoiceNumber: invoice?.invoice_number || '',
    customerId: invoice?.customer_id || null,
    customerName: customer?.name || '',
    paymentDate: payment.payment_date,
    amount: Number(payment.amount || 0),
    paymentMethod: payment.payment_method,
    referenceNumber: payment.reference_number,
    notes: payment.notes,
    createdBy: payment.created_by,
    createdAt: payment.created_at,
    updatedAt: payment.updated_at
});

const getPayments = async () => {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            invoice:invoices(
                invoice_number,
                customer_id
            )
        `)
        .order('payment_date', {
            ascending: false
        })
        .order('created_at', {
            ascending: false
        });

    if (error) {
        throw error;
    }

    const payments = data || [];

    const customerIds = [
        ...new Set(
            payments
                .map(payment => payment.invoice?.customer_id)
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

        if (customerError) {
            throw customerError;
        }

        customers = customerData || [];
    }

    const customerMap = new Map(
        customers.map(customer => [
            customer.id,
            customer
        ])
    );

    return payments.map(payment =>
        mapPayment(
            payment,
            payment.invoice,
            customerMap.get(
                payment.invoice?.customer_id
            )
        )
    );
};

const getPaymentById = async (id) => {
    const { data, error } = await supabase
        .from('payments')
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
            const err = new Error('Payment not found');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    let customer = null;

    if (data.invoice?.customer_id) {
        const { data: customerData, error: customerError } =
            await supabase
                .from('customers')
                .select('id, name')
                .eq('id', data.invoice.customer_id)
                .single();

        if (customerError && customerError.code !== 'PGRST116') {
            throw customerError;
        }

        customer = customerData;
    }

    return mapPayment(
        data,
        data.invoice,
        customer
    );
};

const getInvoice = async (invoiceId) => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            id,
            invoice_number,
            customer_id,
            total_amount
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

    return data;
};

const getExistingPaymentTotal = async (invoiceId) => {
    const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('invoice_id', invoiceId);

    if (error) {
        throw error;
    }

    return (data || []).reduce(
        (total, payment) =>
            total + Number(payment.amount || 0),
        0
    );
};

const createPayment = async (
    paymentData,
    userId
) => {
    const invoiceId = Number(
        paymentData.invoiceId
    );

    const amount = Number(
        paymentData.amount
    );

    if (!Number.isFinite(amount) || amount <= 0) {
        const err = new Error(
            'Payment amount must be greater than zero'
        );
        err.statusCode = 422;
        throw err;
    }

    const invoice = await getInvoice(invoiceId);

    const existingPaid =
        await getExistingPaymentTotal(invoiceId);

    const invoiceTotal =
        Number(invoice.total_amount || 0);

    const remaining =
        invoiceTotal - existingPaid;

    if (amount > remaining + 0.01) {
        const err = new Error(
            `Payment exceeds the remaining invoice balance of ${remaining.toFixed(2)}`
        );
        err.statusCode = 409;
        throw err;
    }

    const paymentPayload = {
        invoice_id: invoiceId,
        payment_date:
            paymentData.paymentDate ||
            new Date().toISOString().split('T')[0],
        amount,
        payment_method:
            paymentData.paymentMethod,
        reference_number:
            paymentData.referenceNumber ||
            null,
        notes:
            paymentData.notes ||
            null,
        created_by: userId
    };

    const { data, error } = await supabase
        .from('payments')
        .insert(paymentPayload)
        .select()
        .single();

    if (error) {
        if (error.code === '23503') {
            const err = new Error(
                'Invalid invoice or user'
            );
            err.statusCode = 400;
            throw err;
        }

        throw error;
    }

    return getPaymentById(data.id);
};

const deletePayment = async (id) => {
    const existingPayment =
        await getPaymentById(id);

    const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

    if (error) {
        throw error;
    }

    return {
        success: true,
        id: existingPayment.id
    };
};

module.exports = {
    getPayments,
    getPaymentById,
    createPayment,
    deletePayment
};