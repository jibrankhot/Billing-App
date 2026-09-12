import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Customer } from '../../../../../shared/models/customer';
import { Product } from '../../../../../shared/models/product';
import { CustomerService } from '../../../../customers/services/customer.service';
import { ProductService } from '../../../../products/services/product.service';
import { SalesOrderService } from '../../services/sales-order.service';
import { SalesOrderItem } from '../../../../../shared/models/sales-order-item';



@Component({
  selector: 'app-sales-order-create',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './sales-order-create.component.html',
  styleUrl: './sales-order-create.component.scss'
})
export class SalesOrderCreateComponent implements OnInit {

  customers: Customer[] = [];
  products: Product[] = [];

  salesOrderForm: FormGroup;

  isSaving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private productService: ProductService,
    private salesOrderService: SalesOrderService,
    private router: Router
  ) {
    this.salesOrderForm = this.fb.group({
      customerId: ['', Validators.required],
      orderDate: [
        new Date().toISOString().substring(0, 10),
        Validators.required
      ],
      expectedDeliveryDate: [''],
      notes: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();
    this.addItem();
  }

  get items(): FormArray {
    return this.salesOrderForm.get('items') as FormArray;
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: customers => {
        this.customers = customers.filter(
          customer => customer.isActive
        );
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products.filter(
          product => product.isActive
        );
      }
    });
  }

  createItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxRate: [18, [Validators.required, Validators.min(0)]],
      discountAmount: [0, [Validators.min(0)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length === 1) {
      return;
    }

    this.items.removeAt(index);
  }

  onProductChange(index: number): void {
    const item = this.items.at(index);
    const productId = Number(item.get('productId')?.value);

    const product = this.products.find(
      productItem => productItem.id === productId
    );

    if (!product) {
      return;
    }

    item.patchValue({
      unitPrice: product.sellingPrice,
      taxRate: product.taxRate
    });
  }

  getItemSubtotal(index: number): number {
    const item = this.items.at(index);

    const quantity = Number(item.get('quantity')?.value) || 0;
    const unitPrice = Number(item.get('unitPrice')?.value) || 0;

    return quantity * unitPrice;
  }

  getItemTax(index: number): number {
    const item = this.items.at(index);

    const subtotal = this.getItemSubtotal(index);
    const taxRate = Number(item.get('taxRate')?.value) || 0;
    const discount = Number(
      item.get('discountAmount')?.value
    ) || 0;

    return Math.max(0, subtotal - discount) * taxRate / 100;
  }

  getItemTotal(index: number): number {
    const subtotal = this.getItemSubtotal(index);

    const discount = Number(
      this.items.at(index).get('discountAmount')?.value
    ) || 0;

    return Math.max(
      0,
      subtotal - discount + this.getItemTax(index)
    );
  }

  get subtotal(): number {
    return this.items.controls.reduce(
      (total, _, index) => total + this.getItemSubtotal(index),
      0
    );
  }

  get discountAmount(): number {
    return this.items.controls.reduce(
      (total, item) =>
        total +
        (Number(item.get('discountAmount')?.value) || 0),
      0
    );
  }

  get taxAmount(): number {
    return this.items.controls.reduce(
      (total, _, index) => total + this.getItemTax(index),
      0
    );
  }

  get totalAmount(): number {
    return Math.max(
      0,
      this.subtotal -
      this.discountAmount +
      this.taxAmount
    );
  }

  saveOrder(): void {
    if (this.salesOrderForm.invalid) {
      this.salesOrderForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const customerId = Number(
      this.salesOrderForm.get('customerId')?.value
    );

    const customer = this.customers.find(
      item => item.id === customerId
    );

    if (!customer) {
      this.errorMessage = 'Please select a valid customer.';
      this.isSaving = false;
      return;
    }

    const items: SalesOrderItem[] =
      this.items.controls.map((control, index) => ({
        id: 0,
        salesOrderId: 0,
        productId: Number(control.get('productId')?.value),
        productName: this.getProductName(
          Number(control.get('productId')?.value)
        ),
        sku: this.getProductSku(
          Number(control.get('productId')?.value)
        ),
        quantity: Number(control.get('quantity')?.value),
        unitPrice: Number(control.get('unitPrice')?.value),
        taxRate: Number(control.get('taxRate')?.value),
        taxAmount: this.getItemTax(index),
        discountAmount:
          Number(control.get('discountAmount')?.value) || 0,
        totalAmount: this.getItemTotal(index)
      }));

    this.salesOrderService.createSalesOrder(
      {
        customerId,
        customerName: customer.name,
        orderDate:
          this.salesOrderForm.get('orderDate')?.value,
        expectedDeliveryDate:
          this.salesOrderForm.get('expectedDeliveryDate')?.value || null,
        status: 'draft',
        subtotal: this.subtotal,
        taxAmount: this.taxAmount,
        discountAmount: this.discountAmount,
        totalAmount: this.totalAmount,
        notes: this.salesOrderForm.get('notes')?.value || ''
      },
      items
    ).subscribe({
      next: order => {
        this.isSaving = false;
        this.router.navigate(['/sales-orders', order.id]);
      },
      error: () => {
        this.errorMessage = 'Unable to create sales order.';
        this.isSaving = false;
      }
    });
  }

  getProductName(productId: number): string {
    return this.products.find(
      product => product.id === productId
    )?.name ?? '';
  }

  getProductSku(productId: number): string {
    return this.products.find(
      product => product.id === productId
    )?.sku ?? '';
  }
}