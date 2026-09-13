const asyncHandler = require('../utils/async-handler');
const reportService = require('../services/report.service');

const getSalesReport = asyncHandler(async (req, res) => {
    const report = await reportService.getSalesReport(
        req.query.fromDate,
        req.query.toDate
    );

    res.status(200).json(report);
});

const getPurchaseReport = asyncHandler(async (req, res) => {
    const report = await reportService.getPurchaseReport(
        req.query.fromDate,
        req.query.toDate
    );

    res.status(200).json(report);
});

const getPaymentReport = asyncHandler(async (req, res) => {
    const report = await reportService.getPaymentReport(
        req.query.fromDate,
        req.query.toDate
    );

    res.status(200).json(report);
});

const getInventoryReport = asyncHandler(async (req, res) => {
    const report =
        await reportService.getInventoryReport();

    res.status(200).json(report);
});

module.exports = {
    getSalesReport,
    getPurchaseReport,
    getPaymentReport,
    getInventoryReport
};