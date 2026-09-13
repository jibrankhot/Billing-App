const supabase = require('../config/database');

const mapProduct = (product) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    categoryId: product.category_id,
    categoryName: product.category?.name || '',
    unit: product.unit,
    purchasePrice: Number(product.purchase_price || 0),
    sellingPrice: Number(product.selling_price || 0),
    taxRate: Number(product.tax_rate || 0),
    currentStock: Number(product.current_stock || 0),
    minimumStock: Number(product.minimum_stock || 0),
    isActive: product.is_active,
    createdAt: product.created_at,
    updatedAt: product.updated_at
});

const mapMovement = (movement, product = null, user = null) => ({
    id: movement.id,
    productId: movement.product_id,
    productName: product?.name || '',
    sku: product?.sku || '',
    movementType: movement.movement_type,
    quantity: Number(movement.quantity),
    referenceType: movement.reference_type,
    referenceId: movement.reference_id,
    notes: movement.notes,
    createdBy: movement.created_by,
    createdByName: user?.name || '',
    createdAt: movement.created_at
});

const getProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            category:categories(name)
        `)
        .order('name');

    if (error) {
        throw error;
    }

    return (data || []).map(mapProduct);
};

const getProduct = async (productId) => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            category:categories(name)
        `)
        .eq('id', productId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error('Product not found');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    return data;
};

const getStockOverview = async () => {
    const products = await getProducts();

    const totalProducts = products.length;

    const totalStock = products.reduce(
        (total, product) =>
            total + product.currentStock,
        0
    );

    const lowStockProducts = products.filter(
        (product) =>
            product.currentStock <= product.minimumStock
    );

    const outOfStockProducts = products.filter(
        (product) =>
            product.currentStock <= 0
    );

    const inventoryValue = products.reduce(
        (total, product) =>
            total +
            product.currentStock *
            product.purchasePrice,
        0
    );

    return {
        products,
        totalProducts,
        totalStock,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        inventoryValue
    };
};

const getLowStockProducts = async () => {
    const products = await getProducts();

    return products.filter(
        (product) =>
            product.currentStock <= product.minimumStock
    );
};

const getStockMovements = async (productId = null) => {
    let query = supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', {
            ascending: false
        });

    if (productId) {
        query = query.eq(
            'product_id',
            Number(productId)
        );
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    const movements = data || [];

    if (movements.length === 0) {
        return [];
    }

    const productIds = [
        ...new Set(
            movements.map(
                (movement) => movement.product_id
            )
        )
    ];

    const { data: products, error: productError } =
        await supabase
            .from('products')
            .select('id, name, sku')
            .in('id', productIds);

    if (productError) {
        throw productError;
    }

    const userIds = [
        ...new Set(
            movements
                .map(
                    (movement) =>
                        movement.created_by
                )
                .filter(Boolean)
        )
    ];

    let users = [];

    if (userIds.length > 0) {
        const { data: userData, error: userError } =
            await supabase
                .from('users')
                .select('id, name')
                .in('id', userIds);

        if (userError) {
            throw userError;
        }

        users = userData || [];
    }

    const productMap = new Map(
        (products || []).map(
            (product) => [product.id, product]
        )
    );

    const userMap = new Map(
        users.map(
            (user) => [user.id, user]
        )
    );

    return movements.map(
        (movement) =>
            mapMovement(
                movement,
                productMap.get(movement.product_id),
                userMap.get(movement.created_by)
            )
    );
};

const createStockAdjustment = async (
    adjustmentData,
    userId
) => {
    const productId = Number(
        adjustmentData.productId
    );

    const product = await getProduct(productId);

    const adjustmentType =
        String(
            adjustmentData.adjustmentType || 'increase'
        ).toLowerCase();

    const quantity = Number(
        adjustmentData.quantity
    );

    if (!Number.isFinite(quantity) || quantity <= 0) {
        const err = new Error(
            'Adjustment quantity must be greater than zero'
        );
        err.statusCode = 422;
        throw err;
    }

    if (
        !['increase', 'decrease'].includes(
            adjustmentType
        )
    ) {
        const err = new Error(
            'Adjustment type must be increase or decrease'
        );
        err.statusCode = 422;
        throw err;
    }

    const currentStock = Number(
        product.current_stock || 0
    );

    const stockChange =
        adjustmentType === 'increase'
            ? quantity
            : -quantity;

    const newStock =
        currentStock + stockChange;

    if (newStock < 0) {
        const err = new Error(
            'Stock cannot become negative'
        );
        err.statusCode = 409;
        throw err;
    }

    const { data: updatedProduct, error: updateError } =
        await supabase
            .from('products')
            .update({
                current_stock: newStock
            })
            .eq('id', productId)
            .select(`
                *,
                category:categories(name)
            `)
            .single();

    if (updateError) {
        throw updateError;
    }

    const { data: movement, error: movementError } =
        await supabase
            .from('stock_movements')
            .insert({
                product_id: productId,
                movement_type: 'adjustment',
                quantity: stockChange,
                reference_type: 'manual_adjustment',
                reference_id: null,
                notes:
                    adjustmentData.reason ||
                    adjustmentData.notes ||
                    null,
                created_by: userId
            })
            .select()
            .single();

    if (movementError) {
        await supabase
            .from('products')
            .update({
                current_stock: currentStock
            })
            .eq('id', productId);

        throw movementError;
    }

    return {
        product: mapProduct(updatedProduct),
        movement: mapMovement(
            movement,
            updatedProduct
        )
    };
};

module.exports = {
    getStockOverview,
    getLowStockProducts,
    getStockMovements,
    createStockAdjustment
};