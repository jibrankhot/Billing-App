const categoryService = require('../services/category.service');

const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();

        return res.status(200).json(categories);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(
            Number(req.params.id)
        );

        return res.status(200).json(category);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);

        return res.status(201).json(category);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(
            Number(req.params.id),
            req.body
        );

        return res.status(200).json(category);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(
            Number(req.params.id)
        );

        return res.status(200).json(true);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};