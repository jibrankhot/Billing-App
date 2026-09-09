import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.scss'
})
export class CompanyProfileComponent {

  companyForm: FormGroup;
  saving = false;
  saved = false;

  constructor(
    private fb: FormBuilder
  ) {

    this.companyForm = this.fb.group({

      companyName: [
        'Stockly Technologies',
        Validators.required
      ],

      email: [
        'info@stockly.com',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phone: [
        '9876543210',
        Validators.required
      ],

      taxNumber: [
        'GSTIN123456789'
      ],

      address: [
        '123 Business Street'
      ],

      city: [
        'Bengaluru'
      ],

      state: [
        'Karnataka'
      ],

      postalCode: [
        '560001'
      ],

      website: [
        'www.stockly.com'
      ]

    });

  }

  save(): void {

    if (this.companyForm.invalid) {

      this.companyForm.markAllAsTouched();

      return;
    }

    this.saving = true;
    this.saved = false;

    setTimeout(() => {

      this.saving = false;
      this.saved = true;

    }, 500);
  }

}