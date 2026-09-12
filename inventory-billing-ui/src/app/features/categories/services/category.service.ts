import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/services/api-client.service';
import { Category } from '../../../shared/models/category';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    private readonly endpoint = 'categories';

    constructor(
        private readonly apiClient: ApiClientService
    ) { }

    getCategories(): Observable<Category[]> {
        return this.apiClient.get<Category[]>(
            this.endpoint
        );
    }

    getCategoryById(id: number): Observable<Category> {
        return this.apiClient.get<Category>(
            `${this.endpoint}/${id}`
        );
    }

    createCategory(
        categoryData: Partial<Category>
    ): Observable<Category> {

        return this.apiClient.post<Category>(
            this.endpoint,
            categoryData
        );
    }

    updateCategory(
        id: number,
        categoryData: Partial<Category>
    ): Observable<Category> {

        return this.apiClient.put<Category>(
            `${this.endpoint}/${id}`,
            categoryData
        );
    }

    deleteCategory(id: number): Observable<boolean> {

        return this.apiClient.delete<boolean>(
            `${this.endpoint}/${id}`
        );
    }
}