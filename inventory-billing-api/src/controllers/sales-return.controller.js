const asyncHandler = require('../utils/async-handler');
const salesReturnService = require('../services/sales-return.service');

const getSalesReturns = asyncHandler(async (req, res) => {
    const salesReturns =
        await salesReturnService.getSalesReturns();

    res.status(200).json(salesReturns);
});

const getSalesReturnById = asyncHandler(async (req, res) => {
    const salesReturn =
        await salesReturnService.getSalesReturnById(
            Number(req.params.id)
        );

    res.status(200).json(salesReturn);
});

const createSalesReturn = asyncHandler(async (req, res) => {
    const userId =
        req.user?.id ||
        req.user?.userId ||
        null;

    const salesReturn =
        await salesReturnService.createSalesReturn(
            req.body,
            req.body.items,
            userId
        );

    res.status(201).json(salesReturn);
});

const updateSalesReturnStatus = asyncHandler(
    async (req, res) => {
        const salesReturn =
            await salesReturnService.updateSalesReturnStatus(
                Number(req.params.id),
                req.body.status
            );

        res.status(200).json(salesReturn);
    }
);

const deleteSalesReturn = asyncHandler(async (req, res) => {
    const result =
        await salesReturnService.deleteSalesReturn(
            Number(req.params.id)
        );

    res.status(200).json(result);
});

module.exports = {
    getSalesReturns,
    getSalesReturnById,
    createSalesReturn,
    updateSalesReturnStatus,
    deleteSalesReturn
};