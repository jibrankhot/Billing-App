import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { StockItem } from '../../../../shared/models/stock';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './low-stock.component.html',
  styleUrl: './low-stock.component.scss'
})
export class LowStockComponent implements OnInit {

  stockItems: StockItem[] = [];
  filteredItems: StockItem[] = [];

  searchTerm = '';

  isLoading = true;
  errorMessage = '';

  constructor(
    private inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.loadLowStockItems();
  }

  loadLowStockItems(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.inventoryService.getLowStockItems().subscribe({
      next: (items) => {
        this.stockItems = items;
        this.applyFilter();
        this.isLoading = false;
      },

      error: () => {
        this.errorMessage =
          'Unable to load low stock items.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const search =
      this.searchTerm.trim().toLowerCase();

    this.filteredItems = this.stockItems.filter(item => {

      return (
        !search ||
        item.productName
          .toLowerCase()
          .includes(search) ||
        item.sku
          .toLowerCase()
          .includes(search)
      );

    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  get outOfStockItems(): StockItem[] {
    return this.stockItems.filter(
      item => item.status === 'out-of-stock'
    );
  }

  get lowStockItems(): StockItem[] {
    return this.stockItems.filter(
      item => item.status === 'low-stock'
    );
  }

  getStatusLabel(status: StockItem['status']): string {
    switch (status) {

      case 'low-stock':
        return 'Low Stock';

      case 'out-of-stock':
        return 'Out of Stock';

      case 'in-stock':
        return 'In Stock';

      default:
        return status;
    }
  }

  getStatusClass(status: StockItem['status']): string {
    return `status-${status}`;
  }
}