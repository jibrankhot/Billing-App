const validateSalesReturn = (req, res, next) => {
    const {
        returnNumber,
        invoiceId,
        returnDate,
        status,
        items
    } = req.body;

    if (!returnNumber || !String(returnNumber).trim()) {
        return res.status(422).json({
            message: 'Return number is required'
        });
    }

    if (!invoiceId || Number(invoiceId) <= 0) {
        return res.status(422).json({
            message: 'Valid invoice is required'
        });
    }

    if (!returnDate) {
        return res.status(422).json({
            message: 'Return date is required'
        });
    }

    const allowedStatuses = [
        'draft',
        'approved',
        'completed',
        'cancelled'
    ];

    if (status && !allowedStatuses.includes(status)) {
        return res.status(422).json({
            message: 'Invalid sales return status'
        });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(422).json({
            message: 'At least one return item is required'
        });
    }

    for (const item of items) {
        if (!item.productId || Number(item.productId) <= 0) {
            return res.status(422).json({
                message: 'Each return item must have a valid product'
            });
        }

        if (Number(item.quantity) <= 0) {
            return res.status(422).json({
                message: 'Return quantity must be greater than zero'
            });
        }

        if (Number(item.unitPrice) < 0) {
            return res.status(422).json({
                message: 'Unit price cannot be negative'
            });
        }

        if (Number(item.taxRate || 0) < 0) {
            return res.status(422).json({
                message: 'Tax rate cannot be negative'
            });
        }
    }

    next();
};

module.exports = {
    validateSalesReturn
};