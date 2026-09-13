const express = require('express');

const {
    getCompanySettings,
    updateCompanySettings,
    getInvoiceSettings,
    updateInvoiceSettings,
    getTaxSettings,
    updateTaxSettings
} = require('../controllers/settings.controller');

const {
    authenticate
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/company', getCompanySettings);
router.put('/company', updateCompanySettings);

router.get('/invoice', getInvoiceSettings);
router.put('/invoice', updateInvoiceSettings);

router.get('/tax', getTaxSettings);
router.put('/tax', updateTaxSettings);

module.exports = router;