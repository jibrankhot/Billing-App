const supplierService = require('../services/supplier.service');

const getSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.getSuppliers();

        return res.status(200).json(suppliers);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const supplier = await supplierService.getSupplierById(
            Number(req.params.id)
        );

        return res.status(200).json(supplier);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const createSupplier = async (req, res) => {
    try {
        const supplier =
            await supplierService.createSupplier(req.body);

        return res.status(201).json(supplier);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const supplier =
            await supplierService.updateSupplier(
                Number(req.params.id),
                req.body
            );

        return res.status(200).json(supplier);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        await supplierService.deleteSupplier(
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
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};