export interface SalesReturnItem {
    id: number;
    salesReturnId: number;
    productId: number;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
}