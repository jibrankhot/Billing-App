const express = require('express');

const {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
} = require('../controllers/purchase-order.controller');

const { validatePurchaseOrder } = require('../validators/purchase-order.validator');

const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getPurchaseOrders);

router.get('/:id', getPurchaseOrderById);

router.post(
    '/',
    validatePurchaseOrder,
    createPurchaseOrder
);

router.put(
    '/:id',
    validatePurchaseOrder,
    updatePurchaseOrder
);

router.delete('/:id', deletePurchaseOrder);

module.exports = router;