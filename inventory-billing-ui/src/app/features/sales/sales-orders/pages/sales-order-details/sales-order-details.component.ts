import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SalesOrder, SalesOrderStatus } from '../../../../../shared/models/sales-order';
import { SalesOrderItem } from '../../../../../shared/models/sales-order-item';
import { SalesOrderService } from '../../services/sales-order.service';




@Component({
  selector: 'app-sales-order-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './sales-order-details.component.html',
  styleUrl: './sales-order-details.component.scss'
})
export class SalesOrderDetailsComponent implements OnInit {

  salesOrder: SalesOrder | undefined;
  items: SalesOrderItem[] = [];

  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private salesOrderService: SalesOrderService
  ) { }

  ngOnInit(): void {
    this.loadSalesOrder();
  }

  loadSalesOrder(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id)) {
      this.errorMessage = 'Invalid sales order ID.';
      this.isLoading = false;
      return;
    }

    this.salesOrderService.getSalesOrderById(id).subscribe({
      next: order => {
        this.salesOrder = order;

        if (!order) {
          this.errorMessage = 'Sales order not found.';
          this.isLoading = false;
          return;
        }

        this.salesOrderService
          .getSalesOrderItems(order.id)
          .subscribe({
            next: items => {
              this.items = items;
              this.isLoading = false;
            },
            error: () => {
              this.errorMessage = 'Unable to load order items.';
              this.isLoading = false;
            }
          });
      },
      error: () => {
        this.errorMessage = 'Unable to load sales order.';
        this.isLoading = false;
      }
    });
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
}