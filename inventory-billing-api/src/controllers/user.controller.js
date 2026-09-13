const asyncHandler = require('../utils/async-handler');
const userService = require('../services/user.service');

const getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getUsers();

    res.status(200).json(users);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(
        Number(req.params.id)
    );

    res.status(200).json(user);
});

const createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(
        req.body
    );

    res.status(201).json(user);
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(
        Number(req.params.id),
        req.body
    );

    res.status(200).json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
    const result = await userService.deleteUser(
        Number(req.params.id)
    );

    res.status(200).json(result);
});

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};