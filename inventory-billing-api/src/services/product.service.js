const supabase = require('../config/database');

const mapProduct = (product) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    categoryId: product.category_id,
    categoryName: product.categories?.name || '',
    unit: product.unit,
    purchasePrice: Number(product.purchase_price),
    sellingPrice: Number(product.selling_price),
    taxRate: Number(product.tax_rate),
    currentStock: Number(product.current_stock),
    minimumStock: Number(product.minimum_stock),
    isActive: product.is_active,
    createdAt: product.created_at,
    updatedAt: product.updated_at
});

const productSelect = `
    *,
    categories (
        id,
        name
    )
`;

const getProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select(productSelect)
        .order('name', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data.map(mapProduct);
};

const getProductById = async (id) => {
    const { data, error } = await supabase
        .from('products')
        .select(productSelect)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        const notFoundError = new Error('Product not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    return mapProduct(data);
};

const createProduct = async (productData) => {
    const insertData = {
        sku: productData.sku.trim(),
        name: productData.name.trim(),
        description: productData.description || null,
        category_id: Number(productData.categoryId),
        unit: productData.unit || 'pcs',
        purchase_price: Number(productData.purchasePrice || 0),
        selling_price: Number(productData.sellingPrice || 0),
        tax_rate: Number(productData.taxRate || 0),
        current_stock: Number(productData.currentStock || 0),
        minimum_stock: Number(productData.minimumStock || 0),
        is_active: productData.isActive ?? true
    };

    const { data, error } = await supabase
        .from('products')
        .insert(insertData)
        .select(productSelect)
        .single();

    if (error) {
        if (error.code === '23505') {
            const duplicateError = new Error(
                'Product SKU already exists'
            );
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        if (error.code === '23503') {
            const categoryError = new Error(
                'Selected category does not exist'
            );
            categoryError.statusCode = 400;
            throw categoryError;
        }

        throw new Error(error.message);
    }

    return mapProduct(data);
};

const updateProduct = async (id, productData) => {
    const updateData = {};

    if (productData.sku !== undefined) {
        updateData.sku = productData.sku.trim();
    }

    if (productData.name !== undefined) {
        updateData.name = productData.name.trim();
    }

    if (productData.description !== undefined) {
        updateData.description = productData.description || null;
    }

    if (productData.categoryId !== undefined) {
        updateData.category_id = Number(productData.categoryId);
    }

    if (productData.unit !== undefined) {
        updateData.unit = productData.unit;
    }

    if (productData.purchasePrice !== undefined) {
        updateData.purchase_price = Number(productData.purchasePrice);
    }

    if (productData.sellingPrice !== undefined) {
        updateData.selling_price = Number(productData.sellingPrice);
    }

    if (productData.taxRate !== undefined) {
        updateData.tax_rate = Number(productData.taxRate);
    }

    if (productData.currentStock !== undefined) {
        updateData.current_stock = Number(productData.currentStock);
    }

    if (productData.minimumStock !== undefined) {
        updateData.minimum_stock = Number(productData.minimumStock);
    }

    if (productData.isActive !== undefined) {
        updateData.is_active = productData.isActive;
    }

    const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select(productSelect)
        .maybeSingle();

    if (error) {
        if (error.code === '23505') {
            const duplicateError = new Error(
                'Product SKU already exists'
            );
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        if (error.code === '23503') {
            const categoryError = new Error(
                'Selected category does not exist'
            );
            categoryError.statusCode = 400;
            throw categoryError;
        }

        throw new Error(error.message);
    }

    if (!data) {
        const notFoundError = new Error('Product not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    return mapProduct(data);
};

const deleteProduct = async (id) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') {
            const conflictError = new Error(
                'Product cannot be deleted because it is being used in transactions'
            );
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw new Error(error.message);
    }

    return true;
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};