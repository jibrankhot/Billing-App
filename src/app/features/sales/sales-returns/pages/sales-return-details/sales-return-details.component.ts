import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SalesReturn } from '../../../../../shared/models/sales-return';
import { SalesReturnItem } from '../../../../../shared/models/sales-return-item';
import { SalesReturnService } from '../../services/sales-return.service';


@Component({
    selector: 'app-sales-return-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './sales-return-details.component.html',
    styleUrl: './sales-return-details.component.scss'
})
export class SalesReturnDetailsComponent implements OnInit {

    salesReturn: SalesReturn | null = null;
    items: SalesReturnItem[] = [];

    loading = true;
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private salesReturnService: SalesReturnService
    ) { }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        if (!id) {
            this.errorMessage = 'Invalid sales return ID.';
            this.loading = false;
            return;
        }

        this.loadSalesReturn(id);
    }

    private loadSalesReturn(id: number): void {
        this.salesReturnService.getSalesReturnById(id).subscribe({
            next: (salesReturn) => {

                if (!salesReturn) {
                    this.errorMessage = 'Sales return not found.';
                    this.loading = false;
                    return;
                }

                this.salesReturn = salesReturn;

                this.salesReturnService
                    .getSalesReturnItems(id)
                    .subscribe({
                        next: (items) => {
                            this.items = items;
                            this.loading = false;
                        },
                        error: () => {
                            this.errorMessage = 'Unable to load return items.';
                            this.loading = false;
                        }
                    });
            },
            error: () => {
                this.errorMessage = 'Unable to load sales return.';
                this.loading = false;
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'draft':
                return 'status-draft';

            case 'approved':
                return 'status-approved';

            case 'completed':
                return 'status-completed';

            case 'cancelled':
                return 'status-cancelled';

            default:
                return '';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'draft':
                return 'Draft';

            case 'approved':
                return 'Approved';

            case 'completed':
                return 'Completed';

            case 'cancelled':
                return 'Cancelled';

            default:
                return status;
        }
    }

    goBack(): void {
        this.router.navigate(['/sales-returns']);
    }
}