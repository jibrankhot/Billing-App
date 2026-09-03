import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../../../shared/models/customer';

@Component({
    selector: 'app-customer-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink
    ],
    templateUrl: './customer-edit.component.html',
    styleUrl: './customer-edit.component.scss'
})
export class CustomerEditComponent implements OnInit {

    customerForm: FormGroup;

    customer: Customer | null = null;
    customerId = 0;

    isLoading = true;
    isSaving = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private customerService: CustomerService
    ) {
        this.customerForm = this.fb.group({
            code: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(20)
                ]
            ],

            name: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(100)
                ]
            ],

            email: [
                '',
                [
                    Validators.email,
                    Validators.maxLength(100)
                ]
            ],

            phone: [
                '',
                [
                    Validators.maxLength(20)
                ]
            ],

            address: [
                '',
                [
                    Validators.maxLength(200)
                ]
            ],

            city: [
                '',
                [
                    Validators.maxLength(50)
                ]
            ],

            state: [
                '',
                [
                    Validators.maxLength(50)
                ]
            ],

            postalCode: [
                '',
                [
                    Validators.maxLength(10)
                ]
            ],

            taxNumber: [
                '',
                [
                    Validators.maxLength(30)
                ]
            ],

            isActive: [true]
        });
    }

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

                    this.customerForm.patchValue({
                        code: customer.code,
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.address,
                        city: customer.city,
                        state: customer.state,
                        postalCode: customer.postalCode,
                        taxNumber: customer.taxNumber,
                        isActive: customer.isActive
                    });

                    this.isLoading = false;
                },

                error: () => {
                    this.errorMessage =
                        'Unable to load customer.';
                    this.isLoading = false;
                }
            });
    }

    saveCustomer(): void {
        if (this.customerForm.invalid) {
            this.customerForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        this.errorMessage = '';

        this.customerService
            .updateCustomer(
                this.customerId,
                this.customerForm.value
            )
            .subscribe({
                next: () => {
                    this.isSaving = false;

                    this.router.navigate([
                        '/customers',
                        this.customerId
                    ]);
                },

                error: () => {
                    this.isSaving = false;
                    this.errorMessage =
                        'Unable to update customer.';
                }
            });
    }

    cancel(): void {
        this.router.navigate([
            '/customers',
            this.customerId
        ]);
    }
}