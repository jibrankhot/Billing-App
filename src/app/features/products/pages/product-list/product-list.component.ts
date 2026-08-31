import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Product } from '../../../../shared/models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    FormsModule
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];

  searchTerm = '';

  selectedCategory = '';

  selectedStatus = 'all';

  isLoading = false;

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  get filteredProducts(): Product[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.products.filter(product => {

      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search);

      const matchesCategory =
        !this.selectedCategory ||
        product.categoryName === this.selectedCategory;

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && product.isActive) ||
        (this.selectedStatus === 'inactive' && !product.isActive);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products;
        this.isLoading = false;
      },

      error: error => {
        console.error('Failed to load products:', error);
        this.isLoading = false;
      }
    });
  }

  viewProduct(product: Product): void {
    this.router.navigate([
      '/products',
      product.id
    ]);
  }

  editProduct(product: Product): void {
    this.router.navigate([
      '/products',
      product.id,
      'edit'
    ]);
  }

  isLowStock(product: Product): boolean {
    return product.currentStock <= product.minimumStock;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = 'all';
  }
}