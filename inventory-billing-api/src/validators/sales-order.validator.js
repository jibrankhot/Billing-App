const validateSalesOrder = (req, res, next) => {
    const {
        orderNumber,
        customerId,
        orderDate,
        status,
        items
    } = req.body;

    const errors = [];

    if (!orderNumber || !String(orderNumber).trim()) {
        errors.push('Order number is required.');
    } else if (String(orderNumber).length > 30) {
        errors.push('Order number cannot exceed 30 characters.');
    }

    if (!customerId || Number(customerId) <= 0) {
        errors.push('Valid customer is required.');
    }

    if (!orderDate) {
        errors.push('Order date is required.');
    }

    if (
        status !== undefined &&
        !['draft', 'confirmed', 'completed', 'cancelled'].includes(status)
    ) {
        errors.push('Invalid sales order status.');
    }

    if (!Array.isArray(items) || items.length === 0) {
        errors.push('At least one order item is required.');
    } else {
        items.forEach((item, index) => {
            if (!item.productId || Number(item.productId) <= 0) {
                errors.push(`Item ${index + 1}: valid product is required.`);
            }

            if (!item.quantity || Number(item.quantity) <= 0) {
                errors.push(`Item ${index + 1}: quantity must be greater than 0.`);
            }

            if (
                item.unitPrice === undefined ||
                item.unitPrice === null ||
                Number(item.unitPrice) < 0
            ) {
                errors.push(`Item ${index + 1}: valid unit price is required.`);
            }

            if (
                item.taxRate !== undefined &&
                Number(item.taxRate) < 0
            ) {
                errors.push(`Item ${index + 1}: tax rate cannot be negative.`);
            }
        });
    }

    if (errors.length > 0) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed.',
            errors
        });
    }

    next();
};

module.exports = {
    validateSalesOrder
};