export interface SalesOrder {
    id: number;
    orderNumber: string;
    customerId: number;
    customerName: string;
    orderDate: string;
    expectedDeliveryDate: string | null;
    status: SalesOrderStatus;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export type SalesOrderStatus =
    | 'draft'
    | 'confirmed'
    | 'processing'
    | 'completed'
    | 'cancelled';