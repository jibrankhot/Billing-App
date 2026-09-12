import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];

  searchTerm = '';

  selectedStatus = 'all';

  isLoading = false;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  get filteredCategories(): Category[] {
    const search = this.searchTerm
      .trim()
      .toLowerCase();

    return this.categories.filter(category => {

      const matchesSearch =
        !search ||
        category.name.toLowerCase().includes(search) ||
        category.description.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && category.isActive) ||
        (this.selectedStatus === 'inactive' && !category.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }

  loadCategories(): void {
    this.isLoading = true;

    this.categoryService.getCategories().subscribe({
      next: categories => {
        this.categories = categories;
        this.isLoading = false;
      },

      error: error => {
        console.error(
          'Failed to load categories:',
          error
        );

        this.isLoading = false;
      }
    });
  }

  viewCategory(category: Category): void {
    this.router.navigate([
      '/categories',
      category.id
    ]);
  }

  editCategory(category: Category): void {
    this.router.navigate([
      '/categories',
      category.id,
      'edit'
    ]);
  }

  deleteCategory(category: Category): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.categoryService
      .deleteCategory(category.id)
      .subscribe({
        next: deleted => {

          if (!deleted) {
            console.error(
              'Category could not be deleted.'
            );

            return;
          }

          this.categories = this.categories.filter(
            item => item.id !== category.id
          );
        },

        error: error => {
          console.error(
            'Failed to delete category:',
            error
          );
        }
      });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
  }
}