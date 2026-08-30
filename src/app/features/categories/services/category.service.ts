import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Category } from '../../../shared/models/category';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    private readonly categories: Category[] = [
        {
            id: 1,
            name: 'Electronics',
            description: 'Electronic products and accessories',
            isActive: true,
            productCount: 3,
            createdAt: '2026-08-01T10:00:00',
            updatedAt: '2026-08-20T10:00:00'
        },
        {
            id: 2,
            name: 'Grocery',
            description: 'Food and grocery products',
            isActive: true,
            productCount: 1,
            createdAt: '2026-08-02T10:00:00',
            updatedAt: '2026-08-19T10:00:00'
        },
        {
            id: 3,
            name: 'Office Supplies',
            description: 'Office and stationery products',
            isActive: true,
            productCount: 2,
            createdAt: '2026-08-03T10:00:00',
            updatedAt: '2026-08-18T10:00:00'
        },
        {
            id: 4,
            name: 'Furniture',
            description: 'Office and home furniture',
            isActive: true,
            productCount: 0,
            createdAt: '2026-08-04T10:00:00',
            updatedAt: '2026-08-17T10:00:00'
        },
        {
            id: 5,
            name: 'Cleaning Supplies',
            description: 'Cleaning and maintenance products',
            isActive: false,
            productCount: 0,
            createdAt: '2026-08-05T10:00:00',
            updatedAt: '2026-08-16T10:00:00'
        }
    ];

    getCategories(): Observable<Category[]> {
        return of(this.categories);
    }

    getCategoryById(id: number): Observable<Category | null> {
        const category = this.categories.find(
            item => item.id === id
        );

        return of(category ?? null);
    }

    createCategory(
        categoryData: Partial<Category>
    ): Observable<Category> {

        const now = new Date().toISOString();

        const newCategory: Category = {
            id: this.getNextId(),
            name: categoryData.name ?? '',
            description: categoryData.description ?? '',
            isActive: categoryData.isActive ?? true,
            productCount: 0,
            createdAt: now,
            updatedAt: now
        };

        this.categories.push(newCategory);

        return of(newCategory);
    }

    updateCategory(
        id: number,
        categoryData: Partial<Category>
    ): Observable<Category | null> {

        const index = this.categories.findIndex(
            category => category.id === id
        );

        if (index === -1) {
            return of(null);
        }

        const updatedCategory: Category = {
            ...this.categories[index],
            ...categoryData,
            id,
            updatedAt: new Date().toISOString()
        };

        this.categories[index] = updatedCategory;

        return of(updatedCategory);
    }

    deleteCategory(id: number): Observable<boolean> {
        const index = this.categories.findIndex(
            category => category.id === id
        );

        if (index === -1) {
            return of(false);
        }

        this.categories.splice(index, 1);

        return of(true);
    }

    private getNextId(): number {
        if (this.categories.length === 0) {
            return 1;
        }

        return Math.max(
            ...this.categories.map(category => category.id)
        ) + 1;
    }
}