import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PurchaseOrder } from '../../../shared/models/purchase-order';
import { PurchaseOrderService } from '../../purchases/services/purchase-order.service';

@Component({
  selector: 'app-purchase-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './purchase-report.component.html',
  styleUrl: './purchase-report.component.scss'
})
export class PurchaseReportComponent implements OnInit {

  purchaseOrders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];

  fromDate = '';
  toDate = '';

  loading = false;
  errorMessage = '';

  constructor(
    private purchaseOrderService: PurchaseOrderService
  ) { }

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {

    this.loading = true;

    this.purchaseOrderService
      .getPurchaseOrders()
      .subscribe({

        next: (orders) => {

          this.purchaseOrders = orders;

          this.applyFilters();

          this.loading = false;
        },

        error: () => {

          this.errorMessage =
            'Unable to load purchase report.';

          this.loading = false;
        }
      });
  }

  applyFilters(): void {

    this.filteredOrders =
      this.purchaseOrders.filter(order => {

        const orderDate =
          order.orderDate.substring(0, 10);

        return (
          (!this.fromDate ||
            orderDate >= this.fromDate) &&
          (!this.toDate ||
            orderDate <= this.toDate)
        );
      });
  }

  resetFilters(): void {

    this.fromDate = '';
    this.toDate = '';

    this.applyFilters();
  }

  get totalOrders(): number {
    return this.filteredOrders.length;
  }

  get totalPurchase(): number {

    return this.filteredOrders.reduce(
      (total, order) =>
        total + order.totalAmount,
      0
    );
  }

  get totalTax(): number {

    return this.filteredOrders.reduce(
      (total, order) =>
        total + order.taxAmount,
      0
    );
  }

  get orderedCount(): number {

    return this.filteredOrders.filter(
      order => order.status === 'ordered'
    ).length;
  }

  get draftCount(): number {

    return this.filteredOrders.filter(
      order => order.status === 'draft'
    ).length;
  }

  getStatusClass(status: string): string {

    switch (status) {

      case 'draft':
        return 'status-draft';

      case 'ordered':
        return 'status-ordered';

      case 'received':
        return 'status-received';

      case 'cancelled':
        return 'status-cancelled';

      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {

    switch (status) {

      case 'draft':
        return 'Draft';

      case 'ordered':
        return 'Ordered';

      case 'received':
        return 'Received';

      case 'cancelled':
        return 'Cancelled';

      default:
        return status;
    }
  }

  printReport(): void {
    window.print();
  }
}