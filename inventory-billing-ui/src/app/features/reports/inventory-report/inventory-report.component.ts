import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { Product } from '../../../shared/models/product';
import { ProductService } from '../../products/services/product.service';

@Component({
  selector: 'app-inventory-report',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './inventory-report.component.html',
  styleUrl: './inventory-report.component.scss'
})
export class InventoryReportComponent implements OnInit {

  products: Product[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {

    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({

      next: (products) => {

        this.products = products;

        this.loading = false;
      },

      error: () => {

        this.errorMessage =
          'Unable to load inventory report.';

        this.loading = false;
      }
    });
  }

  get totalProducts(): number {
    return this.products.length;
  }

  get activeProducts(): number {
    return this.products.filter(
      product => product.isActive
    ).length;
  }

  get inactiveProducts(): number {
    return this.products.filter(
      product => !product.isActive
    ).length;
  }

  get totalInventoryValue(): number {

    return this.products.reduce(
      (total, product) =>
        total +
        (product.purchasePrice * product.currentStock),
      0
    );
  }

  get totalSellingValue(): number {

    return this.products.reduce(
      (total, product) =>
        total +
        (product.sellingPrice * product.currentStock),
      0
    );
  }

  getLowStockProducts(): Product[] {

    return this.products.filter(
      product =>
        product.currentStock <=
        product.minimumStock
    );
  }

  getStockClass(product: Product): string {

    if (product.currentStock === 0) {
      return 'stock-out';
    }

    if (
      product.currentStock <=
      product.minimumStock
    ) {
      return 'stock-low';
    }

    return 'stock-ok';
  }

  getStockLabel(product: Product): string {

    if (product.currentStock === 0) {
      return 'Out of Stock';
    }

    if (
      product.currentStock <=
      product.minimumStock
    ) {
      return 'Low Stock';
    }

    return 'In Stock';
  }

  printReport(): void {
    window.print();
  }
}