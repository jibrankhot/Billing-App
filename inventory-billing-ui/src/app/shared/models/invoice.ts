export interface Invoice {
    id: number;
    invoiceNumber: string;
    customerId: number;
    customerName: string;
    invoiceDate: string;
    dueDate: string | null;
    status: InvoiceStatus;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export type InvoiceStatus =
    | 'draft'
    | 'issued'
    | 'partially-paid'
    | 'paid'
    | 'cancelled';