const express = require('express');

const {
    getStockOverview,
    getLowStockProducts,
    getStockMovements,
    createStockAdjustment
} = require('../controllers/inventory.controller');

const {
    authenticate
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

/*
 * Stock overview
 * GET /api/inventory
 */
router.get('/', getStockOverview);

/*
 * Stock overview alias
 * GET /api/inventory/overview
 */
router.get('/overview', getStockOverview);

/*
 * Low stock products
 * GET /api/inventory/low-stock
 */
router.get(
    '/low-stock',
    getLowStockProducts
);

/*
 * Stock movements
 * GET /api/inventory/movements
 */
router.get(
    '/movements',
    getStockMovements
);

/*
 * Manual stock adjustment
 * POST /api/inventory/adjustment
 */
router.post(
    '/adjustment',
    createStockAdjustment
);

module.exports = router;