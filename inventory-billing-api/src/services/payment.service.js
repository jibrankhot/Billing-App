const supabase = require('../config/database');

const mapPayment = (payment, invoice = null) => ({
    id: payment.id,
    paymentNumber: payment.payment_number,
    invoiceId: payment.invoice_id,
    invoiceNumber: invoice?.invoice_number || '',
    customerId: invoice?.customer_id || null,
    customerName: invoice?.customer?.name || '',
    paymentDate: payment.payment_date,
    amount: Number(payment.amount),
    paymentMethod: payment.payment_method,
    referenceNumber: payment.reference_number,
    notes: payment.notes,
    createdBy: payment.created_by,
    createdAt: payment.created_at,
    updatedAt: payment.updated_at
});

const getInvoice = async (invoiceId) => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            id,
            invoice_number,
            customer_id,
            total_amount,
            paid_amount,
            balance_amount,
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

const updateInvoicePaymentTotals = async (
    invoiceId,
    paidAmount,
    invoiceTotal,
    originalStatus
) => {
    const roundedPaid = Math.round(paidAmount * 100) / 100;
    const roundedTotal = Math.round(invoiceTotal * 100) / 100;
    const balanceAmount = Math.max(
        Math.round((roundedTotal - roundedPaid) * 100) / 100,
        0
    );

    let status = originalStatus;

    if (status !== 'cancelled') {
        if (roundedPaid <= 0) {
            status = 'draft';
        } else if (balanceAmount <= 0) {
            status = 'paid';
        } else if (roundedPaid > 0) {
            status = 'partially_paid';
        }
    }

    const { data, error } = await supabase
        .from('invoices')
        .update({
            paid_amount: roundedPaid,
            balance_amount: balanceAmount,
            status
        })
        .eq('id', invoiceId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

const getPayments = async () => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        throw error;
    }

    const payments = data || [];

    if (payments.length === 0) {
        return [];
    }

    const invoiceIds = [
        ...new Set(payments.map((payment) => payment.invoice_id))
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
                customer: customerMap.get(invoice.customer_id) || null
            }
        ])
    );

    return payments.map((payment) =>
        mapPayment(
            payment,
            invoiceMap.get(payment.invoice_id)
        )
    );
};

const getPaymentById = async (id) => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
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

    const invoice = await getInvoice(data.invoice_id);

    return mapPayment(data, invoice);
};

const createPayment = async (paymentData, userId) => {
    const invoice = await getInvoice(Number(paymentData.invoiceId));

    if (invoice.status === 'cancelled') {
        const err = new Error(
            'Cannot record payment for a cancelled invoice'
        );
        err.statusCode = 409;
        throw err;
    }

    if (invoice.status === 'paid') {
        const err = new Error(
            'Invoice is already fully paid'
        );
        err.statusCode = 409;
        throw err;
    }

    const amount = Number(paymentData.amount);
    const currentPaid = Number(invoice.paid_amount || 0);
    const totalAmount = Number(invoice.total_amount || 0);

    if (currentPaid + amount > totalAmount) {
        const err = new Error(
            'Payment amount cannot exceed the invoice balance'
        );
        err.statusCode = 409;
        throw err;
    }

    const paymentPayload = {
        payment_number: String(paymentData.paymentNumber).trim(),
        invoice_id: Number(paymentData.invoiceId),
        payment_date: paymentData.paymentDate,
        amount,
        payment_method: paymentData.paymentMethod
            ? String(paymentData.paymentMethod).toLowerCase()
            : 'cash',
        reference_number: paymentData.referenceNumber || null,
        notes: paymentData.notes || null,
        created_by: userId
    };

    const { data: payment, error } = await supabase
        .from('payments')
        .insert(paymentPayload)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error(
                'Payment number already exists'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    try {
        const updatedInvoice = await updateInvoicePaymentTotals(
            invoice.id,
            currentPaid + amount,
            totalAmount,
            invoice.status
        );

        return mapPayment(payment, {
            ...updatedInvoice,
            customer: invoice.customer
        });
    } catch (error) {
        await supabase
            .from('payments')
            .delete()
            .eq('id', payment.id);

        throw error;
    }
};

const updatePayment = async (id, paymentData) => {
    const existingPayment = await getPaymentById(id);

    const oldInvoice = await getInvoice(existingPayment.invoiceId);

    if (oldInvoice.status === 'cancelled') {
        const err = new Error(
            'Cannot update a payment for a cancelled invoice'
        );
        err.statusCode = 409;
        throw err;
    }

    const newInvoiceId = Number(paymentData.invoiceId);
    const newAmount = Number(paymentData.amount);

    const newInvoice = await getInvoice(newInvoiceId);

    if (newInvoice.status === 'cancelled') {
        const err = new Error(
            'Cannot move payment to a cancelled invoice'
        );
        err.statusCode = 409;
        throw err;
    }

    const oldAmount = Number(existingPayment.amount);

    let newPaidAmount;

    if (oldInvoice.id === newInvoice.id) {
        newPaidAmount =
            Number(oldInvoice.paid_amount || 0) -
            oldAmount +
            newAmount;

        if (newPaidAmount > Number(newInvoice.total_amount)) {
            const err = new Error(
                'Payment amount cannot exceed the invoice balance'
            );
            err.statusCode = 409;
            throw err;
        }
    } else {
        newPaidAmount =
            Number(newInvoice.paid_amount || 0) +
            newAmount;

        if (newPaidAmount > Number(newInvoice.total_amount)) {
            const err = new Error(
                'Payment amount cannot exceed the invoice balance'
            );
            err.statusCode = 409;
            throw err;
        }
    }

    const { data: payment, error } = await supabase
        .from('payments')
        .update({
            payment_number: String(paymentData.paymentNumber).trim(),
            invoice_id: newInvoiceId,
            payment_date: paymentData.paymentDate,
            amount: newAmount,
            payment_method: paymentData.paymentMethod
                ? String(paymentData.paymentMethod).toLowerCase()
                : 'cash',
            reference_number: paymentData.referenceNumber || null,
            notes: paymentData.notes || null
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            const err = new Error(
                'Payment number already exists'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    try {
        if (oldInvoice.id !== newInvoice.id) {
            await updateInvoicePaymentTotals(
                oldInvoice.id,
                Math.max(
                    Number(oldInvoice.paid_amount || 0) - oldAmount,
                    0
                ),
                Number(oldInvoice.total_amount),
                oldInvoice.status
            );

            await updateInvoicePaymentTotals(
                newInvoice.id,
                newPaidAmount,
                Number(newInvoice.total_amount),
                newInvoice.status
            );
        } else {
            await updateInvoicePaymentTotals(
                newInvoice.id,
                newPaidAmount,
                Number(newInvoice.total_amount),
                newInvoice.status
            );
        }
    } catch (error) {
        throw error;
    }

    const updatedInvoice = await getInvoice(newInvoice.id);

    return mapPayment(payment, updatedInvoice);
};

const deletePayment = async (id) => {
    const existingPayment = await getPaymentById(id);

    const invoice = await getInvoice(existingPayment.invoiceId);

    if (invoice.status === 'cancelled') {
        const err = new Error(
            'Cannot delete a payment for a cancelled invoice'
        );
        err.statusCode = 409;
        throw err;
    }

    const amount = Number(existingPayment.amount);
    const currentPaid = Number(invoice.paid_amount || 0);

    const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') {
            const err = new Error(
                'Payment cannot be deleted because it is referenced by another record'
            );
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    try {
        await updateInvoicePaymentTotals(
            invoice.id,
            Math.max(currentPaid - amount, 0),
            Number(invoice.total_amount),
            invoice.status
        );
    } catch (error) {
        throw error;
    }

    return true;
};

module.exports = {
    getPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment
};