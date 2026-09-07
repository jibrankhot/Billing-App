import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SalesOrder } from '../../../../shared/models/sales-order';
import { SalesOrderItem } from '../../../../shared/models/sales-order-item';

@Injectable({
    providedIn: 'root'
})
export class SalesOrderService {

    private salesOrders: SalesOrder[] = [
        {
            id: 1,
            orderNumber: 'SO-2026-001',
            customerId: 1,
            customerName: 'ABC Retail Store',
            orderDate: '2026-08-28',
            expectedDeliveryDate: '2026-09-03',
            status: 'confirmed',
            subtotal: 1299,
            taxAmount: 233.82,
            discountAmount: 0,
            totalAmount: 1532.82,
            notes: 'Regular customer order.',
            createdAt: '2026-08-28T09:30:00',
            updatedAt: '2026-08-28T09:30:00'
        },
        {
            id: 2,
            orderNumber: 'SO-2026-002',
            customerId: 2,
            customerName: 'Tech Solutions Pvt Ltd',
            orderDate: '2026-08-29',
            expectedDeliveryDate: '2026-09-05',
            status: 'processing',
            subtotal: 1598,
            taxAmount: 287.64,
            discountAmount: 100,
            totalAmount: 1785.64,
            notes: 'Deliver to office address.',
            createdAt: '2026-08-29T10:15:00',
            updatedAt: '2026-08-30T11:00:00'
        },
        {
            id: 3,
            orderNumber: 'SO-2026-003',
            customerId: 3,
            customerName: 'Office Hub',
            orderDate: '2026-08-30',
            expectedDeliveryDate: '2026-09-06',
            status: 'draft',
            subtotal: 1745,
            taxAmount: 314.10,
            discountAmount: 50,
            totalAmount: 2009.10,
            notes: '',
            createdAt: '2026-08-30T14:20:00',
            updatedAt: '2026-08-30T14:20:00'
        }
    ];

    private salesOrderItems: SalesOrderItem[] = [
        {
            id: 1,
            salesOrderId: 1,
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
            salesOrderId: 2,
            productId: 2,
            productName: 'Bluetooth Mouse',
            sku: 'PRD-002',
            quantity: 2,
            unitPrice: 799,
            taxRate: 18,
            taxAmount: 287.64,
            discountAmount: 100,
            totalAmount: 1785.64
        },
        {
            id: 3,
            salesOrderId: 3,
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

    getSalesOrders(): Observable<SalesOrder[]> {
        return of([...this.salesOrders]);
    }

    getSalesOrderById(id: number): Observable<SalesOrder | undefined> {
        const order = this.salesOrders.find(
            salesOrder => salesOrder.id === id
        );

        return of(order);
    }

    getSalesOrderItems(
        salesOrderId: number
    ): Observable<SalesOrderItem[]> {
        const items = this.salesOrderItems.filter(
            item => item.salesOrderId === salesOrderId
        );

        return of([...items]);
    }

    createSalesOrder(
        orderData: Partial<SalesOrder>,
        items: SalesOrderItem[]
    ): Observable<SalesOrder> {

        const id = this.getNextId();

        const order: SalesOrder = {
            id,
            orderNumber: this.generateOrderNumber(id),
            customerId: orderData.customerId ?? 0,
            customerName: orderData.customerName ?? '',
            orderDate: orderData.orderDate ?? new Date().toISOString(),
            expectedDeliveryDate: orderData.expectedDeliveryDate ?? null,
            status: orderData.status ?? 'draft',
            subtotal: orderData.subtotal ?? 0,
            taxAmount: orderData.taxAmount ?? 0,
            discountAmount: orderData.discountAmount ?? 0,
            totalAmount: orderData.totalAmount ?? 0,
            notes: orderData.notes ?? '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.salesOrders.push(order);

        items.forEach(item => {
            this.salesOrderItems.push({
                ...item,
                id: this.getNextItemId(),
                salesOrderId: id
            });
        });

        return of(order);
    }

    updateSalesOrder(
        id: number,
        orderData: Partial<SalesOrder>,
        items: SalesOrderItem[]
    ): Observable<SalesOrder | undefined> {

        const index = this.salesOrders.findIndex(
            order => order.id === id
        );

        if (index === -1) {
            return of(undefined);
        }

        const updatedOrder: SalesOrder = {
            ...this.salesOrders[index],
            ...orderData,
            id,
            updatedAt: new Date().toISOString()
        };

        this.salesOrders[index] = updatedOrder;

        this.salesOrderItems = this.salesOrderItems.filter(
            item => item.salesOrderId !== id
        );

        items.forEach(item => {
            this.salesOrderItems.push({
                ...item,
                id: this.getNextItemId(),
                salesOrderId: id
            });
        });

        return of(updatedOrder);
    }

    deleteSalesOrder(id: number): Observable<boolean> {

        const index = this.salesOrders.findIndex(
            order => order.id === id
        );

        if (index === -1) {
            return of(false);
        }

        this.salesOrders.splice(index, 1);

        this.salesOrderItems = this.salesOrderItems.filter(
            item => item.salesOrderId !== id
        );

        return of(true);
    }

    private getNextId(): number {
        return this.salesOrders.length > 0
            ? Math.max(...this.salesOrders.map(order => order.id)) + 1
            : 1;
    }

    private getNextItemId(): number {
        return this.salesOrderItems.length > 0
            ? Math.max(...this.salesOrderItems.map(item => item.id)) + 1
            : 1;
    }

    private generateOrderNumber(id: number): string {
        return `SO-2026-${String(id).padStart(3, '0')}`;
    }
}