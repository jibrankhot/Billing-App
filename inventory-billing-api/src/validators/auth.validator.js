const validateLogin = (req, res, next) => {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string') {
        return res.status(422).json({
            success: false,
            message: 'Username is required'
        });
    }

    if (!password || typeof password !== 'string') {
        return res.status(422).json({
            success: false,
            message: 'Password is required'
        });
    }

    next();
};

module.exports = {
    validateLogin
};