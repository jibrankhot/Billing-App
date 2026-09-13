const supabase = require('../config/database');

const mapCompanySettings = (data) => ({
    id: data.id,
    companyName: data.company_name,
    email: data.email,
    phone: data.phone,
    taxNumber: data.tax_number,
    address: data.address,
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,
    website: data.website,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

const mapInvoiceSettings = (data) => ({
    id: data.id,
    invoicePrefix: data.invoice_prefix,
    nextInvoiceNumber: data.next_invoice_number,
    paymentTerms: data.payment_terms,
    defaultNotes: data.default_notes,
    showCompanyDetails: data.show_company_details,
    showTaxDetails: data.show_tax_details,
    showPaymentDetails: data.show_payment_details,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

const mapTaxSettings = (data) => ({
    id: data.id,
    taxSystem: data.tax_system,
    defaultTaxRate: Number(data.default_tax_rate || 0),
    taxInclusive: data.tax_inclusive,
    enableTax: data.enable_tax,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

const getCompanySettings = async () => {
    const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error(
                'Company settings not found'
            );
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    return mapCompanySettings(data);
};

const updateCompanySettings = async (settings) => {
    const payload = {
        company_name: settings.companyName,
        email: settings.email || null,
        phone: settings.phone || null,
        tax_number: settings.taxNumber || null,
        address: settings.address || null,
        city: settings.city || null,
        state: settings.state || null,
        postal_code: settings.postalCode || null,
        website: settings.website || null
    };

    const { data, error } = await supabase
        .from('company_settings')
        .update(payload)
        .eq('id', 1)
        .select('*')
        .single();

    if (error) throw error;

    return mapCompanySettings(data);
};

const getInvoiceSettings = async () => {
    const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error(
                'Invoice settings not found'
            );
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    return mapInvoiceSettings(data);
};

const updateInvoiceSettings = async (settings) => {
    const payload = {
        invoice_prefix: settings.invoicePrefix,
        next_invoice_number:
            Number(settings.nextInvoiceNumber),
        payment_terms:
            Number(settings.paymentTerms),
        default_notes:
            settings.defaultNotes || null,
        show_company_details:
            Boolean(settings.showCompanyDetails),
        show_tax_details:
            Boolean(settings.showTaxDetails),
        show_payment_details:
            Boolean(settings.showPaymentDetails)
    };

    const { data, error } = await supabase
        .from('invoice_settings')
        .update(payload)
        .eq('id', 1)
        .select('*')
        .single();

    if (error) throw error;

    return mapInvoiceSettings(data);
};

const getTaxSettings = async () => {
    const { data, error } = await supabase
        .from('tax_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error(
                'Tax settings not found'
            );
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    return mapTaxSettings(data);
};

const updateTaxSettings = async (settings) => {
    const payload = {
        tax_system: settings.taxSystem,
        default_tax_rate:
            Number(settings.defaultTaxRate),
        tax_inclusive:
            Boolean(settings.taxInclusive),
        enable_tax:
            Boolean(settings.enableTax)
    };

    const { data, error } = await supabase
        .from('tax_settings')
        .update(payload)
        .eq('id', 1)
        .select('*')
        .single();

    if (error) throw error;

    return mapTaxSettings(data);
};

module.exports = {
    getCompanySettings,
    updateCompanySettings,
    getInvoiceSettings,
    updateInvoiceSettings,
    getTaxSettings,
    updateTaxSettings
};