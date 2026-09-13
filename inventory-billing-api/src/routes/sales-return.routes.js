const express = require('express');

const {
    getSalesReturns,
    getSalesReturnById,
    createSalesReturn,
    updateSalesReturn,
    deleteSalesReturn
} = require('../controllers/sales-return.controller');

const { authenticate } = require('../middleware/auth.middleware');

const {
    validateSalesReturn
} = require('../validators/sales-return.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', getSalesReturns);

router.get('/:id', getSalesReturnById);

router.post('/', validateSalesReturn, createSalesReturn);

router.put('/:id', validateSalesReturn, updateSalesReturn);

router.delete('/:id', deleteSalesReturn);

module.exports = router;