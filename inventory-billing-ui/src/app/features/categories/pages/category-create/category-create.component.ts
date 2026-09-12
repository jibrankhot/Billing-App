import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';
import { CategoryFormComponent } from '../../category-form/category-form.component';

@Component({
    selector: 'app-category-create',
    standalone: true,
    imports: [
        CategoryFormComponent
    ],
    templateUrl: './category-create.component.html',
    styleUrl: './category-create.component.scss'
})
export class CategoryCreateComponent {

    isSubmitting = false;

    constructor(
        private readonly categoryService: CategoryService,
        private readonly router: Router
    ) { }

    onSubmit(categoryData: Partial<Category>): void {
        this.isSubmitting = true;

        this.categoryService
            .createCategory(categoryData)
            .subscribe({
                next: category => {
                    console.log('Category created:', category);

                    this.isSubmitting = false;

                    this.router.navigate(['/categories']);
                },

                error: error => {
                    console.error(
                        'Failed to create category:',
                        error
                    );

                    this.isSubmitting = false;
                }
            });
    }

    onCancel(): void {
        this.router.navigate(['/categories']);
    }
}