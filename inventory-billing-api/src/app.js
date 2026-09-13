const express = require('express');
const cors = require('cors');

const { corsOrigin } = require('./config/env');
const invoiceRoutes = require('./routes/invoice.routes');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const customerRoutes = require('./routes/customer.routes');
const supplierRoutes = require('./routes/supplier.routes');
const purchaseOrderRoutes = require('./routes/purchase-order.routes');
const salesOrderRoutes = require('./routes/sales-order.routes');
const paymentRoutes = require('./routes/payment.routes');
const salesReturnRoutes = require('./routes/sales-return.routes');
const inventoryRoutes = require('./routes/inventory.routes');

const app = express();

app.use(
    cors({
        origin: corsOrigin,
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Stockly API is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseOrderRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sales-returns', salesReturnRoutes);
app.use('/api/inventory', inventoryRoutes);

module.exports = app;