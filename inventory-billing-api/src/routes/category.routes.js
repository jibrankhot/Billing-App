const express = require('express');

const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateCategory } = require('../validators/category.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', categoryController.getCategories);

router.get('/:id', categoryController.getCategoryById);

router.post(
    '/',
    validateCategory,
    categoryController.createCategory
);

router.put(
    '/:id',
    validateCategory,
    categoryController.updateCategory
);

router.delete(
    '/:id',
    categoryController.deleteCategory
);

module.exports = router;