export interface SalesReturn {
    id: number;
    returnNumber: string;
    invoiceId: number;
    invoiceNumber: string;
    customerId: number;
    customerName: string;
    returnDate: string;
    status: SalesReturnStatus;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    reason: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export type SalesReturnStatus =
    | 'draft'
    | 'approved'
    | 'completed'
    | 'cancelled';