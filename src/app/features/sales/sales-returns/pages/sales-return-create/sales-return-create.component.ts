import {
  CommonModule,
  DecimalPipe
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { Invoice } from '../../../../../shared/models/invoice';
import { Product } from '../../../../../shared/models/product';
import { InvoiceItem } from '../../../../../shared/models/invoice-item';
import { InvoiceService } from '../../../invoices/services/invoice.service';
import { ProductService } from '../../../../products/services/product.service';
import { SalesReturnService } from '../../services/sales-return.service';
import { SalesReturnItem } from '../../../../../shared/models/sales-return-item';


@Component({
  selector: 'app-sales-return-create',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './sales-return-create.component.html',
  styleUrl: './sales-return-create.component.scss'
})
export class SalesReturnCreateComponent
  implements OnInit {

  invoices: Invoice[] = [];
  products: Product[] = [];

  selectedInvoiceItems: InvoiceItem[] = [];

  salesReturnForm: FormGroup;

  isSaving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private productService: ProductService,
    private salesReturnService: SalesReturnService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.salesReturnForm = this.fb.group({
      invoiceId: ['', Validators.required],
      returnDate: [
        new Date()
          .toISOString()
          .substring(0, 10),
        Validators.required
      ],
      reason: ['', Validators.required],
      notes: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadInvoices();
    this.loadProducts();

    const invoiceId =
      this.route.snapshot.queryParamMap
        .get('invoiceId');

    if (invoiceId) {
      this.salesReturnForm.patchValue({
        invoiceId
      });

      this.loadInvoiceItems(Number(invoiceId));
    }

    this.addItem();
  }

  get items(): FormArray {
    return this.salesReturnForm
      .get('items') as FormArray;
  }

  loadInvoices(): void {
    this.invoiceService
      .getInvoices()
      .subscribe({
        next: invoices => {
          this.invoices =
            invoices.filter(
              invoice =>
                invoice.status !== 'cancelled'
            );
        }
      });
  }

  loadProducts(): void {
    this.productService
      .getProducts()
      .subscribe({
        next: products => {
          this.products = products.filter(
            product => product.isActive
          );
        }
      });
  }

  onInvoiceChange(): void {
    const invoiceId = Number(
      this.salesReturnForm
        .get('invoiceId')
        ?.value
    );

    this.loadInvoiceItems(invoiceId);
  }

  loadInvoiceItems(invoiceId: number): void {

    if (!invoiceId) {
      this.selectedInvoiceItems = [];
      return;
    }

    this.invoiceService
      .getInvoiceItems(invoiceId)
      .subscribe({
        next: items => {
          this.selectedInvoiceItems = items;

          if (items.length > 0) {
            this.items.clear();

            items.forEach(item => {
              this.items.push(
                this.createItem(item)
              );
            });
          }
        }
      });
  }

  createItem(
    invoiceItem?: InvoiceItem
  ): FormGroup {

    return this.fb.group({
      productId: [
        invoiceItem?.productId ?? '',
        Validators.required
      ],

      quantity: [
        invoiceItem?.quantity ?? 1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      unitPrice: [
        invoiceItem?.unitPrice ?? 0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      taxRate: [
        invoiceItem?.taxRate ?? 18,
        [
          Validators.required,
          Validators.min(0)
        ]
      ]
    });
  }

  addItem(): void {
    this.items.push(
      this.createItem()
    );
  }

  removeItem(index: number): void {

    if (this.items.length === 1) {
      return;
    }

    this.items.removeAt(index);
  }

  getItemSubtotal(index: number): number {

    const item = this.items.at(index);

    const quantity =
      Number(
        item.get('quantity')?.value
      ) || 0;

    const unitPrice =
      Number(
        item.get('unitPrice')?.value
      ) || 0;

    return quantity * unitPrice;
  }

  getItemTax(index: number): number {

    const item = this.items.at(index);

    const subtotal =
      this.getItemSubtotal(index);

    const taxRate =
      Number(
        item.get('taxRate')?.value
      ) || 0;

    return subtotal * taxRate / 100;
  }

  getItemTotal(index: number): number {
    return (
      this.getItemSubtotal(index) +
      this.getItemTax(index)
    );
  }

  get subtotal(): number {
    return this.items.controls.reduce(
      (total, _, index) =>
        total +
        this.getItemSubtotal(index),
      0
    );
  }

  get taxAmount(): number {
    return this.items.controls.reduce(
      (total, _, index) =>
        total +
        this.getItemTax(index),
      0
    );
  }

  get totalAmount(): number {
    return this.subtotal +
      this.taxAmount;
  }

  saveReturn(): void {

    if (this.salesReturnForm.invalid) {
      this.salesReturnForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const invoiceId = Number(
      this.salesReturnForm
        .get('invoiceId')
        ?.value
    );

    const invoice =
      this.invoices.find(
        item => item.id === invoiceId
      );

    if (!invoice) {
      this.errorMessage =
        'Please select a valid invoice.';
      this.isSaving = false;
      return;
    }

    const returnItems:
      SalesReturnItem[] =
      this.items.controls.map(
        control => {

          const productId = Number(
            control.get('productId')?.value
          );

          const product =
            this.products.find(
              item => item.id === productId
            );

          const index =
            this.items.controls.indexOf(
              control
            );

          return {
            id: 0,
            salesReturnId: 0,
            productId,
            productName:
              product?.name ?? '',
            sku:
              product?.sku ?? '',
            quantity: Number(
              control.get('quantity')?.value
            ),
            unitPrice: Number(
              control.get('unitPrice')?.value
            ),
            taxRate: Number(
              control.get('taxRate')?.value
            ),
            taxAmount:
              this.getItemTax(index),
            totalAmount:
              this.getItemTotal(index)
          };
        }
      );

    this.salesReturnService
      .createSalesReturn(
        {
          invoiceId: invoice.id,
          invoiceNumber:
            invoice.invoiceNumber,
          customerId:
            invoice.customerId,
          customerName:
            invoice.customerName,
          returnDate:
            this.salesReturnForm
              .get('returnDate')
              ?.value,
          status: 'draft',
          subtotal: this.subtotal,
          taxAmount: this.taxAmount,
          totalAmount: this.totalAmount,
          reason:
            this.salesReturnForm
              .get('reason')
              ?.value,
          notes:
            this.salesReturnForm
              .get('notes')
              ?.value || ''
        },
        returnItems
      )
      .subscribe({
        next: salesReturn => {
          this.isSaving = false;

          this.router.navigate([
            '/sales-returns',
            salesReturn.id
          ]);
        },

        error: () => {
          this.errorMessage =
            'Unable to create sales return.';
          this.isSaving = false;
        }
      });
  }
}