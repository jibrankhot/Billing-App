import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CustomerService } from '../../services/customer.service';

@Component({
    selector: 'app-customer-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink
    ],
    templateUrl: './customer-create.component.html',
    styleUrl: './customer-create.component.scss'
})
export class CustomerCreateComponent {

    customerForm: FormGroup;

    isSaving = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private customerService: CustomerService,
        private router: Router
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

    saveCustomer(): void {
        if (this.customerForm.invalid) {
            this.customerForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        this.errorMessage = '';

        this.customerService
            .createCustomer(this.customerForm.value)
            .subscribe({
                next: (customer) => {
                    this.isSaving = false;

                    this.router.navigate([
                        '/customers',
                        customer.id
                    ]);
                },

                error: () => {
                    this.isSaving = false;
                    this.errorMessage =
                        'Unable to create customer.';
                }
            });
    }

    cancel(): void {
        this.router.navigate(['/customers']);
    }
}