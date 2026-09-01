import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Supplier } from '../../../../shared/models/supplier';
import { SupplierService } from '../../services/supplier.service';
import { SupplierFormComponent } from '../../components/supplier-form/supplier-form.component';

@Component({
    selector: 'app-supplier-edit',
    standalone: true,
    imports: [
        SupplierFormComponent
    ],
    templateUrl: './supplier-edit.component.html',
    styleUrl: './supplier-edit.component.scss'
})
export class SupplierEditComponent implements OnInit {

    supplier: Supplier | null = null;

    isLoading = false;

    isSubmitting = false;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly supplierService: SupplierService
    ) { }

    ngOnInit(): void {
        this.loadSupplier();
    }

    loadSupplier(): void {
        const id = Number(
            this.route.snapshot.paramMap.get('id')
        );

        if (!id) {
            this.router.navigate(['/suppliers']);
            return;
        }

        this.isLoading = true;

        this.supplierService
            .getSupplierById(id)
            .subscribe({
                next: supplier => {
                    this.supplier = supplier;
                    this.isLoading = false;

                    if (!supplier) {
                        this.router.navigate(['/suppliers']);
                    }
                },

                error: error => {
                    console.error(
                        'Failed to load supplier:',
                        error
                    );

                    this.isLoading = false;
                    this.router.navigate(['/suppliers']);
                }
            });
    }

    onSubmit(supplierData: Partial<Supplier>): void {
        if (!this.supplier) {
            return;
        }

        this.isSubmitting = true;

        this.supplierService
            .updateSupplier(
                this.supplier.id,
                supplierData
            )
            .subscribe({
                next: updatedSupplier => {
                    console.log(
                        'Supplier updated:',
                        updatedSupplier
                    );

                    this.isSubmitting = false;

                    if (!updatedSupplier) {
                        console.error(
                            'Supplier could not be updated.'
                        );

                        return;
                    }

                    this.router.navigate([
                        '/suppliers',
                        updatedSupplier.id
                    ]);
                },

                error: error => {
                    console.error(
                        'Failed to update supplier:',
                        error
                    );

                    this.isSubmitting = false;
                }
            });
    }

    onCancel(): void {
        if (this.supplier) {
            this.router.navigate([
                '/suppliers',
                this.supplier.id
            ]);

            return;
        }

        this.router.navigate(['/suppliers']);
    }
}