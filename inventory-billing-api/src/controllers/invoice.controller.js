const asyncHandler = require('../utils/async-handler');

const invoiceService = require('../services/invoice.service');

const getInvoices = asyncHandler(async (req, res) => {
    const invoices = await invoiceService.getInvoices();

    res.status(200).json(invoices);
});

const getInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.getInvoiceById(
        Number(req.params.id)
    );

    res.status(200).json(invoice);
});

const createInvoice = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?.userId || null;

    const invoice = await invoiceService.createInvoice(
        req.body,
        userId
    );

    res.status(201).json(invoice);
});

const updateInvoice = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.updateInvoice(
        Number(req.params.id),
        req.body
    );

    res.status(200).json(invoice);
});

const deleteInvoice = asyncHandler(async (req, res) => {
    await invoiceService.deleteInvoice(
        Number(req.params.id)
    );

    res.status(200).json(true);
});

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice
};