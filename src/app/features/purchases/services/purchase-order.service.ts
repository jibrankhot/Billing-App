import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PurchaseOrder } from '../../../shared/models/purchase-order';
import { PurchaseOrderItem } from '../../../shared/models/purchase-order-item';

@Injectable({
    providedIn: 'root'
})
export class PurchaseOrderService {

    private readonly purchaseOrders: PurchaseOrder[] = [
        {
            id: 1,
            orderNumber: 'PO-2026-001',
            supplierId: 1,
            supplierName: 'Tech World Supplies',
            orderDate: '2026-08-10T10:00:00',
            expectedDate: '2026-08-15T10:00:00',
            status: 'received',
            subtotal: 8500,
            taxAmount: 1530,
            discountAmount: 0,
            totalAmount: 10030,
            notes: 'Regular electronics stock replenishment.',
            createdAt: '2026-08-10T10:00:00',
            updatedAt: '2026-08-15T14:00:00'
        },
        {
            id: 2,
            orderNumber: 'PO-2026-002',
            supplierId: 2,
            supplierName: 'Office Mart',
            orderDate: '2026-08-12T10:00:00',
            expectedDate: '2026-08-20T10:00:00',
            status: 'ordered',
            subtotal: 4200,
            taxAmount: 504,
            discountAmount: 200,
            totalAmount: 4504,
            notes: 'Office supplies for September.',
            createdAt: '2026-08-12T10:00:00',
            updatedAt: '2026-08-12T10:00:00'
        },
        {
            id: 3,
            orderNumber: 'PO-2026-003',
            supplierId: 3,
            supplierName: 'Fresh Foods Distributors',
            orderDate: '2026-08-18T10:00:00',
            expectedDate: '2026-08-22T10:00:00',
            status: 'partially-received',
            subtotal: 6200,
            taxAmount: 310,
            discountAmount: 100,
            totalAmount: 6410,
            notes: 'Partial delivery received.',
            createdAt: '2026-08-18T10:00:00',
            updatedAt: '2026-08-21T11:00:00'
        },
        {
            id: 4,
            orderNumber: 'PO-2026-004',
            supplierId: 4,
            supplierName: 'Prime Stationery',
            orderDate: '2026-08-21T10:00:00',
            expectedDate: '2026-08-28T10:00:00',
            status: 'draft',
            subtotal: 2800,
            taxAmount: 336,
            discountAmount: 0,
            totalAmount: 3136,
            notes: 'Draft order awaiting confirmation.',
            createdAt: '2026-08-21T10:00:00',
            updatedAt: '2026-08-21T10:00:00'
        },
        {
            id: 5,
            orderNumber: 'PO-2026-005',
            supplierId: 5,
            supplierName: 'General Trading Co.',
            orderDate: '2026-08-23T10:00:00',
            expectedDate: null,
            status: 'cancelled',
            subtotal: 3500,
            taxAmount: 630,
            discountAmount: 0,
            totalAmount: 4130,
            notes: 'Order cancelled by supplier.',
            createdAt: '2026-08-23T10:00:00',
            updatedAt: '2026-08-24T10:00:00'
        }
    ];

    private readonly purchaseOrderItems: PurchaseOrderItem[] = [
        {
            id: 1,
            purchaseOrderId: 1,
            productId: 1,
            productName: 'Wireless Keyboard',
            sku: 'PRD-001',
            quantity: 10,
            unitPrice: 850,
            taxRate: 18,
            taxAmount: 1530,
            discountAmount: 0,
            totalAmount: 10030
        },
        {
            id: 2,
            purchaseOrderId: 2,
            productId: 4,
            productName: 'Office Notebook',
            sku: 'PRD-004',
            quantity: 50,
            unitPrice: 55,
            taxRate: 12,
            taxAmount: 330,
            discountAmount: 100,
            totalAmount: 2980
        },
        {
            id: 3,
            purchaseOrderId: 3,
            productId: 6,
            productName: 'Coffee Beans',
            sku: 'PRD-006',
            quantity: 10,
            unitPrice: 620,
            taxRate: 5,
            taxAmount: 310,
            discountAmount: 100,
            totalAmount: 6410
        }
    ];

    getPurchaseOrders(): Observable<PurchaseOrder[]> {
        return of(this.purchaseOrders);
    }

    getPurchaseOrderById(
        id: number
    ): Observable<PurchaseOrder | null> {

        const purchaseOrder =
            this.purchaseOrders.find(
                order => order.id === id
            );

        return of(purchaseOrder ?? null);
    }

    getPurchaseOrderItems(
        purchaseOrderId: number
    ): Observable<PurchaseOrderItem[]> {

        const items =
            this.purchaseOrderItems.filter(
                item => item.purchaseOrderId === purchaseOrderId
            );

        return of(items);
    }

    createPurchaseOrder(
        purchaseOrderData: Partial<PurchaseOrder>
    ): Observable<PurchaseOrder> {

        const now = new Date().toISOString();

        const newPurchaseOrder: PurchaseOrder = {
            id: this.getNextId(),
            orderNumber:
                purchaseOrderData.orderNumber ??
                this.generateOrderNumber(),
            supplierId:
                purchaseOrderData.supplierId ?? 0,
            supplierName:
                purchaseOrderData.supplierName ?? '',
            orderDate:
                purchaseOrderData.orderDate ?? now,
            expectedDate:
                purchaseOrderData.expectedDate ?? null,
            status:
                purchaseOrderData.status ?? 'draft',
            subtotal:
                purchaseOrderData.subtotal ?? 0,
            taxAmount:
                purchaseOrderData.taxAmount ?? 0,
            discountAmount:
                purchaseOrderData.discountAmount ?? 0,
            totalAmount:
                purchaseOrderData.totalAmount ?? 0,
            notes:
                purchaseOrderData.notes ?? '',
            createdAt: now,
            updatedAt: now
        };

        this.purchaseOrders.push(
            newPurchaseOrder
        );

        return of(newPurchaseOrder);
    }

    updatePurchaseOrder(
        id: number,
        purchaseOrderData: Partial<PurchaseOrder>
    ): Observable<PurchaseOrder | null> {

        const index =
            this.purchaseOrders.findIndex(
                order => order.id === id
            );

        if (index === -1) {
            return of(null);
        }

        const updatedPurchaseOrder: PurchaseOrder = {
            ...this.purchaseOrders[index],
            ...purchaseOrderData,
            id,
            updatedAt: new Date().toISOString()
        };

        this.purchaseOrders[index] =
            updatedPurchaseOrder;

        return of(updatedPurchaseOrder);
    }

    deletePurchaseOrder(
        id: number
    ): Observable<boolean> {

        const index =
            this.purchaseOrders.findIndex(
                order => order.id === id
            );

        if (index === -1) {
            return of(false);
        }

        this.purchaseOrders.splice(index, 1);

        return of(true);
    }

    private getNextId(): number {
        if (this.purchaseOrders.length === 0) {
            return 1;
        }

        return Math.max(
            ...this.purchaseOrders.map(
                order => order.id
            )
        ) + 1;
    }

    private generateOrderNumber(): string {
        const nextId = this.getNextId();

        return `PO-2026-${String(nextId).padStart(3, '0')}`;
    }
}