const express = require('express');

const {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice
} = require('../controllers/invoice.controller');

const { authenticate } = require('../middleware/auth.middleware');

const {
    validateInvoice
} = require('../validators/invoice.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', getInvoices);

router.get('/:id', getInvoiceById);

router.post('/', validateInvoice, createInvoice);

router.put('/:id', validateInvoice, updateInvoice);

router.delete('/:id', deleteInvoice);

module.exports = router;