export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string;
    categoryId: number;
    categoryName: string;
    unit: string;
    purchasePrice: number;
    sellingPrice: number;
    taxRate: number;
    currentStock: number;
    minimumStock: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}