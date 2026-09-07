import {
  CommonModule,
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SalesReturn, SalesReturnStatus } from '../../../../../shared/models/sales-return';
import { SalesReturnService } from '../../services/sales-return.service';


@Component({
  selector: 'app-sales-return-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    FormsModule,
    RouterLink
  ],
  templateUrl: './sales-return-list.component.html',
  styleUrl: './sales-return-list.component.scss'
})
export class SalesReturnListComponent
  implements OnInit {

  salesReturns: SalesReturn[] = [];
  filteredReturns: SalesReturn[] = [];

  searchTerm = '';
  selectedStatus = '';

  isLoading = true;
  errorMessage = '';

  constructor(
    private salesReturnService: SalesReturnService
  ) { }

  ngOnInit(): void {
    this.loadSalesReturns();
  }

  loadSalesReturns(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.salesReturnService
      .getSalesReturns()
      .subscribe({
        next: returns => {
          this.salesReturns = returns;
          this.applyFilters();
          this.isLoading = false;
        },

        error: () => {
          this.errorMessage =
            'Unable to load sales returns.';
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    const search =
      this.searchTerm.trim().toLowerCase();

    this.filteredReturns =
      this.salesReturns.filter(item => {

        const matchesSearch =
          !search ||
          item.returnNumber
            .toLowerCase()
            .includes(search) ||
          item.invoiceNumber
            .toLowerCase()
            .includes(search) ||
          item.customerName
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          !this.selectedStatus ||
          item.status === this.selectedStatus;

        return matchesSearch && matchesStatus;
      });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  getStatusLabel(
    status: SalesReturnStatus
  ): string {

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

  getStatusClass(
    status: SalesReturnStatus
  ): string {
    return `status-${status}`;
  }

  get totalReturns(): number {
    return this.salesReturns.length;
  }

  get totalValue(): number {
    return this.salesReturns.reduce(
      (total, item) =>
        total + item.totalAmount,
      0
    );
  }

  get completedReturns(): number {
    return this.salesReturns.filter(
      item => item.status === 'completed'
    ).length;
  }
}