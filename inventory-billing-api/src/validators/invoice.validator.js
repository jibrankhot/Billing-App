const validateInvoice = (req, res, next) => {
    const {
        invoiceNumber,
        customerId,
        invoiceDate,
        dueDate,
        status,
        items
    } = req.body;

    if (!invoiceNumber || !String(invoiceNumber).trim()) {
        return res.status(422).json({
            message: 'Invoice number is required'
        });
    }

    if (!customerId || Number(customerId) <= 0) {
        return res.status(422).json({
            message: 'Valid customer is required'
        });
    }

    if (!invoiceDate) {
        return res.status(422).json({
            message: 'Invoice date is required'
        });
    }

    if (dueDate && new Date(dueDate) < new Date(invoiceDate)) {
        return res.status(422).json({
            message: 'Due date cannot be before invoice date'
        });
    }

    const allowedStatuses = [
        'draft',
        'sent',
        'partially_paid',
        'paid',
        'overdue',
        'cancelled'
    ];

    if (status && !allowedStatuses.includes(status)) {
        return res.status(422).json({
            message: 'Invalid invoice status'
        });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(422).json({
            message: 'At least one invoice item is required'
        });
    }

    for (const item of items) {
        if (!item.productId || Number(item.productId) <= 0) {
            return res.status(422).json({
                message: 'Each invoice item must have a valid product'
            });
        }

        if (Number(item.quantity) <= 0) {
            return res.status(422).json({
                message: 'Invoice item quantity must be greater than zero'
            });
        }

        if (Number(item.unitPrice) < 0) {
            return res.status(422).json({
                message: 'Invoice item unit price cannot be negative'
            });
        }

        if (Number(item.taxRate) < 0) {
            return res.status(422).json({
                message: 'Invoice item tax rate cannot be negative'
            });
        }

        if (Number(item.discountAmount || 0) < 0) {
            return res.status(422).json({
                message: 'Item discount cannot be negative'
            });
        }
    }

    next();
};

module.exports = {
    validateInvoice
};