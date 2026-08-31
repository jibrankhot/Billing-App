import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Product } from '../../../../shared/models/product';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    ProductFormComponent
  ],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss'
})
export class ProductCreateComponent {

  isSubmitting = false;

  constructor(
    private readonly router: Router
  ) { }

  onSubmit(productData: Partial<Product>): void {
    this.isSubmitting = true;

    console.log('Product to create:', productData);

    /*
     * API integration will be added here later.
     *
     * For now we simulate a successful save.
     */
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/products']);
    }, 500);
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }
}