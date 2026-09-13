const asyncHandler = require('../utils/async-handler');

const paymentService = require('../services/payment.service');

const getPayments = asyncHandler(
    async (req, res) => {
        const payments =
            await paymentService.getPayments();

        res.status(200).json(payments);
    }
);

const getPaymentById = asyncHandler(
    async (req, res) => {
        const payment =
            await paymentService.getPaymentById(
                Number(req.params.id)
            );

        res.status(200).json(payment);
    }
);

const createPayment = asyncHandler(
    async (req, res) => {
        const userId =
            req.user?.id ||
            req.user?.userId ||
            null;

        const payment =
            await paymentService.createPayment(
                req.body,
                userId
            );

        res.status(201).json(payment);
    }
);

const deletePayment = asyncHandler(
    async (req, res) => {
        const result =
            await paymentService.deletePayment(
                Number(req.params.id)
            );

        res.status(200).json(result);
    }
);

module.exports = {
    getPayments,
    getPaymentById,
    createPayment,
    deletePayment
};