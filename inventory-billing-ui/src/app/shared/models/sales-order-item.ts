export interface SalesOrderItem {
    id: number;
    salesOrderId: number;
    productId: number;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
}