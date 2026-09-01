export interface PurchaseOrderItem {
    id: number;
    purchaseOrderId: number;
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