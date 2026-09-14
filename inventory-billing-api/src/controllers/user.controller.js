const asyncHandler = require('../utils/async-handler');

const userService = require('../services/user.service');


const getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getUsers();

    res.status(200).json(users);
});


const getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json(user);
});


const getRoles = asyncHandler(async (req, res) => {
    const roles = await userService.getRoles();

    res.status(200).json(roles);
});


const createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);

    res.status(201).json(user);
});


const updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(
        req.params.id,
        req.body
    );

    res.status(200).json(user);
});


const deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);

    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    });
});


module.exports = {
    getUsers,
    getUserById,
    getRoles,
    createUser,
    updateUser,
    deleteUser
};