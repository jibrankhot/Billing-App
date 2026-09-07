import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SalesReturn } from '../../../../shared/models/sales-return';
import { SalesReturnItem } from '../../../../shared/models/sales-return-item';

@Injectable({
    providedIn: 'root'
})
export class SalesReturnService {

    private salesReturns: SalesReturn[] = [
        {
            id: 1,
            returnNumber: 'SR-2026-001',
            invoiceId: 1,
            invoiceNumber: 'INV-2026-001',
            customerId: 1,
            customerName: 'ABC Retail Store',
            returnDate: '2026-09-01',
            status: 'completed',
            subtotal: 1299,
            taxAmount: 233.82,
            totalAmount: 1532.82,
            reason: 'Product damaged during delivery.',
            notes: 'Replacement not required.',
            createdAt: '2026-09-01T10:00:00',
            updatedAt: '2026-09-01T10:30:00'
        },
        {
            id: 2,
            returnNumber: 'SR-2026-002',
            invoiceId: 2,
            invoiceNumber: 'INV-2026-002',
            customerId: 2,
            customerName: 'Tech Solutions Pvt Ltd',
            returnDate: '2026-09-02',
            status: 'approved',
            subtotal: 799,
            taxAmount: 143.82,
            totalAmount: 942.82,
            reason: 'Incorrect product delivered.',
            notes: '',
            createdAt: '2026-09-02T11:15:00',
            updatedAt: '2026-09-02T11:30:00'
        }
    ];

    private salesReturnItems: SalesReturnItem[] = [
        {
            id: 1,
            salesReturnId: 1,
            productId: 1,
            productName: 'Wireless Keyboard',
            sku: 'PRD-001',
            quantity: 1,
            unitPrice: 1299,
            taxRate: 18,
            taxAmount: 233.82,
            totalAmount: 1532.82
        },
        {
            id: 2,
            salesReturnId: 2,
            productId: 2,
            productName: 'Bluetooth Mouse',
            sku: 'PRD-002',
            quantity: 1,
            unitPrice: 799,
            taxRate: 18,
            taxAmount: 143.82,
            totalAmount: 942.82
        }
    ];

    getSalesReturns(): Observable<SalesReturn[]> {
        return of([...this.salesReturns]);
    }

    getSalesReturnById(
        id: number
    ): Observable<SalesReturn | undefined> {
        const salesReturn = this.salesReturns.find(
            item => item.id === id
        );

        return of(salesReturn);
    }

    getSalesReturnItems(
        salesReturnId: number
    ): Observable<SalesReturnItem[]> {
        const items = this.salesReturnItems.filter(
            item => item.salesReturnId === salesReturnId
        );

        return of([...items]);
    }

    createSalesReturn(
        returnData: Partial<SalesReturn>,
        items: SalesReturnItem[]
    ): Observable<SalesReturn> {

        const id = this.getNextId();

        const salesReturn: SalesReturn = {
            id,
            returnNumber: this.generateReturnNumber(id),
            invoiceId: returnData.invoiceId ?? 0,
            invoiceNumber: returnData.invoiceNumber ?? '',
            customerId: returnData.customerId ?? 0,
            customerName: returnData.customerName ?? '',
            returnDate:
                returnData.returnDate ??
                new Date().toISOString().substring(0, 10),
            status: returnData.status ?? 'draft',
            subtotal: returnData.subtotal ?? 0,
            taxAmount: returnData.taxAmount ?? 0,
            totalAmount: returnData.totalAmount ?? 0,
            reason: returnData.reason ?? '',
            notes: returnData.notes ?? '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.salesReturns.push(salesReturn);

        items.forEach(item => {
            this.salesReturnItems.push({
                ...item,
                id: this.getNextItemId(),
                salesReturnId: id
            });
        });

        return of(salesReturn);
    }

    deleteSalesReturn(id: number): Observable<boolean> {

        const index = this.salesReturns.findIndex(
            item => item.id === id
        );

        if (index === -1) {
            return of(false);
        }

        this.salesReturns.splice(index, 1);

        this.salesReturnItems =
            this.salesReturnItems.filter(
                item => item.salesReturnId !== id
            );

        return of(true);
    }

    private getNextId(): number {
        return this.salesReturns.length > 0
            ? Math.max(
                ...this.salesReturns.map(item => item.id)
            ) + 1
            : 1;
    }

    private getNextItemId(): number {
        return this.salesReturnItems.length > 0
            ? Math.max(
                ...this.salesReturnItems.map(item => item.id)
            ) + 1
            : 1;
    }

    private generateReturnNumber(id: number): string {
        return `SR-2026-${String(id).padStart(3, '0')}`;
    }
}