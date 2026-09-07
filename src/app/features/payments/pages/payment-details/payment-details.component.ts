import {
  CommonModule,
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  Payment,
  PaymentMethod
} from '../../../../shared/models/payment';

import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './payment-details.component.html',
  styleUrl: './payment-details.component.scss'
})
export class PaymentDetailsComponent
  implements OnInit {

  payment: Payment | undefined;

  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.loadPayment();
  }

  loadPayment(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const idParam =
      this.route.snapshot.paramMap.get('id');

    const id = Number(idParam);

    if (!idParam || Number.isNaN(id)) {
      this.errorMessage =
        'Invalid payment ID.';
      this.isLoading = false;
      return;
    }

    this.paymentService
      .getPaymentById(id)
      .subscribe({
        next: (payment) => {
          this.payment = payment;

          if (!payment) {
            this.errorMessage =
              'Payment not found.';
          }

          this.isLoading = false;
        },

        error: () => {
          this.errorMessage =
            'Unable to load payment.';
          this.isLoading = false;
        }
      });
  }

  getMethodLabel(
    method: PaymentMethod
  ): string {

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

  getMethodClass(
    method: PaymentMethod
  ): string {
    return `method-${method}`;
  }
}