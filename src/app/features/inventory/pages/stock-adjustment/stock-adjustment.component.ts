import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { StockItem } from '../../../../shared/models/stock';

import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl:
    './stock-adjustment.component.html',
  styleUrl:
    './stock-adjustment.component.scss'
})
export class StockAdjustmentComponent
  implements OnInit {

  stockItems: StockItem[] = [];

  adjustmentForm: FormGroup;

  selectedItem: StockItem | null = null;

  isLoading = true;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private router: Router
  ) {
    this.adjustmentForm = this.fb.group({
      productId: [
        '',
        Validators.required
      ],

      adjustmentType: [
        'add',
        Validators.required
      ],

      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      reference: [
        '',
        Validators.maxLength(50)
      ],

      notes: [
        '',
        Validators.maxLength(250)
      ]
    });
  }

  ngOnInit(): void {
    this.loadStock();
  }

  loadStock(): void {
    this.isLoading = true;

    this.inventoryService
      .getStockItems()
      .subscribe({
        next: (items) => {
          this.stockItems = items;
          this.isLoading = false;
        },

        error: () => {
          this.errorMessage =
            'Unable to load stock items.';
          this.isLoading = false;
        }
      });
  }

  onProductChange(): void {
    const productId = Number(
      this.adjustmentForm
        .get('productId')
        ?.value
    );

    this.selectedItem =
      this.stockItems.find(
        item =>
          item.productId === productId
      ) ?? null;
  }

  get adjustedQuantity(): number {
    if (!this.selectedItem) {
      return 0;
    }

    const quantity = Number(
      this.adjustmentForm
        .get('quantity')
        ?.value
    ) || 0;

    const type =
      this.adjustmentForm
        .get('adjustmentType')
        ?.value;

    if (type === 'remove') {
      return Math.max(
        this.selectedItem.quantity -
        quantity,
        0
      );
    }

    return (
      this.selectedItem.quantity +
      quantity
    );
  }

  saveAdjustment(): void {
    if (this.adjustmentForm.invalid) {
      this.adjustmentForm.markAllAsTouched();
      return;
    }

    const productId = Number(
      this.adjustmentForm
        .get('productId')
        ?.value
    );

    const quantity = Number(
      this.adjustmentForm
        .get('quantity')
        ?.value
    );

    const adjustmentType =
      this.adjustmentForm
        .get('adjustmentType')
        ?.value;

    const signedQuantity =
      adjustmentType === 'remove'
        ? -quantity
        : quantity;

    const reference =
      this.adjustmentForm
        .get('reference')
        ?.value?.trim() ||
      'MANUAL';

    const notes =
      this.adjustmentForm
        .get('notes')
        ?.value?.trim() ||
      'Manual stock adjustment';

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.inventoryService
      .adjustStock(
        productId,
        signedQuantity,
        reference,
        notes
      )
      .subscribe({
        next: (item) => {

          if (!item) {
            this.errorMessage =
              'Product stock item was not found.';
            this.isSaving = false;
            return;
          }

          this.isSaving = false;

          this.successMessage =
            `Stock updated successfully. ` +
            `${item.productName} now has ` +
            `${item.quantity} units.`;

          this.adjustmentForm.reset({
            productId: '',
            adjustmentType: 'add',
            quantity: 1,
            reference: '',
            notes: ''
          });

          this.selectedItem = null;
        },

        error: () => {
          this.isSaving = false;
          this.errorMessage =
            'Unable to adjust stock.';
        }
      });
  }

  cancel(): void {
    this.router.navigate([
      '/inventory'
    ]);
  }
}