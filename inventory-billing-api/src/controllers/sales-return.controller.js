const asyncHandler = require('../utils/async-handler');

const salesReturnService = require('../services/sales-return.service');

const getSalesReturns = asyncHandler(async (req, res) => {
    const returns = await salesReturnService.getSalesReturns();

    res.status(200).json(returns);
});

const getSalesReturnById = asyncHandler(async (req, res) => {
    const returnRecord =
        await salesReturnService.getSalesReturnById(
            Number(req.params.id)
        );

    res.status(200).json(returnRecord);
});

const createSalesReturn = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?.userId || null;

    const returnRecord =
        await salesReturnService.createSalesReturn(
            req.body,
            userId
        );

    res.status(201).json(returnRecord);
});

const updateSalesReturn = asyncHandler(async (req, res) => {
    const returnRecord =
        await salesReturnService.updateSalesReturn(
            Number(req.params.id),
            req.body
        );

    res.status(200).json(returnRecord);
});

const deleteSalesReturn = asyncHandler(async (req, res) => {
    await salesReturnService.deleteSalesReturn(
        Number(req.params.id)
    );

    res.status(200).json(true);
});

module.exports = {
    getSalesReturns,
    getSalesReturnById,
    createSalesReturn,
    updateSalesReturn,
    deleteSalesReturn
};