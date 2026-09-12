import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Product } from '../../../../shared/models/product';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ProductService } from '../../services/product.service';

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
    private readonly productService: ProductService,
    private readonly router: Router
  ) { }

  onSubmit(productData: Partial<Product>): void {
    this.isSubmitting = true;

    this.productService.createProduct(productData).subscribe({
      next: product => {
        console.log('Product created:', product);

        this.isSubmitting = false;

        this.router.navigate(['/products']);
      },

      error: error => {
        console.error(
          'Failed to create product:',
          error
        );

        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }
}