import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Supplier } from '../../../../shared/models/supplier';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss'
})
export class SupplierFormComponent implements OnInit {

  @Input()
  supplier: Supplier | null = null;

  @Input()
  isSubmitting = false;

  @Output()
  readonly formSubmit = new EventEmitter<Partial<Supplier>>();

  @Output()
  readonly cancel = new EventEmitter<void>();

  readonly supplierForm: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder
  ) {
    this.supplierForm = this.formBuilder.group({

      code: [
        '',
        [
          Validators.required,
          Validators.maxLength(30)
        ]
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      contactPerson: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(150)
        ]
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.maxLength(20)
        ]
      ],

      address: [
        '',
        [
          Validators.required,
          Validators.maxLength(250)
        ]
      ],

      city: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      state: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      postalCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(20)
        ]
      ],

      taxNumber: [
        '',
        [
          Validators.maxLength(30)
        ]
      ],

      paymentTerms: [
        '30 Days',
        Validators.required
      ],

      isActive: [
        true
      ]

    });
  }

  ngOnInit(): void {

    if (this.supplier) {

      this.supplierForm.patchValue({

        code: this.supplier.code,
        name: this.supplier.name,
        contactPerson: this.supplier.contactPerson,
        email: this.supplier.email,
        phone: this.supplier.phone,
        address: this.supplier.address,
        city: this.supplier.city,
        state: this.supplier.state,
        postalCode: this.supplier.postalCode,
        taxNumber: this.supplier.taxNumber,
        paymentTerms: this.supplier.paymentTerms,
        isActive: this.supplier.isActive

      });

    }

  }

  submit(): void {

    if (this.supplierForm.invalid) {

      this.supplierForm.markAllAsTouched();

      this.focusFirstInvalidField();

      return;
    }

    this.formSubmit.emit(
      this.supplierForm.getRawValue()
    );

  }

  onCancel(): void {
    this.cancel.emit();
  }

  isFieldInvalid(fieldName: string): boolean {

    const field = this.supplierForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );

  }

  private focusFirstInvalidField(): void {

    const firstInvalidControl =
      Object.keys(this.supplierForm.controls).find(
        fieldName =>
          this.supplierForm.get(fieldName)?.invalid
      );

    if (!firstInvalidControl) {
      return;
    }

    const element = document.getElementById(
      firstInvalidControl
    );

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    setTimeout(() => {
      element.focus();
    }, 300);

  }
}