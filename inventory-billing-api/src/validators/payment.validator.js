const validatePayment = (req, res, next) => {
    const {
        paymentNumber,
        invoiceId,
        paymentDate,
        amount,
        paymentMethod
    } = req.body;

    if (!paymentNumber || !String(paymentNumber).trim()) {
        return res.status(422).json({
            message: 'Payment number is required'
        });
    }

    if (!invoiceId || Number(invoiceId) <= 0) {
        return res.status(422).json({
            message: 'Valid invoice is required'
        });
    }

    if (!paymentDate) {
        return res.status(422).json({
            message: 'Payment date is required'
        });
    }

    if (Number(amount) <= 0) {
        return res.status(422).json({
            message: 'Payment amount must be greater than zero'
        });
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
        paymentMethod &&
        !allowedMethods.includes(String(paymentMethod).toLowerCase())
    ) {
        return res.status(422).json({
            message: 'Invalid payment method'
        });
    }

    next();
};

module.exports = {
    validatePayment
};