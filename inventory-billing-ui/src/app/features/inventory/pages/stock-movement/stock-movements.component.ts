import {
  CommonModule,
  DatePipe
} from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  StockMovement,
  StockMovementType
} from '../../../../shared/models/stock';

import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    RouterLink
  ],
  templateUrl:
    './stock-movements.component.html',
  styleUrl:
    './stock-movements.component.scss'
})
export class StockMovementsComponent
  implements OnInit {

  movements: StockMovement[] = [];
  filteredMovements: StockMovement[] = [];

  searchTerm = '';
  typeFilter = 'all';

  isLoading = true;
  errorMessage = '';

  constructor(
    private inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.inventoryService
      .getStockMovements()
      .subscribe({
        next: (movements) => {
          this.movements = movements;
          this.applyFilters();
          this.isLoading = false;
        },

        error: () => {
          this.errorMessage =
            'Unable to load stock movements.';
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    this.filteredMovements =
      this.movements.filter(movement => {

        const matchesSearch =
          !search ||
          movement.productName
            .toLowerCase()
            .includes(search) ||
          movement.sku
            .toLowerCase()
            .includes(search) ||
          movement.reference
            .toLowerCase()
            .includes(search);

        const matchesType =
          this.typeFilter === 'all' ||
          movement.type === this.typeFilter;

        return (
          matchesSearch &&
          matchesType
        );
      });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.typeFilter = 'all';

    this.applyFilters();
  }

  getTypeLabel(
    type: StockMovementType
  ): string {

    switch (type) {

      case 'purchase':
        return 'Purchase';

      case 'sale':
        return 'Sale';

      case 'adjustment':
        return 'Adjustment';

      case 'return':
        return 'Return';

      default:
        return type;
    }
  }

  getTypeClass(
    type: StockMovementType
  ): string {
    return `movement-${type}`;
  }

  get totalMovements(): number {
    return this.movements.length;
  }

  get incomingQuantity(): number {
    return this.movements
      .filter(
        movement => movement.quantity > 0
      )
      .reduce(
        (total, movement) =>
          total + movement.quantity,
        0
      );
  }

  get outgoingQuantity(): number {
    return Math.abs(
      this.movements
        .filter(
          movement =>
            movement.quantity < 0
        )
        .reduce(
          (total, movement) =>
            total + movement.quantity,
          0
        )
    );
  }
}