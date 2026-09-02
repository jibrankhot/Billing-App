import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Product } from '../../../../shared/models/product';
import { PurchaseOrder } from '../../../../shared/models/purchase-order';
import { PurchaseOrderItem } from '../../../../shared/models/purchase-order-item';
import { Supplier } from '../../../../shared/models/supplier';

import { ProductService } from '../../../products/services/product.service';
import { SupplierService } from '../../../suppliers/services/supplier.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'app-purchase-order-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './purchase-order-edit.component.html',
  styleUrl: './purchase-order-edit.component.scss'
})
export class PurchaseOrderEditComponent implements OnInit {

  purchaseOrderForm: FormGroup;

  products: Product[] = [];
  suppliers: Supplier[] = [];

  purchaseOrder: PurchaseOrder | null = null;

  isLoading = false;
  isLoadingProducts = false;
  isLoadingSuppliers = false;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly supplierService: SupplierService,
    private readonly purchaseOrderService: PurchaseOrderService
  ) {
    this.purchaseOrderForm = this.fb.group({
      orderNumber: ['', Validators.required],
      supplierId: [null, Validators.required],
      orderDate: ['', Validators.required],
      expectedDate: [''],
      status: ['draft', Validators.required],

      items: this.fb.array([]),

      subtotal: [0],
      taxAmount: [0],
      discountAmount: [0],
      totalAmount: [0],

      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadSuppliers();
    this.loadPurchaseOrder();
  }

  get items(): FormArray {
    return this.purchaseOrderForm.get('items') as FormArray;
  }

  loadProducts(): void {
    this.isLoadingProducts = true;

    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products.filter(product => product.isActive);
        this.isLoadingProducts = false;
      },
      error: error => {
        console.error('Error loading products:', error);
        this.isLoadingProducts = false;
      }
    });
  }

  loadSuppliers(): void {
    this.isLoadingSuppliers = true;

    this.supplierService.getSuppliers().subscribe({
      next: suppliers => {
        this.suppliers = suppliers.filter(supplier => supplier.isActive);
        this.isLoadingSuppliers = false;
      },
      error: error => {
        console.error('Error loading suppliers:', error);
        this.isLoadingSuppliers = false;
      }
    });
  }

  loadPurchaseOrder(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.router.navigate(['/purchases']);
      return;
    }

    this.isLoading = true;

    this.purchaseOrderService.getPurchaseOrderById(id).subscribe({
      next: purchaseOrder => {
        if (!purchaseOrder) {
          this.isLoading = false;
          this.router.navigate(['/purchases']);
          return;
        }

        this.purchaseOrder = purchaseOrder;

        this.purchaseOrderForm.patchValue({
          orderNumber: purchaseOrder.orderNumber,
          supplierId: purchaseOrder.supplierId,
          orderDate: purchaseOrder.orderDate,
          expectedDate: purchaseOrder.expectedDate,
          status: purchaseOrder.status,
          subtotal: purchaseOrder.subtotal,
          taxAmount: purchaseOrder.taxAmount,
          discountAmount: purchaseOrder.discountAmount,
          totalAmount: purchaseOrder.totalAmount,
          notes: purchaseOrder.notes
        });

        this.loadPurchaseOrderItems(purchaseOrder.id);
      },
      error: error => {
        console.error('Error loading purchase order:', error);
        this.isLoading = false;
        this.router.navigate(['/purchases']);
      }
    });
  }

  loadPurchaseOrderItems(purchaseOrderId: number): void {
    this.purchaseOrderService
      .getPurchaseOrderItems(purchaseOrderId)
      .subscribe({
        next: purchaseOrderItems => {
          this.items.clear();

          purchaseOrderItems.forEach(item => {
            this.items.push(
              this.createItem(item)
            );
          });

          this.calculateTotals();

          this.isLoading = false;
        },
        error: error => {
          console.error('Error loading purchase order items:', error);
          this.isLoading = false;
        }
      });
  }

  private createItem(item?: PurchaseOrderItem): FormGroup {
    return this.fb.group({
      productId: [
        item?.productId ?? null,
        Validators.required
      ],
      productName: [
        item?.productName ?? '',
        Validators.required
      ],
      sku: [
        item?.sku ?? ''
      ],
      quantity: [
        item?.quantity ?? 1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      unitPrice: [
        item?.unitPrice ?? 0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      taxRate: [
        item?.taxRate ?? 0,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ]
      ],
      taxAmount: [
        item?.taxAmount ?? 0
      ],
      discountAmount: [
        item?.discountAmount ?? 0,
        Validators.min(0)
      ],
      totalAmount: [
        item?.totalAmount ?? 0
      ]
    });
  }

  onProductChange(index: number): void {
    const item = this.items.at(index);

    const productId = Number(
      item.get('productId')?.value
    );

    const product = this.products.find(
      product => product.id === productId
    );

    if (!product) {
      return;
    }

    item.patchValue({
      productName: product.name,
      sku: product.sku,
      unitPrice: product.purchasePrice,
      taxRate: product.taxRate
    });

    this.calculateItemTotal(index);
  }

  addItem(): void {
    this.items.push(this.createItem());
    this.calculateTotals();
  }

  removeItem(index: number): void {
    if (this.items.length === 1) {
      return;
    }

    this.items.removeAt(index);
    this.calculateTotals();
  }

  calculateItemTotal(index: number): void {
    const item = this.items.at(index);

    const quantity = Number(
      item.get('quantity')?.value || 0
    );

    const unitPrice = Number(
      item.get('unitPrice')?.value || 0
    );

    const taxRate = Number(
      item.get('taxRate')?.value || 0
    );

    const discountAmount = Number(
      item.get('discountAmount')?.value || 0
    );

    const subtotal = quantity * unitPrice;

    const taxableAmount = Math.max(
      subtotal - discountAmount,
      0
    );

    const taxAmount =
      taxableAmount * taxRate / 100;

    const totalAmount =
      taxableAmount + taxAmount;

    item.patchValue(
      {
        taxAmount: this.roundNumber(taxAmount),
        totalAmount: this.roundNumber(totalAmount)
      },
      {
        emitEvent: false
      }
    );

    this.calculateTotals();
  }

  calculateTotals(): void {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    this.items.controls.forEach(item => {
      const quantity = Number(
        item.get('quantity')?.value || 0
      );

      const unitPrice = Number(
        item.get('unitPrice')?.value || 0
      );

      subtotal += quantity * unitPrice;

      taxAmount += Number(
        item.get('taxAmount')?.value || 0
      );

      discountAmount += Number(
        item.get('discountAmount')?.value || 0
      );
    });

    const totalAmount =
      subtotal - discountAmount + taxAmount;

    this.purchaseOrderForm.patchValue(
      {
        subtotal: this.roundNumber(subtotal),
        taxAmount: this.roundNumber(taxAmount),
        discountAmount: this.roundNumber(discountAmount),
        totalAmount: this.roundNumber(totalAmount)
      },
      {
        emitEvent: false
      }
    );
  }

  submit(): void {
    if (this.purchaseOrderForm.invalid) {
      this.purchaseOrderForm.markAllAsTouched();

      this.items.controls.forEach(item => {
        item.markAllAsTouched();
      });

      return;
    }

    if (!this.purchaseOrder) {
      return;
    }

    this.isSubmitting = true;

    const formValue =
      this.purchaseOrderForm.getRawValue();

    const selectedSupplier =
      this.suppliers.find(
        supplier =>
          supplier.id === Number(formValue.supplierId)
      );

    const purchaseOrderData: Partial<PurchaseOrder> = {
      orderNumber: formValue.orderNumber,
      supplierId: Number(formValue.supplierId),
      supplierName: selectedSupplier?.name
        ?? this.purchaseOrder.supplierName,
      orderDate: formValue.orderDate,
      expectedDate: formValue.expectedDate,
      status: formValue.status,
      subtotal: Number(formValue.subtotal),
      taxAmount: Number(formValue.taxAmount),
      discountAmount: Number(formValue.discountAmount),
      totalAmount: Number(formValue.totalAmount),
      notes: formValue.notes
    };

    const purchaseOrderItems:
      Omit<
        PurchaseOrderItem,
        'id' | 'purchaseOrderId'
      >[] = formValue.items.map(
        (item: PurchaseOrderItem) => ({
          productId: Number(item.productId),
          productName: item.productName,
          sku: item.sku,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate),
          taxAmount: Number(item.taxAmount),
          discountAmount: Number(item.discountAmount),
          totalAmount: Number(item.totalAmount)
        })
      );

    this.purchaseOrderService
      .updatePurchaseOrder(
        this.purchaseOrder.id,
        purchaseOrderData,
        purchaseOrderItems
      )
      .subscribe({
        next: updatedPurchaseOrder => {
          this.isSubmitting = false;

          if (!updatedPurchaseOrder) {
            return;
          }

          this.router.navigate([
            '/purchases',
            updatedPurchaseOrder.id
          ]);
        },
        error: error => {
          console.error(
            'Error updating purchase order:',
            error
          );

          this.isSubmitting = false;
        }
      });
  }

  onCancel(): void {
    if (!this.purchaseOrder) {
      this.router.navigate(['/purchases']);
      return;
    }

    this.router.navigate([
      '/purchases',
      this.purchaseOrder.id
    ]);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field =
      this.purchaseOrderForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
  }

  isItemFieldInvalid(
    index: number,
    fieldName: string
  ): boolean {
    const field =
      this.items.at(index).get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
  }

  getItemTotal(index: number): number {
    return Number(
      this.items.at(index)
        .get('totalAmount')?.value || 0
    );
  }

  private roundNumber(value: number): number {
    return Math.round(
      (value + Number.EPSILON) * 100
    ) / 100;
  }
}