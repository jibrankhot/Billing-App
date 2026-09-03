export interface InvoiceItem {
    id: number;
    invoiceId: number;
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