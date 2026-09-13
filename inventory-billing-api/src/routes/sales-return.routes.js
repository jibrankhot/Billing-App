const express = require('express');

const {
    getSalesReturns,
    getSalesReturnById,
    createSalesReturn,
    updateSalesReturnStatus,
    deleteSalesReturn
} = require('../controllers/sales-return.controller');

const {
    validateSalesReturn
} = require('../validators/sales-return.validator');

const {
    authenticate
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getSalesReturns);

router.get(
    '/:id',
    getSalesReturnById
);

router.post(
    '/',
    validateSalesReturn,
    createSalesReturn
);

router.patch(
    '/:id/status',
    updateSalesReturnStatus
);

router.delete(
    '/:id',
    deleteSalesReturn
);

module.exports = router;