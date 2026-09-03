import {
  CommonModule,
  DecimalPipe
} from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  StockItem,
  StockStatus
} from '../../../../shared/models/stock';

import { InventoryService } from '../../services/inventory.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stock-overview',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterLink,
    FormsModule
  ],
  templateUrl: './stock-overview.component.html',
  styleUrl: './stock-overview.component.scss'
})
export class StockOverviewComponent implements OnInit {

  stockItems: StockItem[] = [];
  filteredStockItems: StockItem[] = [];

  searchTerm = '';
  statusFilter = 'all';

  isLoading = true;
  errorMessage = '';

  constructor(
    private inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.loadStock();
  }

  loadStock(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.inventoryService.getStockItems().subscribe({
      next: (items) => {
        this.stockItems = items;
        this.applyFilters();
        this.isLoading = false;
      },

      error: () => {
        this.errorMessage =
          'Unable to load stock information.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const search =
      this.searchTerm.trim().toLowerCase();

    this.filteredStockItems =
      this.stockItems.filter(item => {

        const matchesSearch =
          !search ||
          item.productName
            .toLowerCase()
            .includes(search) ||
          item.sku
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          this.statusFilter === 'all' ||
          item.status === this.statusFilter;

        return matchesSearch && matchesStatus;
      });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';

    this.applyFilters();
  }

  getStatusLabel(
    status: StockStatus
  ): string {

    switch (status) {

      case 'in-stock':
        return 'In Stock';

      case 'low-stock':
        return 'Low Stock';

      case 'out-of-stock':
        return 'Out of Stock';

      default:
        return status;
    }
  }

  getStatusClass(
    status: StockStatus
  ): string {
    return `status-${status}`;
  }

  get totalProducts(): number {
    return this.stockItems.length;
  }

  get totalQuantity(): number {
    return this.stockItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }

  get totalStockValue(): number {
    return this.stockItems.reduce(
      (total, item) =>
        total + item.stockValue,
      0
    );
  }

  get lowStockCount(): number {
    return this.stockItems.filter(
      item => item.status === 'low-stock'
    ).length;
  }

  get outOfStockCount(): number {
    return this.stockItems.filter(
      item => item.status === 'out-of-stock'
    ).length;
  }
}