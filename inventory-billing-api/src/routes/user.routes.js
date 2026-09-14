const express = require('express');

const {
    getUsers,
    getUserById,
    getRoles,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/user.controller');

const {
    validateUserCreate,
    validateUserUpdate
} = require('../validators/user.validator');

const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getUsers);

router.get('/roles', getRoles);

router.get('/:id', getUserById);

router.post('/', validateUserCreate, createUser);

router.put('/:id', validateUserUpdate, updateUser);

router.delete('/:id', deleteUser);

module.exports = router;