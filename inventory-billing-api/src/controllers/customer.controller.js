const customerService = require('../services/customer.service');

const getCustomers = async (req, res) => {
    try {
        const customers = await customerService.getCustomers();

        return res.status(200).json(customers);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customer = await customerService.getCustomerById(
            Number(req.params.id)
        );

        return res.status(200).json(customer);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const createCustomer = async (req, res) => {
    try {
        const customer =
            await customerService.createCustomer(req.body);

        return res.status(201).json(customer);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const customer =
            await customerService.updateCustomer(
                Number(req.params.id),
                req.body
            );

        return res.status(200).json(customer);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        await customerService.deleteCustomer(
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
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
};