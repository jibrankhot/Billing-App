import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';

@Component({
    selector: 'app-category-details',
    standalone: true,
    imports: [
        DatePipe
    ],
    templateUrl: './category-details.component.html',
    styleUrl: './category-details.component.scss'
})
export class CategoryDetailsComponent implements OnInit {

    category: Category | null = null;

    isLoading = false;

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

    editCategory(): void {
        if (!this.category) {
            return;
        }

        this.router.navigate([
            '/categories',
            this.category.id,
            'edit'
        ]);
    }

    goBack(): void {
        this.router.navigate(['/categories']);
    }
}