import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {
    StockItem,
    StockMovement
} from '../../../shared/models/stock';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {

    private stockItems: StockItem[] = [
        {
            id: 1,
            productId: 1,
            productName: 'Wireless Keyboard',
            sku: 'PRD-001',
            quantity: 42,
            reorderLevel: 10,
            unitCost: 850,
            stockValue: 35700,
            status: 'in-stock',
            updatedAt: new Date().toISOString()
        },
        {
            id: 2,
            productId: 2,
            productName: 'Bluetooth Mouse',
            sku: 'PRD-002',
            quantity: 8,
            reorderLevel: 10,
            unitCost: 500,
            stockValue: 4000,
            status: 'low-stock',
            updatedAt: new Date().toISOString()
        },
        {
            id: 3,
            productId: 3,
            productName: 'USB Type-C Cable',
            sku: 'PRD-003',
            quantity: 65,
            reorderLevel: 15,
            unitCost: 200,
            stockValue: 13000,
            status: 'in-stock',
            updatedAt: new Date().toISOString()
        },
        {
            id: 4,
            productId: 4,
            productName: 'Office Notebook',
            sku: 'PRD-004',
            quantity: 4,
            reorderLevel: 10,
            unitCost: 120,
            stockValue: 480,
            status: 'low-stock',
            updatedAt: new Date().toISOString()
        },
        {
            id: 5,
            productId: 5,
            productName: 'Printer Paper',
            sku: 'PRD-005',
            quantity: 0,
            reorderLevel: 10,
            unitCost: 250,
            stockValue: 0,
            status: 'out-of-stock',
            updatedAt: new Date().toISOString()
        },
        {
            id: 6,
            productId: 6,
            productName: 'Coffee Beans',
            sku: 'PRD-006',
            quantity: 25,
            reorderLevel: 8,
            unitCost: 600,
            stockValue: 15000,
            status: 'in-stock',
            updatedAt: new Date().toISOString()
        }
    ];

    private movements: StockMovement[] = [
        {
            id: 1,
            productId: 1,
            productName: 'Wireless Keyboard',
            sku: 'PRD-001',
            type: 'purchase',
            quantity: 20,
            reference: 'PO-2026-001',
            notes: 'New stock received',
            createdAt: '2026-08-28T10:30:00'
        },
        {
            id: 2,
            productId: 2,
            productName: 'Bluetooth Mouse',
            sku: 'PRD-002',
            type: 'sale',
            quantity: -4,
            reference: 'INV-2026-002',
            notes: 'Customer sale',
            createdAt: '2026-08-29T11:15:00'
        },
        {
            id: 3,
            productId: 3,
            productName: 'USB Type-C Cable',
            sku: 'PRD-003',
            type: 'purchase',
            quantity: 30,
            reference: 'PO-2026-002',
            notes: 'Stock replenishment',
            createdAt: '2026-08-30T09:45:00'
        },
        {
            id: 4,
            productId: 4,
            productName: 'Office Notebook',
            sku: 'PRD-004',
            type: 'sale',
            quantity: -6,
            reference: 'INV-2026-003',
            notes: 'Customer sale',
            createdAt: '2026-08-30T14:20:00'
        },
        {
            id: 5,
            productId: 5,
            productName: 'Printer Paper',
            sku: 'PRD-005',
            type: 'sale',
            quantity: -10,
            reference: 'INV-2026-004',
            notes: 'Customer sale',
            createdAt: '2026-08-31T10:00:00'
        },
        {
            id: 6,
            productId: 6,
            productName: 'Coffee Beans',
            sku: 'PRD-006',
            type: 'adjustment',
            quantity: 5,
            reference: 'ADJ-001',
            notes: 'Physical stock count adjustment',
            createdAt: '2026-09-01T16:30:00'
        }
    ];

    getStockItems(): Observable<StockItem[]> {
        return of([...this.stockItems]);
    }

    getStockItemById(
        id: number
    ): Observable<StockItem | undefined> {
        const stockItem = this.stockItems.find(
            item => item.id === id
        );

        return of(stockItem);
    }

    getLowStockItems(): Observable<StockItem[]> {
        const lowStockItems = this.stockItems.filter(
            item =>
                item.status === 'low-stock' ||
                item.status === 'out-of-stock'
        );

        return of([...lowStockItems]);
    }

    getStockMovements(): Observable<StockMovement[]> {
        return of([...this.movements]);
    }

    updateStockStatus(item: StockItem): void {
        if (item.quantity <= 0) {
            item.status = 'out-of-stock';
        } else if (item.quantity <= item.reorderLevel) {
            item.status = 'low-stock';
        } else {
            item.status = 'in-stock';
        }

        item.stockValue =
            item.quantity * item.unitCost;

        item.updatedAt =
            new Date().toISOString();
    }

    adjustStock(
        productId: number,
        quantity: number,
        reference = 'MANUAL',
        notes = 'Manual stock adjustment'
    ): Observable<StockItem | undefined> {

        const item = this.stockItems.find(
            stockItem =>
                stockItem.productId === productId
        );

        if (!item) {
            return of(undefined);
        }

        item.quantity = Math.max(
            item.quantity + quantity,
            0
        );

        this.updateStockStatus(item);

        const movement: StockMovement = {
            id: this.getNextMovementId(),
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            type: 'adjustment',
            quantity,
            reference,
            notes,
            createdAt: new Date().toISOString()
        };

        this.movements.unshift(movement);

        return of({ ...item });
    }

    getTotalQuantity(): number {
        return this.stockItems.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );
    }

    getTotalStockValue(): number {
        return this.stockItems.reduce(
            (total, item) =>
                total + item.stockValue,
            0
        );
    }

    getLowStockCount(): number {
        return this.stockItems.filter(
            item =>
                item.status === 'low-stock'
        ).length;
    }

    getOutOfStockCount(): number {
        return this.stockItems.filter(
            item =>
                item.status === 'out-of-stock'
        ).length;
    }

    private getNextMovementId(): number {
        return this.movements.length > 0
            ? Math.max(
                ...this.movements.map(
                    movement => movement.id
                )
            ) + 1
            : 1;
    }
}