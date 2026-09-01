export interface PurchaseOrder {
    id: number;
    orderNumber: string;
    supplierId: number;
    supplierName: string;
    orderDate: string;
    expectedDate: string | null;
    status: PurchaseOrderStatus;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export type PurchaseOrderStatus =
    | 'draft'
    | 'ordered'
    | 'partially-received'
    | 'received'
    | 'cancelled';