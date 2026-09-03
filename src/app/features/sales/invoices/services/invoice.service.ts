import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Invoice } from '../../../../shared/models/invoice';
import { InvoiceItem } from '../../../../shared/models/invoice-item';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {

    private readonly invoices: Invoice[] = [
        {
            id: 1,
            invoiceNumber: 'INV-2026-001',
            customerId: 1,
            customerName: 'ABC Retail Store',
            invoiceDate: '2026-08-20',
            dueDate: '2026-09-03',
            status: 'issued',
            subtotal: 1299,
            taxAmount: 233.82,
            discountAmount: 0,
            totalAmount: 1532.82,
            notes: 'Regular retail order.',
            createdAt: '2026-08-20T10:00:00',
            updatedAt: '2026-08-20T10:00:00'
        },
        {
            id: 2,
            invoiceNumber: 'INV-2026-002',
            customerId: 2,
            customerName: 'Tech Solutions Pvt Ltd',
            invoiceDate: '2026-08-22',
            dueDate: '2026-09-05',
            status: 'paid',
            subtotal: 2500,
            taxAmount: 450,
            discountAmount: 100,
            totalAmount: 2850,
            notes: 'Payment received.',
            createdAt: '2026-08-22T11:30:00',
            updatedAt: '2026-08-25T14:15:00'
        },
        {
            id: 3,
            invoiceNumber: 'INV-2026-003',
            customerId: 3,
            customerName: 'Office Hub',
            invoiceDate: '2026-08-25',
            dueDate: '2026-09-08',
            status: 'partially-paid',
            subtotal: 1800,
            taxAmount: 324,
            discountAmount: 50,
            totalAmount: 2074,
            notes: 'Partial payment received.',
            createdAt: '2026-08-25T09:15:00',
            updatedAt: '2026-08-28T16:00:00'
        },
        {
            id: 4,
            invoiceNumber: 'INV-2026-004',
            customerId: 4,
            customerName: 'Green Mart',
            invoiceDate: '2026-08-28',
            dueDate: '2026-09-11',
            status: 'draft',
            subtotal: 950,
            taxAmount: 171,
            discountAmount: 25,
            totalAmount: 1096,
            notes: '',
            createdAt: '2026-08-28T13:45:00',
            updatedAt: '2026-08-28T13:45:00'
        }
    ];

    private readonly invoiceItems: InvoiceItem[] = [
        {
            id: 1,
            invoiceId: 1,
            productId: 1,
            productName: 'Wireless Keyboard',
            sku: 'PRD-001',
            quantity: 1,
            unitPrice: 1299,
            taxRate: 18,
            taxAmount: 233.82,
            discountAmount: 0,
            totalAmount: 1532.82
        },
        {
            id: 2,
            invoiceId: 2,
            productId: 2,
            productName: 'Bluetooth Mouse',
            sku: 'PRD-002',
            quantity: 2,
            unitPrice: 799,
            taxRate: 18,
            taxAmount: 287.64,
            discountAmount: 100,
            totalAmount: 1784.64
        },
        {
            id: 3,
            invoiceId: 3,
            productId: 3,
            productName: 'USB Type-C Cable',
            sku: 'PRD-003',
            quantity: 5,
            unitPrice: 349,
            taxRate: 18,
            taxAmount: 314.10,
            discountAmount: 50,
            totalAmount: 2009.10
        }
    ];

    getInvoices(): Observable<Invoice[]> {
        return of(this.invoices);
    }

    getInvoiceById(id: number): Observable<Invoice | null> {
        const invoice = this.invoices.find(
            invoice => invoice.id === id
        );

        return of(invoice ?? null);
    }

    getInvoiceItems(invoiceId: number): Observable<InvoiceItem[]> {
        const items = this.invoiceItems.filter(
            item => item.invoiceId === invoiceId
        );

        return of(items);
    }

    createInvoice(
        invoiceData: Partial<Invoice>,
        items: Omit<InvoiceItem, 'id' | 'invoiceId'>[] = []
    ): Observable<Invoice> {

        const id = this.getNextId();

        const invoice: Invoice = {
            id,
            invoiceNumber:
                invoiceData.invoiceNumber
                ?? this.generateInvoiceNumber(),

            customerId:
                invoiceData.customerId ?? 0,

            customerName:
                invoiceData.customerName ?? '',

            invoiceDate:
                invoiceData.invoiceDate
                ?? new Date().toISOString().split('T')[0],

            dueDate:
                invoiceData.dueDate ?? null,

            status:
                invoiceData.status ?? 'draft',

            subtotal:
                invoiceData.subtotal ?? 0,

            taxAmount:
                invoiceData.taxAmount ?? 0,

            discountAmount:
                invoiceData.discountAmount ?? 0,

            totalAmount:
                invoiceData.totalAmount ?? 0,

            notes:
                invoiceData.notes ?? '',

            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.invoices.push(invoice);

        items.forEach(item => {
            this.invoiceItems.push({
                ...item,
                id: this.getNextItemId(),
                invoiceId: id
            });
        });

        return of(invoice);
    }

    updateInvoice(
        id: number,
        invoiceData: Partial<Invoice>,
        items?: Omit<InvoiceItem, 'id' | 'invoiceId'>[]
    ): Observable<Invoice | null> {

        const index = this.invoices.findIndex(
            invoice => invoice.id === id
        );

        if (index === -1) {
            return of(null);
        }

        const updatedInvoice: Invoice = {
            ...this.invoices[index],
            ...invoiceData,
            id,
            updatedAt: new Date().toISOString()
        };

        this.invoices[index] = updatedInvoice;

        if (items) {
            this.removeInvoiceItems(id);

            items.forEach(item => {
                this.invoiceItems.push({
                    ...item,
                    id: this.getNextItemId(),
                    invoiceId: id
                });
            });
        }

        return of(updatedInvoice);
    }

    deleteInvoice(id: number): Observable<boolean> {

        const index = this.invoices.findIndex(
            invoice => invoice.id === id
        );

        if (index === -1) {
            return of(false);
        }

        this.invoices.splice(index, 1);

        this.removeInvoiceItems(id);

        return of(true);
    }

    private removeInvoiceItems(invoiceId: number): void {

        for (
            let i = this.invoiceItems.length - 1;
            i >= 0;
            i--
        ) {
            if (this.invoiceItems[i].invoiceId === invoiceId) {
                this.invoiceItems.splice(i, 1);
            }
        }
    }

    private getNextId(): number {

        if (this.invoices.length === 0) {
            return 1;
        }

        return Math.max(
            ...this.invoices.map(invoice => invoice.id)
        ) + 1;
    }

    private getNextItemId(): number {

        if (this.invoiceItems.length === 0) {
            return 1;
        }

        return Math.max(
            ...this.invoiceItems.map(item => item.id)
        ) + 1;
    }

    private generateInvoiceNumber(): string {

        const nextId = this.getNextId();

        return `INV-${new Date().getFullYear()}-${String(nextId).padStart(3, '0')}`;
    }
}