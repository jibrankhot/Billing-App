import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Invoice } from '../../../../../shared/models/invoice';
import { InvoiceItem } from '../../../../../shared/models/invoice-item';

import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice-print',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './invoice-print.component.html',
  styleUrl: './invoice-print.component.scss'
})
export class InvoicePrintComponent implements OnInit {

  invoice: Invoice | null = null;
  invoiceItems: InvoiceItem[] = [];

  isLoading = true;
  errorMessage = '';

  invoiceId = 0;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    this.invoiceId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.invoiceId) {
      this.errorMessage = 'Invalid invoice ID.';
      this.isLoading = false;
      return;
    }

    this.loadInvoice();
  }

  loadInvoice(): void {
    this.invoiceService
      .getInvoiceById(this.invoiceId)
      .subscribe({
        next: (invoice) => {
          if (!invoice) {
            this.errorMessage = 'Invoice not found.';
            this.isLoading = false;
            return;
          }

          this.invoice = invoice;
          this.loadInvoiceItems();
        },
        error: () => {
          this.errorMessage = 'Unable to load invoice.';
          this.isLoading = false;
        }
      });
  }

  loadInvoiceItems(): void {
    this.invoiceService
      .getInvoiceItems(this.invoiceId)
      .subscribe({
        next: (items) => {
          this.invoiceItems = items;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage =
            'Unable to load invoice items.';
          this.isLoading = false;
        }
      });
  }

  printInvoice(): void {
    window.print();
  }

  getStatusLabel(
    status: Invoice['status']
  ): string {
    switch (status) {
      case 'draft':
        return 'Draft';

      case 'issued':
        return 'Issued';

      case 'partially-paid':
        return 'Partially Paid';

      case 'paid':
        return 'Paid';

      case 'cancelled':
        return 'Cancelled';

      default:
        return status;
    }
  }
}