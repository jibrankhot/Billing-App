const validateUser = (req, res, next) => {
    const {
        username,
        fullName,
        email,
        password,
        roleId
    } = req.body;

    const errors = [];

    if (!username || !String(username).trim()) {
        errors.push('Username is required');
    }

    if (!fullName || !String(fullName).trim()) {
        errors.push('Full name is required');
    }

    if (!email || !String(email).trim()) {
        errors.push('Email is required');
    }

    if (
        password !== undefined &&
        password !== null &&
        String(password).length > 0 &&
        String(password).length < 6
    ) {
        errors.push(
            'Password must be at least 6 characters'
        );
    }

    if (
        roleId !== undefined &&
        roleId !== null &&
        Number.isNaN(Number(roleId))
    ) {
        errors.push('Invalid role');
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
    validateUser
};