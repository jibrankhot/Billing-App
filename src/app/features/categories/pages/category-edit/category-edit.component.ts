import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';
import { CategoryFormComponent } from '../../category-form/category-form.component';

@Component({
    selector: 'app-category-edit',
    standalone: true,
    imports: [
        CategoryFormComponent
    ],
    templateUrl: './category-edit.component.html',
    styleUrl: './category-edit.component.scss'
})
export class CategoryEditComponent implements OnInit {

    category: Category | null = null;

    isLoading = false;

    isSubmitting = false;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly categoryService: CategoryService,
        private readonly router: Router
    ) { }

    ngOnInit(): void {
        const categoryId = Number(
            this.activatedRoute.snapshot.paramMap.get('id')
        );

        this.loadCategory(categoryId);
    }

    loadCategory(id: number): void {
        this.isLoading = true;

        this.categoryService
            .getCategoryById(id)
            .subscribe({
                next: category => {
                    this.category = category;
                    this.isLoading = false;
                },

                error: error => {
                    console.error(
                        'Failed to load category:',
                        error
                    );

                    this.category = null;
                    this.isLoading = false;
                }
            });
    }

    onSubmit(categoryData: Partial<Category>): void {
        if (!this.category) {
            return;
        }

        this.isSubmitting = true;

        this.categoryService
            .updateCategory(
                this.category.id,
                categoryData
            )
            .subscribe({
                next: updatedCategory => {

                    if (!updatedCategory) {
                        console.error(
                            'Category could not be updated.'
                        );

                        this.isSubmitting = false;

                        return;
                    }

                    this.isSubmitting = false;

                    this.router.navigate([
                        '/categories'
                    ]);
                },

                error: error => {
                    console.error(
                        'Failed to update category:',
                        error
                    );

                    this.isSubmitting = false;
                }
            });
    }

    onCancel(): void {
        if (!this.category) {
            this.router.navigate([
                '/categories'
            ]);

            return;
        }

        this.router.navigate([
            '/categories',
            this.category.id
        ]);
    }

    goBack(): void {
        this.router.navigate([
            '/categories'
        ]);
    }
}