const validateUserCreate = (req, res, next) => {
    const {
        username,
        password,
        fullName,
        email,
        phone,
        roleId,
        isActive
    } = req.body;

    const errors = [];

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
        errors.push('Username must be at least 3 characters');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
        errors.push('Full name is required');
    }

    if (email && typeof email !== 'string') {
        errors.push('Email must be a valid string');
    }

    if (phone && typeof phone !== 'string') {
        errors.push('Phone must be a valid string');
    }

    if (roleId !== undefined && (!Number.isInteger(Number(roleId)) || Number(roleId) <= 0)) {
        errors.push('Role ID must be a positive integer');
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
        errors.push('isActive must be a boolean');
    }

    if (errors.length > 0) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};


const validateUserUpdate = (req, res, next) => {
    const {
        username,
        password,
        fullName,
        email,
        phone,
        roleId,
        isActive
    } = req.body;

    const errors = [];

    if (
        username !== undefined &&
        (typeof username !== 'string' || username.trim().length < 3)
    ) {
        errors.push('Username must be at least 3 characters');
    }

    if (
        password !== undefined &&
        (typeof password !== 'string' || password.length < 6)
    ) {
        errors.push('Password must be at least 6 characters');
    }

    if (
        fullName !== undefined &&
        (typeof fullName !== 'string' || !fullName.trim())
    ) {
        errors.push('Full name is required');
    }

    if (email !== undefined && email !== null && typeof email !== 'string') {
        errors.push('Email must be a valid string');
    }

    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
        errors.push('Phone must be a valid string');
    }

    if (
        roleId !== undefined &&
        (!Number.isInteger(Number(roleId)) || Number(roleId) <= 0)
    ) {
        errors.push('Role ID must be a positive integer');
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
        errors.push('isActive must be a boolean');
    }

    if (errors.length > 0) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};


module.exports = {
    validateUserCreate,
    validateUserUpdate
};