import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PurchaseOrder } from '../../../../shared/models/purchase-order';
import { PurchaseOrderItem } from '../../../../shared/models/purchase-order-item';

import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'app-purchase-order-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './purchase-order-details.component.html',
  styleUrl: './purchase-order-details.component.scss'
})
export class PurchaseOrderDetailsComponent implements OnInit {

  purchaseOrder: PurchaseOrder | null = null;

  purchaseOrderItems: PurchaseOrderItem[] = [];

  isLoading = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly purchaseOrderService: PurchaseOrderService
  ) { }

  ngOnInit(): void {
    this.loadPurchaseOrder();
  }

  loadPurchaseOrder(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {
      this.router.navigate([
        '/purchases'
      ]);

      return;
    }

    this.isLoading = true;

    this.purchaseOrderService
      .getPurchaseOrderById(id)
      .subscribe({

        next: purchaseOrder => {

          this.purchaseOrder =
            purchaseOrder;

          if (!purchaseOrder) {

            this.isLoading = false;

            this.router.navigate([
              '/purchases'
            ]);

            return;
          }

          this.loadPurchaseOrderItems(
            purchaseOrder.id
          );
        },

        error: error => {

          console.error(
            'Failed to load purchase order:',
            error
          );

          this.isLoading = false;

          this.router.navigate([
            '/purchases'
          ]);
        }
      });
  }

  loadPurchaseOrderItems(
    purchaseOrderId: number
  ): void {

    this.purchaseOrderService
      .getPurchaseOrderItems(
        purchaseOrderId
      )
      .subscribe({

        next: items => {

          this.purchaseOrderItems =
            items;

          this.isLoading = false;
        },

        error: error => {

          console.error(
            'Failed to load purchase order items:',
            error
          );

          this.isLoading = false;
        }
      });
  }

  getStatusLabel(
    status: PurchaseOrder['status']
  ): string {

    switch (status) {

      case 'draft':
        return 'Draft';

      case 'ordered':
        return 'Ordered';

      case 'partially-received':
        return 'Partially Received';

      case 'received':
        return 'Received';

      case 'cancelled':
        return 'Cancelled';

      default:
        return status;
    }
  }

  getStatusClass(
    status: PurchaseOrder['status']
  ): string {

    return `status-${status}`;
  }

  editPurchaseOrder(): void {

    if (!this.purchaseOrder) {
      return;
    }

    this.router.navigate([
      '/purchases',
      this.purchaseOrder.id,
      'edit'
    ]);
  }

  goBack(): void {

    this.router.navigate([
      '/purchases'
    ]);
  }
}