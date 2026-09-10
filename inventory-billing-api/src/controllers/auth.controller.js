const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/api-response');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await authService.login(username, password);

        return successResponse(
            res,
            result,
            'Login successful'
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            401
        );
    }
};

const me = async (req, res) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);

        return successResponse(
            res,
            user,
            'User retrieved successfully'
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            404
        );
    }
};

module.exports = {
    login,
    me
};