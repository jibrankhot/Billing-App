const express = require('express');

const {
    getSalesReport,
    getPurchaseReport,
    getPaymentReport,
    getInventoryReport
} = require('../controllers/report.controller');

const {
    authenticate
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/sales', getSalesReport);
router.get('/purchases', getPurchaseReport);
router.get('/payments', getPaymentReport);
router.get('/inventory', getInventoryReport);

module.exports = router;