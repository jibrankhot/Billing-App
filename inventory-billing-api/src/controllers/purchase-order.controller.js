const asyncHandler = require('../utils/async-handler');

const purchaseOrderService = require('../services/purchase-order.service');

const getPurchaseOrders = asyncHandler(async (req, res) => {
    const orders = await purchaseOrderService.getPurchaseOrders();

    res.status(200).json(orders);
});

const getPurchaseOrderById = asyncHandler(async (req, res) => {
    const order = await purchaseOrderService.getPurchaseOrderById(
        Number(req.params.id)
    );

    res.status(200).json(order);
});

const createPurchaseOrder = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?.userId || null;

    const order = await purchaseOrderService.createPurchaseOrder(
        req.body,
        userId
    );

    res.status(201).json(order);
});

const updatePurchaseOrder = asyncHandler(async (req, res) => {
    const order = await purchaseOrderService.updatePurchaseOrder(
        Number(req.params.id),
        req.body
    );

    res.status(200).json(order);
});

const deletePurchaseOrder = asyncHandler(async (req, res) => {
    await purchaseOrderService.deletePurchaseOrder(
        Number(req.params.id)
    );

    res.status(200).json(true);
});

module.exports = {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
};