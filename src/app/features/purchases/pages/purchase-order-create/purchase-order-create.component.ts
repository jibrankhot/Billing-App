import { Component, OnInit } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PurchaseOrder } from '../../../../shared/models/purchase-order';
import { PurchaseOrderItem } from '../../../../shared/models/purchase-order-item';

import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
    selector: 'app-purchase-order-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './purchase-order-create.component.html',
    styleUrl: './purchase-order-create.component.scss'
})
export class PurchaseOrderCreateComponent implements OnInit {

    purchaseOrderForm: FormGroup;

    isSubmitting = false;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly purchaseOrderService: PurchaseOrderService,
        private readonly router: Router
    ) {
        this.purchaseOrderForm = this.formBuilder.group({

            orderNumber: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(30)
                ]
            ],

            supplierId: [
                null,
                Validators.required
            ],

            orderDate: [
                '',
                Validators.required
            ],

            expectedDate: [
                null
            ],

            status: [
                'draft',
                Validators.required
            ],

            items: this.formBuilder.array([]),

            subtotal: [
                0,
                [
                    Validators.required,
                    Validators.min(0)
                ]
            ],

            taxAmount: [
                0,
                [
                    Validators.required,
                    Validators.min(0)
                ]
            ],

            discountAmount: [
                0,
                [
                    Validators.required,
                    Validators.min(0)
                ]
            ],

            totalAmount: [
                0,
                [
                    Validators.required,
                    Validators.min(0)
                ]
            ],

            notes: [
                '',
                Validators.maxLength(500)
            ]

        });
    }

    ngOnInit(): void {
        this.setDefaultOrderNumber();
        this.setDefaultOrderDate();

        this.addItem();
    }

    get items(): FormArray {
        return this.purchaseOrderForm.get('items') as FormArray;
    }

    private createItem(): FormGroup {
        return this.formBuilder.group({

            productId: [
                null,
                Validators.required
            ],

            productName: [
                '',
                Validators.required
            ],

            sku: [
                ''
            ],

            quantity: [
                1,
                [
                    Validators.required,
                    Validators.min(1)
                ]
            ],

            unitPrice: [
                0,
                [
                    Validators.required,
                    Validators.min(0)
                ]
            ],

            taxRate: [
                0,
                [
                    Validators.required,
                    Validators.min(0),
                    Validators.max(100)
                ]
            ],

            taxAmount: [
                0,
                [
                    Validators.required,
                    Validators.min(0)
                ]
            ],

            discountAmount: [
                0,
                [
                    Validators.required,
                    Validators.min(0)
                ]
            ],

            totalAmount: [
                0,
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

        this.calculateTotals();
    }

    removeItem(index: number): void {
        if (this.items.length === 1) {
            return;
        }

        this.items.removeAt(index);

        this.calculateTotals();
    }

    calculateItemTotal(index: number): void {
        const item = this.items.at(index);

        const quantity =
            Number(item.get('quantity')?.value) || 0;

        const unitPrice =
            Number(item.get('unitPrice')?.value) || 0;

        const taxRate =
            Number(item.get('taxRate')?.value) || 0;

        const discountAmount =
            Number(item.get('discountAmount')?.value) || 0;

        const subtotal =
            quantity * unitPrice;

        const taxAmount =
            (subtotal * taxRate) / 100;

        const totalAmount =
            subtotal +
            taxAmount -
            discountAmount;

        item.patchValue(
            {
                taxAmount: Number(
                    taxAmount.toFixed(2)
                ),

                totalAmount: Number(
                    Math.max(totalAmount, 0).toFixed(2)
                )
            },
            {
                emitEvent: false
            }
        );

        this.calculateTotals();
    }

    calculateTotals(): void {
        let subtotal = 0;
        let taxAmount = 0;
        let discountAmount = 0;

        this.items.controls.forEach(item => {

            const quantity =
                Number(item.get('quantity')?.value) || 0;

            const unitPrice =
                Number(item.get('unitPrice')?.value) || 0;

            const tax =
                Number(item.get('taxAmount')?.value) || 0;

            const discount =
                Number(item.get('discountAmount')?.value) || 0;

            subtotal += quantity * unitPrice;
            taxAmount += tax;
            discountAmount += discount;
        });

        const totalAmount =
            subtotal +
            taxAmount -
            discountAmount;

        this.purchaseOrderForm.patchValue(
            {
                subtotal: Number(
                    subtotal.toFixed(2)
                ),

                taxAmount: Number(
                    taxAmount.toFixed(2)
                ),

                discountAmount: Number(
                    discountAmount.toFixed(2)
                ),

                totalAmount: Number(
                    Math.max(totalAmount, 0).toFixed(2)
                )
            },
            {
                emitEvent: false
            }
        );
    }

    private setDefaultOrderNumber(): void {
        this.purchaseOrderForm.patchValue({
            orderNumber: this.generateOrderNumber()
        });
    }

    private setDefaultOrderDate(): void {
        const today = new Date()
            .toISOString()
            .split('T')[0];

        this.purchaseOrderForm.patchValue({
            orderDate: today
        });
    }

    private generateOrderNumber(): string {
        const timestamp = Date.now();

        return `PO-${timestamp}`;
    }

    submit(): void {

        if (this.purchaseOrderForm.invalid) {
            this.purchaseOrderForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const purchaseOrderData:
            Partial<PurchaseOrder> =
            this.purchaseOrderForm.getRawValue();

        console.log(
            'Purchase order data:',
            purchaseOrderData
        );

        this.purchaseOrderService
            .createPurchaseOrder(purchaseOrderData)
            .subscribe({
                next: purchaseOrder => {

                    console.log(
                        'Purchase order created:',
                        purchaseOrder
                    );

                    this.isSubmitting = false;

                    this.router.navigate([
                        '/purchases',
                        purchaseOrder.id
                    ]);
                },

                error: error => {

                    console.error(
                        'Failed to create purchase order:',
                        error
                    );

                    this.isSubmitting = false;
                }
            });
    }

    onCancel(): void {
        this.router.navigate([
            '/purchases'
        ]);
    }

    isFieldInvalid(fieldName: string): boolean {

        const field =
            this.purchaseOrderForm.get(fieldName);

        return !!(
            field &&
            field.invalid &&
            (field.dirty || field.touched)
        );
    }

    isItemFieldInvalid(
        index: number,
        fieldName: string
    ): boolean {

        const item = this.items.at(index);

        const field =
            item.get(fieldName);

        return !!(
            field &&
            field.invalid &&
            (field.dirty || field.touched)
        );
    }

    getItemTotal(index: number): number {

        const total =
            Number(
                this.items
                    .at(index)
                    .get('totalAmount')
                    ?.value
            ) || 0;

        return total;
    }
}