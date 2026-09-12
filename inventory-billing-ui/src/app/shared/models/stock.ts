export interface StockItem {
    id: number;
    productId: number;
    productName: string;
    sku: string;
    quantity: number;
    reorderLevel: number;
    unitCost: number;
    stockValue: number;
    status: StockStatus;
    updatedAt: string;
}

export type StockStatus =
    | 'in-stock'
    | 'low-stock'
    | 'out-of-stock';

export interface StockMovement {
    id: number;
    productId: number;
    productName: string;
    sku: string;
    type: StockMovementType;
    quantity: number;
    reference: string;
    notes: string;
    createdAt: string;
}

export type StockMovementType =
    | 'purchase'
    | 'sale'
    | 'adjustment'
    | 'return';