const validateProduct = (req, res, next) => {
    const body = req.body || {};

    const requiredFields = [
        'sku',
        'name',
        'categoryId'
    ];

    if (req.method === 'POST') {
        for (const field of requiredFields) {
            if (
                body[field] === undefined ||
                body[field] === null ||
                body[field] === ''
            ) {
                return res.status(422).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }
    }

    if (body.sku !== undefined && typeof body.sku !== 'string') {
        return res.status(422).json({
            success: false,
            message: 'SKU must be a string'
        });
    }

    if (body.name !== undefined && typeof body.name !== 'string') {
        return res.status(422).json({
            success: false,
            message: 'Product name must be a string'
        });
    }

    if (
        body.categoryId !== undefined &&
        (!Number.isInteger(Number(body.categoryId)) ||
            Number(body.categoryId) <= 0)
    ) {
        return res.status(422).json({
            success: false,
            message: 'categoryId must be a valid ID'
        });
    }

    const numericFields = [
        'purchasePrice',
        'sellingPrice',
        'taxRate',
        'currentStock',
        'minimumStock'
    ];

    for (const field of numericFields) {
        if (
            body[field] !== undefined &&
            (Number.isNaN(Number(body[field])) || Number(body[field]) < 0)
        ) {
            return res.status(422).json({
                success: false,
                message: `${field} must be a valid non-negative number`
            });
        }
    }

    if (
        body.isActive !== undefined &&
        typeof body.isActive !== 'boolean'
    ) {
        return res.status(422).json({
            success: false,
            message: 'isActive must be a boolean'
        });
    }

    next();
};

module.exports = {
    validateProduct
};