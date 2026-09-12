const express = require('express');

const {
    getSalesOrders,
    getSalesOrderById,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder
} = require('../controllers/sales-order.controller');

const { validateSalesOrder } = require('../validators/sales-order.validator');

const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getSalesOrders);

router.get('/:id', getSalesOrderById);

router.post(
    '/',
    validateSalesOrder,
    createSalesOrder
);

router.put(
    '/:id',
    validateSalesOrder,
    updateSalesOrder
);

router.delete('/:id', deleteSalesOrder);

module.exports = router;