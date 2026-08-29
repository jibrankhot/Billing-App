import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Product } from '../../../../shared/models/product';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent {

  @Input()
  product: Product | null = null;

  @Input()
  isSubmitting = false;

  @Output()
  readonly formSubmit = new EventEmitter<Partial<Product>>();

  @Output()
  readonly cancel = new EventEmitter<void>();

  readonly productForm: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder
  ) {
    this.productForm = this.formBuilder.group({
      sku: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      description: [
        '',
        Validators.maxLength(500)
      ],

      categoryId: [
        null,
        Validators.required
      ],

      unit: [
        'pcs',
        [
          Validators.required,
          Validators.maxLength(20)
        ]
      ],

      purchasePrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      sellingPrice: [
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

      currentStock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      minimumStock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      isActive: [
        true
      ]
    });
  }

  ngOnInit(): void {
    if (this.product) {
      this.productForm.patchValue({
        sku: this.product.sku,
        name: this.product.name,
        description: this.product.description,
        categoryId: this.product.categoryId,
        unit: this.product.unit,
        purchasePrice: this.product.purchasePrice,
        sellingPrice: this.product.sellingPrice,
        taxRate: this.product.taxRate,
        currentStock: this.product.currentStock,
        minimumStock: this.product.minimumStock,
        isActive: this.product.isActive
      });
    }
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(
      this.productForm.getRawValue()
    );
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
  }
}