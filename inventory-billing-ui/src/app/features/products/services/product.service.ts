import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/services/api-client.service';
import { Product } from '../../../shared/models/product';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private readonly endpoint = 'products';

    constructor(
        private readonly apiClient: ApiClientService
    ) { }

    getProducts(): Observable<Product[]> {
        return this.apiClient.get<Product[]>(this.endpoint);
    }

    getProductById(id: number): Observable<Product> {
        return this.apiClient.get<Product>(
            `${this.endpoint}/${id}`
        );
    }

    createProduct(productData: Partial<Product>): Observable<Product> {
        return this.apiClient.post<Product>(
            this.endpoint,
            productData
        );
    }

    updateProduct(
        id: number,
        productData: Partial<Product>
    ): Observable<Product> {

        return this.apiClient.put<Product>(
            `${this.endpoint}/${id}`,
            productData
        );
    }

    deleteProduct(id: number): Observable<boolean> {
        return this.apiClient.delete<boolean>(
            `${this.endpoint}/${id}`
        );
    }
}