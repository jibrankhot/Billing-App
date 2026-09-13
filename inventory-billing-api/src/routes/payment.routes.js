const express = require('express');

const {
    getPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment
} = require('../controllers/payment.controller');

const { authenticate } = require('../middleware/auth.middleware');

const {
    validatePayment
} = require('../validators/payment.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', getPayments);

router.get('/:id', getPaymentById);

router.post('/', validatePayment, createPayment);

router.put('/:id', validatePayment, updatePayment);

router.delete('/:id', deletePayment);

module.exports = router;