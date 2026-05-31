import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Inventory, Store } from '../../../core/models';
import { InventoryService } from '../../../core/services/inventory.service';
import { StoreService } from '../../../core/services/store.service';

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './store-dashboard.component.html',
  styleUrl: './store-dashboard.component.scss',
})
export class StoreDashboardComponent implements OnInit {
  private readonly storeService = inject(StoreService);
  private readonly inventoryService = inject(InventoryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  store: Store | null = null;
  inventory: Inventory[] = [];
  isLoadingStore = true;
  isLoadingInventory = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadStore();
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  trackInventory(_: number, item: Inventory): string | number {
    return item.id;
  }

  private loadStore(): void {
    this.storeService
      .getMyStore()
      .pipe(
        finalize(() => {
          this.isLoadingStore = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (store) => {
          this.store = store;
          this.storeService.setActiveStore(store);
          this.loadInventory();
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.router.navigate(['/dashboard/store-setup']);
            return;
          }

          this.isLoadingInventory = false;
          this.errorMessage = 'No pudimos cargar la tienda asociada a tu usuario.';
        },
      });
  }

  private loadInventory(): void {
    this.inventoryService
      .getMyProducts()
      .pipe(
        finalize(() => {
          this.isLoadingInventory = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (inventory) => {
          this.inventory = inventory;
        },
      });
  }
}
