const reportService = require('../services/report.service');

const getSalesReport = async (req, res) => {
    const report = await reportService.getSalesReport(req.query);

    res.status(200).json(report);
};

const getPurchaseReport = async (req, res) => {
    const report = await reportService.getPurchaseReport(req.query);

    res.status(200).json(report);
};

const getPaymentReport = async (req, res) => {
    const report = await reportService.getPaymentReport(req.query);

    res.status(200).json(report);
};

const getInventoryReport = async (req, res) => {
    const report = await reportService.getInventoryReport();

    res.status(200).json(report);
};

module.exports = {
    getSalesReport,
    getPurchaseReport,
    getPaymentReport,
    getInventoryReport
};