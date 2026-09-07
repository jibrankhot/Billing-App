import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Payment } from '../../../shared/models/payment';
import { PaymentService } from '../../payments/services/payment.service';

@Component({
  selector: 'app-payment-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './payment-report.component.html',
  styleUrl: './payment-report.component.scss'
})
export class PaymentReportComponent implements OnInit {

  payments: Payment[] = [];
  filteredPayments: Payment[] = [];

  fromDate = '';
  toDate = '';

  loading = false;
  errorMessage = '';

  constructor(
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {

    this.loading = true;

    this.paymentService.getPayments().subscribe({

      next: (payments) => {

        this.payments = payments;

        this.applyFilters();

        this.loading = false;
      },

      error: () => {

        this.errorMessage =
          'Unable to load payment report.';

        this.loading = false;
      }
    });
  }

  applyFilters(): void {

    this.filteredPayments =
      this.payments.filter(payment => {

        const paymentDate =
          payment.paymentDate.substring(0, 10);

        return (
          (!this.fromDate ||
            paymentDate >= this.fromDate) &&
          (!this.toDate ||
            paymentDate <= this.toDate)
        );
      });
  }

  resetFilters(): void {

    this.fromDate = '';
    this.toDate = '';

    this.applyFilters();
  }

  get totalPayments(): number {
    return this.filteredPayments.length;
  }

  get totalAmount(): number {

    return this.filteredPayments.reduce(
      (total, payment) =>
        total + payment.amount,
      0
    );
  }

  get upiTotal(): number {
    return this.getMethodTotal('upi');
  }

  get cashTotal(): number {
    return this.getMethodTotal('cash');
  }

  get bankTransferTotal(): number {
    return this.getMethodTotal('bank-transfer');
  }

  get cardTotal(): number {
    return this.getMethodTotal('card');
  }

  getMethodTotal(method: string): number {

    return this.filteredPayments
      .filter(payment =>
        payment.paymentMethod === method
      )
      .reduce(
        (total, payment) =>
          total + payment.amount,
        0
      );
  }

  getPaymentMethodLabel(method: string): string {

    switch (method) {

      case 'cash':
        return 'Cash';

      case 'bank-transfer':
        return 'Bank Transfer';

      case 'upi':
        return 'UPI';

      case 'card':
        return 'Card';

      case 'cheque':
        return 'Cheque';

      default:
        return method;
    }
  }

  printReport(): void {
    window.print();
  }
}