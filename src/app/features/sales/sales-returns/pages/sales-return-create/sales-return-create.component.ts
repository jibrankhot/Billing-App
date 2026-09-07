import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Invoice } from '../../../../../shared/models/invoice';
import { Product } from '../../../../../shared/models/product';
import { SalesReturnService } from '../../services/sales-return.service';
import { InvoiceService } from '../../../invoices/services/invoice.service';
import { ProductService } from '../../../../products/services/product.service';
import { InvoiceItem } from '../../../../../shared/models/invoice-item';
import { SalesReturnItem } from '../../../../../shared/models/sales-return-item';
import { SalesReturn } from '../../../../../shared/models/sales-return';


@Component({
  selector: 'app-sales-return-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './sales-return-create.component.html',
  styleUrl: './sales-return-create.component.scss'
})
export class SalesReturnCreateComponent implements OnInit {

  returnForm: FormGroup;

  invoices: Invoice[] = [];
  products: Product[] = [];

  selectedInvoice: Invoice | null = null;

  loading = false;
  saving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private salesReturnService: SalesReturnService,
    private invoiceService: InvoiceService,
    private productService: ProductService
  ) {
    this.returnForm = this.fb.group({
      invoiceId: ['', Validators.required],

      returnDate: [
        new Date().toISOString().split('T')[0],
        Validators.required
      ],

      reason: [
        '',
        Validators.required
      ],

      notes: [''],

      items: this.fb.array([])
    });
  }

  ngOnInit(): void {

    this.loadInvoices();
    this.loadProducts();

    const invoiceId = Number(
      this.route.snapshot.queryParamMap.get('invoiceId')
    );

    if (invoiceId) {

      this.returnForm.patchValue({
        invoiceId
      });

      this.loadInvoiceItems(invoiceId);

    } else {

      this.addItem();
    }
  }

  get items(): FormArray {
    return this.returnForm.get('items') as FormArray;
  }

  private loadInvoices(): void {

    this.invoiceService.getInvoices().subscribe({

      next: (invoices) => {
        this.invoices = invoices;

        const invoiceId = Number(
          this.returnForm.get('invoiceId')?.value
        );

        if (invoiceId) {
          this.selectedInvoice =
            this.invoices.find(
              invoice => invoice.id === invoiceId
            ) ?? null;
        }
      },

      error: () => {
        this.errorMessage =
          'Unable to load invoices.';
      }
    });
  }

  private loadProducts(): void {

    this.productService.getProducts().subscribe({

      next: (products) => {
        this.products = products;
      },

      error: () => {
        this.errorMessage =
          'Unable to load products.';
      }
    });
  }

  onInvoiceChange(): void {

    const invoiceId = Number(
      this.returnForm.get('invoiceId')?.value
    );

    if (!invoiceId) {

      this.selectedInvoice = null;

      this.items.clear();

      this.addItem();

      return;
    }

    this.loadInvoiceItems(invoiceId);
  }

  private loadInvoiceItems(invoiceId: number): void {

    this.loading = true;
    this.errorMessage = '';

    this.selectedInvoice =
      this.invoices.find(
        invoice => invoice.id === invoiceId
      ) ?? null;

    this.invoiceService
      .getInvoiceItems(invoiceId)
      .subscribe({

        next: (invoiceItems: InvoiceItem[]) => {

          this.items.clear();

          if (invoiceItems.length === 0) {

            this.addItem();

          } else {

            invoiceItems.forEach(item => {

              this.items.push(
                this.createItemForm(item)
              );

            });
          }

          this.loading = false;
        },

        error: () => {

          this.errorMessage =
            'Unable to load invoice items.';

          this.items.clear();

          this.addItem();

          this.loading = false;
        }
      });
  }

  private createItemForm(
    item?: InvoiceItem
  ): FormGroup {

    return this.fb.group({

      productId: [
        item?.productId ?? '',
        Validators.required
      ],

      productName: [
        item?.productName ?? ''
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
          Validators.min(0)
        ]
      ]
    });
  }

  addItem(): void {

    this.items.push(
      this.createItemForm()
    );
  }

  removeItem(index: number): void {

    if (this.items.length === 1) {
      return;
    }

    this.items.removeAt(index);
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

      unitPrice: product.sellingPrice,

      taxRate: product.taxRate
    });
  }

  getItemSubtotal(item: FormGroup): number {

    const quantity = Number(
      item.get('quantity')?.value || 0
    );

    const unitPrice = Number(
      item.get('unitPrice')?.value || 0
    );

    return quantity * unitPrice;
  }

  getItemTax(item: FormGroup): number {

    const subtotal =
      this.getItemSubtotal(item);

    const taxRate = Number(
      item.get('taxRate')?.value || 0
    );

    return subtotal * taxRate / 100;
  }

  getItemTotal(item: FormGroup): number {

    return (
      this.getItemSubtotal(item) +
      this.getItemTax(item)
    );
  }

  get subtotal(): number {

    return this.items.controls.reduce(
      (total, item) =>
        total +
        this.getItemSubtotal(
          item as FormGroup
        ),
      0
    );
  }

  get taxAmount(): number {

    return this.items.controls.reduce(
      (total, item) =>
        total +
        this.getItemTax(
          item as FormGroup
        ),
      0
    );
  }

  get totalAmount(): number {

    return this.subtotal +
      this.taxAmount;
  }

  isInvalid(controlName: string): boolean {

    const control =
      this.returnForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched
      )
    );
  }

  save(): void {

    if (this.returnForm.invalid) {

      this.returnForm.markAllAsTouched();

      return;
    }

    if (this.items.length === 0) {

      this.errorMessage =
        'Add at least one return item.';

      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const invoiceId = Number(
      this.returnForm.get('invoiceId')?.value
    );

    const invoice =
      this.invoices.find(
        item => item.id === invoiceId
      );

    if (!invoice) {

      this.errorMessage =
        'Selected invoice was not found.';

      this.saving = false;

      return;
    }

    const formValue =
      this.returnForm.value;

    const returnItems: SalesReturnItem[] =
      this.items.controls.map(
        (item, index) => {

          const quantity = Number(
            item.get('quantity')?.value || 0
          );

          const unitPrice = Number(
            item.get('unitPrice')?.value || 0
          );

          const taxRate = Number(
            item.get('taxRate')?.value || 0
          );

          const productId = Number(
            item.get('productId')?.value
          );

          const subtotal =
            quantity * unitPrice;

          const taxAmount =
            subtotal * taxRate / 100;

          return {

            id: 0,

            salesReturnId: 0,

            productId,

            productName:
              item.get('productName')?.value || '',

            sku:
              item.get('sku')?.value || '',

            quantity,

            unitPrice,

            taxRate,

            taxAmount,

            totalAmount:
              subtotal + taxAmount
          };
        }
      );

    const returnData: Partial<SalesReturn> = {

      invoiceId: invoice.id,

      invoiceNumber:
        invoice.invoiceNumber,

      customerId:
        invoice.customerId,

      customerName:
        invoice.customerName,

      returnDate:
        formValue.returnDate,

      status: 'draft',

      subtotal:
        this.subtotal,

      taxAmount:
        this.taxAmount,

      totalAmount:
        this.totalAmount,

      reason:
        formValue.reason,

      notes:
        formValue.notes
    };

    this.salesReturnService
      .createSalesReturn(
        returnData,
        returnItems
      )
      .subscribe({

        next: (createdReturn: SalesReturn) => {

          this.saving = false;

          this.router.navigate([
            '/sales-returns',
            createdReturn.id
          ]);
        },

        error: () => {

          this.errorMessage =
            'Unable to create sales return.';

          this.saving = false;
        }
      });
  }

  cancel(): void {

    this.router.navigate([
      '/sales-returns'
    ]);
  }
}