import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SalesOrder, SalesOrderStatus } from '../../../../../shared/models/sales-order';
import { SalesOrderService } from '../../services/sales-order.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-sales-order-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink,
    FormsModule
  ],
  templateUrl: './sales-order-list.component.html',
  styleUrl: './sales-order-list.component.scss'
})
export class SalesOrderListComponent implements OnInit {

  salesOrders: SalesOrder[] = [];
  filteredOrders: SalesOrder[] = [];

  searchTerm = '';
  selectedStatus = '';

  isLoading = true;
  errorMessage = '';

  constructor(
    private salesOrderService: SalesOrderService
  ) { }

  ngOnInit(): void {
    this.loadSalesOrders();
  }

  loadSalesOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.salesOrderService.getSalesOrders().subscribe({
      next: orders => {
        this.salesOrders = orders;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load sales orders.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredOrders = this.salesOrders.filter(order => {

      const matchesSearch =
        !search ||
        order.orderNumber.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search);

      const matchesStatus =
        !this.selectedStatus ||
        order.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  getStatusLabel(status: SalesOrderStatus): string {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  getStatusClass(status: SalesOrderStatus): string {
    return `status-${status}`;
  }

  get totalOrders(): number {
    return this.salesOrders.length;
  }

  get totalValue(): number {
    return this.salesOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );
  }

  get pendingOrders(): number {
    return this.salesOrders.filter(
      order =>
        order.status === 'draft' ||
        order.status === 'confirmed' ||
        order.status === 'processing'
    ).length;
  }
}