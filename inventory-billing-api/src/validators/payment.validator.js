const validatePayment = (req, res, next) => {
    const {
        invoiceId,
        paymentDate,
        amount,
        paymentMethod
    } = req.body;

    const errors = [];

    if (
        invoiceId === undefined ||
        invoiceId === null ||
        Number.isNaN(Number(invoiceId))
    ) {
        errors.push('Invoice is required');
    }

    if (!paymentDate) {
        errors.push('Payment date is required');
    }

    if (
        amount === undefined ||
        amount === null ||
        Number.isNaN(Number(amount)) ||
        Number(amount) <= 0
    ) {
        errors.push(
            'Payment amount must be greater than zero'
        );
    }

    const allowedMethods = [
        'cash',
        'card',
        'upi',
        'bank_transfer',
        'cheque',
        'other'
    ];

    if (
        !paymentMethod ||
        !allowedMethods.includes(
            String(paymentMethod).toLowerCase()
        )
    ) {
        errors.push(
            `Payment method must be one of: ${allowedMethods.join(', ')}`
        );
    }

    if (errors.length > 0) {
        return res.status(422).json({
            message: 'Validation failed',
            errors
        });
    }

    next();
};

module.exports = {
    validatePayment
};