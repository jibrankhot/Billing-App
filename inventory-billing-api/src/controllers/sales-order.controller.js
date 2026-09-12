const asyncHandler = require('../utils/async-handler');

const salesOrderService = require('../services/sales-order.service');

const getSalesOrders = asyncHandler(async (req, res) => {
    const orders = await salesOrderService.getSalesOrders();

    res.status(200).json(orders);
});

const getSalesOrderById = asyncHandler(async (req, res) => {
    const order = await salesOrderService.getSalesOrderById(
        Number(req.params.id)
    );

    res.status(200).json(order);
});

const createSalesOrder = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?.userId || null;

    const order = await salesOrderService.createSalesOrder(
        req.body,
        userId
    );

    res.status(201).json(order);
});

const updateSalesOrder = asyncHandler(async (req, res) => {
    const order = await salesOrderService.updateSalesOrder(
        Number(req.params.id),
        req.body
    );

    res.status(200).json(order);
});

const deleteSalesOrder = asyncHandler(async (req, res) => {
    await salesOrderService.deleteSalesOrder(
        Number(req.params.id)
    );

    res.status(200).json(true);
});

module.exports = {
    getSalesOrders,
    getSalesOrderById,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder
};