const validateSalesReturn = (req, res, next) => {
    const {
        invoiceId,
        returnDate,
        reason,
        items
    } = req.body;

    const errors = [];

    if (
        invoiceId === undefined ||
        invoiceId === null ||
        Number.isNaN(Number(invoiceId))
    ) {
        errors.push('Invoice is required');
    }

    if (!returnDate) {
        errors.push('Return date is required');
    }

    if (!reason || !String(reason).trim()) {
        errors.push('Return reason is required');
    }

    if (!Array.isArray(items) || items.length === 0) {
        errors.push('At least one return item is required');
    } else {
        items.forEach((item, index) => {
            if (
                item.productId === undefined ||
                item.productId === null ||
                Number.isNaN(Number(item.productId))
            ) {
                errors.push(
                    `Item ${index + 1}: product is required`
                );
            }

            if (
                item.quantity === undefined ||
                item.quantity === null ||
                Number.isNaN(Number(item.quantity)) ||
                Number(item.quantity) <= 0
            ) {
                errors.push(
                    `Item ${index + 1}: quantity must be greater than zero`
                );
            }

            if (
                item.unitPrice === undefined ||
                item.unitPrice === null ||
                Number.isNaN(Number(item.unitPrice)) ||
                Number(item.unitPrice) < 0
            ) {
                errors.push(
                    `Item ${index + 1}: unit price cannot be negative`
                );
            }

            if (
                item.taxRate === undefined ||
                item.taxRate === null ||
                Number.isNaN(Number(item.taxRate)) ||
                Number(item.taxRate) < 0 ||
                Number(item.taxRate) > 100
            ) {
                errors.push(
                    `Item ${index + 1}: tax rate must be between 0 and 100`
                );
            }
        });
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
    validateSalesReturn
};