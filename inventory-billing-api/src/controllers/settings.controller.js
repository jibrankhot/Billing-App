const asyncHandler = require('../utils/async-handler');
const settingsService = require('../services/settings.service');

const getCompanySettings = asyncHandler(async (req, res) => {
    const settings =
        await settingsService.getCompanySettings();

    res.status(200).json(settings);
});

const updateCompanySettings = asyncHandler(async (req, res) => {
    const settings =
        await settingsService.updateCompanySettings(
            req.body
        );

    res.status(200).json(settings);
});

const getInvoiceSettings = asyncHandler(async (req, res) => {
    const settings =
        await settingsService.getInvoiceSettings();

    res.status(200).json(settings);
});

const updateInvoiceSettings = asyncHandler(async (req, res) => {
    const settings =
        await settingsService.updateInvoiceSettings(
            req.body
        );

    res.status(200).json(settings);
});

const getTaxSettings = asyncHandler(async (req, res) => {
    const settings =
        await settingsService.getTaxSettings();

    res.status(200).json(settings);
});

const updateTaxSettings = asyncHandler(async (req, res) => {
    const settings =
        await settingsService.updateTaxSettings(
            req.body
        );

    res.status(200).json(settings);
});

module.exports = {
    getCompanySettings,
    updateCompanySettings,
    getInvoiceSettings,
    updateInvoiceSettings,
    getTaxSettings,
    updateTaxSettings
};