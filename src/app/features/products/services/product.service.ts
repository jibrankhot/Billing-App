import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Product } from '../../../shared/models/product';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private readonly products: Product[] = [
        {
            id: 1,
            sku: 'PRD-001',
            name: 'Wireless Keyboard',
            description: 'Wireless keyboard with USB receiver',
            categoryId: 1,
            categoryName: 'Electronics',
            unit: 'pcs',
            purchasePrice: 850,
            sellingPrice: 1299,
            taxRate: 18,
            currentStock: 24,
            minimumStock: 10,
            isActive: true,
            createdAt: '2026-08-01T10:00:00',
            updatedAt: '2026-08-20T10:00:00'
        },
        {
            id: 2,
            sku: 'PRD-002',
            name: 'Bluetooth Mouse',
            description: 'Ergonomic wireless Bluetooth mouse',
            categoryId: 1,
            categoryName: 'Electronics',
            unit: 'pcs',
            purchasePrice: 450,
            sellingPrice: 799,
            taxRate: 18,
            currentStock: 8,
            minimumStock: 10,
            isActive: true,
            createdAt: '2026-08-02T10:00:00',
            updatedAt: '2026-08-21T10:00:00'
        },
        {
            id: 3,
            sku: 'PRD-003',
            name: 'USB Type-C Cable',
            description: 'High-speed USB Type-C charging cable',
            categoryId: 1,
            categoryName: 'Electronics',
            unit: 'pcs',
            purchasePrice: 180,
            sellingPrice: 349,
            taxRate: 18,
            currentStock: 6,
            minimumStock: 15,
            isActive: true,
            createdAt: '2026-08-03T10:00:00',
            updatedAt: '2026-08-22T10:00:00'
        },
        {
            id: 4,
            sku: 'PRD-004',
            name: 'Office Notebook',
            description: 'A4 ruled office notebook',
            categoryId: 3,
            categoryName: 'Office Supplies',
            unit: 'pcs',
            purchasePrice: 55,
            sellingPrice: 90,
            taxRate: 12,
            currentStock: 85,
            minimumStock: 20,
            isActive: true,
            createdAt: '2026-08-04T10:00:00',
            updatedAt: '2026-08-18T10:00:00'
        },
        {
            id: 5,
            sku: 'PRD-005',
            name: 'Printer Paper',
            description: 'A4 75 GSM printing paper',
            categoryId: 3,
            categoryName: 'Office Supplies',
            unit: 'pack',
            purchasePrice: 210,
            sellingPrice: 280,
            taxRate: 18,
            currentStock: 4,
            minimumStock: 10,
            isActive: true,
            createdAt: '2026-08-05T10:00:00',
            updatedAt: '2026-08-23T10:00:00'
        },
        {
            id: 6,
            sku: 'PRD-006',
            name: 'Coffee Beans',
            description: 'Premium roasted coffee beans',
            categoryId: 2,
            categoryName: 'Grocery',
            unit: 'kg',
            purchasePrice: 620,
            sellingPrice: 850,
            taxRate: 5,
            currentStock: 32,
            minimumStock: 10,
            isActive: true,
            createdAt: '2026-08-06T10:00:00',
            updatedAt: '2026-08-19T10:00:00'
        }
    ];

    getProducts(): Observable<Product[]> {
        return of(this.products);
    }

    getProductById(id: number): Observable<Product | null> {
        const product = this.products.find(
            item => item.id === id
        );

        return of(product ?? null);
    }

    createProduct(productData: Partial<Product>): Observable<Product> {
        const newProduct: Product = {
            id: this.getNextId(),
            sku: productData.sku ?? '',
            name: productData.name ?? '',
            description: productData.description ?? '',
            categoryId: productData.categoryId ?? 0,
            categoryName: productData.categoryName ?? '',
            unit: productData.unit ?? 'pcs',
            purchasePrice: productData.purchasePrice ?? 0,
            sellingPrice: productData.sellingPrice ?? 0,
            taxRate: productData.taxRate ?? 0,
            currentStock: productData.currentStock ?? 0,
            minimumStock: productData.minimumStock ?? 0,
            isActive: productData.isActive ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.products.push(newProduct);

        return of(newProduct);
    }

    updateProduct(
        id: number,
        productData: Partial<Product>
    ): Observable<Product | null> {

        const index = this.products.findIndex(
            product => product.id === id
        );

        if (index === -1) {
            return of(null);
        }

        const updatedProduct: Product = {
            ...this.products[index],
            ...productData,
            id,
            updatedAt: new Date().toISOString()
        };

        this.products[index] = updatedProduct;

        return of(updatedProduct);
    }

    deleteProduct(id: number): Observable<boolean> {
        const index = this.products.findIndex(
            product => product.id === id
        );

        if (index === -1) {
            return of(false);
        }

        this.products.splice(index, 1);

        return of(true);
    }

    private getNextId(): number {
        if (this.products.length === 0) {
            return 1;
        }

        return Math.max(
            ...this.products.map(product => product.id)
        ) + 1;
    }
}