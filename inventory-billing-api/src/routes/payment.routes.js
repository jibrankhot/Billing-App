const express = require('express');

const {
    getPayments,
    getPaymentById,
    createPayment,
    deletePayment
} = require('../controllers/payment.controller');

const {
    validatePayment
} = require('../validators/payment.validator');

const {
    authenticate
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getPayments);

router.get('/:id', getPaymentById);

router.post(
    '/',
    validatePayment,
    createPayment
);

router.delete('/:id', deletePayment);

module.exports = router;