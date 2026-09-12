import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../../../shared/models/customer';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent implements OnInit {

  customer: Customer | null = null;

  isLoading = true;
  errorMessage = '';

  customerId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.customerId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.customerId) {
      this.errorMessage = 'Invalid customer ID.';
      this.isLoading = false;
      return;
    }

    this.loadCustomer();
  }

  loadCustomer(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService
      .getCustomerById(this.customerId)
      .subscribe({
        next: (customer) => {
          if (!customer) {
            this.errorMessage = 'Customer not found.';
            this.isLoading = false;
            return;
          }

          this.customer = customer;
          this.isLoading = false;
        },

        error: () => {
          this.errorMessage =
            'Unable to load customer.';
          this.isLoading = false;
        }
      });
  }

  deleteCustomer(): void {
    if (!this.customer) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${this.customer.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.customerService
      .deleteCustomer(this.customer.id)
      .subscribe({
        next: () => {
          this.router.navigate(['/customers']);
        },

        error: () => {
          this.errorMessage =
            'Unable to delete customer.';
        }
      });
  }
}