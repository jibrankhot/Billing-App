const asyncHandler = require('../utils/async-handler');

const inventoryService = require('../services/inventory.service');

const getStockOverview = asyncHandler(
    async (req, res) => {
        const overview =
            await inventoryService.getStockOverview();

        res.status(200).json(overview);
    }
);

const getLowStockProducts = asyncHandler(
    async (req, res) => {
        const products =
            await inventoryService.getLowStockProducts();

        res.status(200).json(products);
    }
);

const getStockMovements = asyncHandler(
    async (req, res) => {
        const productId = req.query.productId
            ? Number(req.query.productId)
            : null;

        const movements =
            await inventoryService.getStockMovements(
                productId
            );

        res.status(200).json(movements);
    }
);

const createStockAdjustment = asyncHandler(
    async (req, res) => {
        const userId =
            req.user?.id ||
            req.user?.userId ||
            null;

        const result =
            await inventoryService.createStockAdjustment(
                req.body,
                userId
            );

        res.status(201).json(result);
    }
);

module.exports = {
    getStockOverview,
    getLowStockProducts,
    getStockMovements,
    createStockAdjustment
};