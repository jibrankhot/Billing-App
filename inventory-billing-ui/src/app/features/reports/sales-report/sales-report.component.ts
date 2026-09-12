import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Invoice } from '../../../shared/models/invoice';
import { InvoiceService } from '../../sales/invoices/services/invoice.service';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent implements OnInit {

  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];

  fromDate = '';
  toDate = '';

  loading = false;
  errorMessage = '';

  constructor(
    private invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {

    this.loading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoices().subscribe({
      next: (invoices) => {

        this.invoices = invoices;

        this.applyFilters();

        this.loading = false;
      },

      error: () => {

        this.errorMessage =
          'Unable to load sales report.';

        this.loading = false;
      }
    });
  }

  applyFilters(): void {

    this.filteredInvoices =
      this.invoices.filter(invoice => {

        const invoiceDate =
          invoice.invoiceDate.substring(0, 10);

        const afterFromDate =
          !this.fromDate ||
          invoiceDate >= this.fromDate;

        const beforeToDate =
          !this.toDate ||
          invoiceDate <= this.toDate;

        return afterFromDate && beforeToDate;
      });
  }

  resetFilters(): void {

    this.fromDate = '';
    this.toDate = '';

    this.applyFilters();
  }

  get totalInvoices(): number {
    return this.filteredInvoices.length;
  }

  get totalSales(): number {
    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.totalAmount,
      0
    );
  }

  get totalTax(): number {
    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.taxAmount,
      0
    );
  }

  get totalDiscount(): number {
    return this.filteredInvoices.reduce(
      (total, invoice) =>
        total + invoice.discountAmount,
      0
    );
  }

  get paidInvoices(): number {
    return this.filteredInvoices.filter(
      invoice => invoice.status === 'paid'
    ).length;
  }

  get pendingInvoices(): number {
    return this.filteredInvoices.filter(
      invoice =>
        invoice.status === 'issued' ||
        invoice.status === 'partially-paid'
    ).length;
  }

  getStatusClass(status: string): string {

    switch (status) {

      case 'draft':
        return 'status-draft';

      case 'issued':
        return 'status-issued';

      case 'partially-paid':
        return 'status-partial';

      case 'paid':
        return 'status-paid';

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

  printReport(): void {
    window.print();
  }
}