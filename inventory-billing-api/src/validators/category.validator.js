const validateCategory = (req, res, next) => {
    const { name, description, isActive } = req.body || {};

    if (req.method === 'POST' && (!name || typeof name !== 'string' || !name.trim())) {
        return res.status(422).json({
            success: false,
            message: 'Category name is required'
        });
    }

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        return res.status(422).json({
            success: false,
            message: 'Category name must be a valid string'
        });
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
        return res.status(422).json({
            success: false,
            message: 'Description must be a string'
        });
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
        return res.status(422).json({
            success: false,
            message: 'isActive must be a boolean'
        });
    }

    next();
};

module.exports = {
    validateCategory
};