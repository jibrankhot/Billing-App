import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Product } from '../../../../shared/models/product';
import { ProductService } from '../../services/product.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    ProductFormComponent
  ],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
})
export class ProductEditComponent implements OnInit {

  product: Product | null = null;

  isLoading = false;

  isSubmitting = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly productService: ProductService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    const productId = Number(
      this.activatedRoute.snapshot.paramMap.get('id')
    );

    this.loadProduct(productId);
  }

  loadProduct(id: number): void {
    this.isLoading = true;

    this.productService.getProductById(id).subscribe({
      next: product => {
        this.product = product;
        this.isLoading = false;
      },

      error: error => {
        console.error('Failed to load product:', error);
        this.product = null;
        this.isLoading = false;
      }
    });
  }

  onSubmit(productData: Partial<Product>): void {
    if (!this.product) {
      return;
    }

    this.isSubmitting = true;

    this.productService
      .updateProduct(this.product.id, productData)
      .subscribe({
        next: updatedProduct => {

          if (!updatedProduct) {
            this.isSubmitting = false;

            console.error(
              'Product could not be updated.'
            );

            return;
          }

          this.isSubmitting = false;

          this.router.navigate(['/products']);
        },

        error: error => {
          console.error(
            'Failed to update product:',
            error
          );

          this.isSubmitting = false;
        }
      });
  }

  onCancel(): void {
    if (!this.product) {
      this.router.navigate(['/products']);

      return;
    }

    this.router.navigate([
      '/products',
      this.product.id
    ]);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}