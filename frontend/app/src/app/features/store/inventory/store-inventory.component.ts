import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs';

import { Category, Inventory, Product, ProductListItem, Store } from '../../../core/models';
import { InventoryService } from '../../../core/services/inventory.service';
import { ProductService } from '../../../core/services/product.service';
import { StoreService } from '../../../core/services/store.service';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';
type ModalMode = 'closed' | 'add' | 'createProduct' | 'edit';

@Component({
  selector: 'app-store-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './store-inventory.component.html',
  styleUrl: './store-inventory.component.scss',
})
export class StoreInventoryComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly storeService = inject(StoreService);
  private readonly inventoryService = inject(InventoryService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly searchForm = this.formBuilder.group({
    search: [''],
    availability: ['all' as AvailabilityFilter],
  });

  readonly productSearchForm = this.formBuilder.group({
    query: [''],
  });

  readonly inventoryForm = this.formBuilder.group({
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    available: [true],
  });

  readonly editForm = this.formBuilder.group({
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    available: [true],
  });

  readonly productForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    brand: ['', [Validators.required]],
    description: [''],
    image: [''],
    category_id: [null as string | number | null, [Validators.required]],
  });

  store: Store | null = null;
  inventory: Inventory[] = [];
  productResults: ProductListItem[] = [];
  categories: Category[] = [];
  selectedProduct: ProductListItem | Product | null = null;
  editingItem: Inventory | null = null;

  modalMode: ModalMode = 'closed';
  addStep: 1 | 2 = 1;
  page = 1;
  pageSize = 8;
  isLoading = true;
  isSearchingProducts = false;
  isLoadingCategories = false;
  isSaving = false;
  isDeletingId: string | number | null = null;
  errorMessage = '';
  modalError = '';

  ngOnInit(): void {
    this.loadStore();
    this.listenProductSearch();
  }

  get filteredInventory(): Inventory[] {
    const search = (this.searchForm.controls.search.value || '').trim().toLowerCase();
    const availability = this.searchForm.controls.availability.value || 'all';

    return this.inventory.filter((item) => {
      const productText = `${item.product.name} ${item.product.brand || ''}`.toLowerCase();
      const matchesSearch = !search || productText.includes(search);
      const isAvailable = item.available;
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'available' && isAvailable) ||
        (availability === 'unavailable' && !isAvailable);

      return matchesSearch && matchesAvailability;
    });
  }

  get pagedInventory(): Inventory[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredInventory.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredInventory.length / this.pageSize));
  }

  get hasActiveFilters(): boolean {
    return Boolean(this.searchForm.controls.search.value?.trim()) ||
      this.searchForm.controls.availability.value !== 'all';
  }

  openAddModal(): void {
    this.modalMode = 'add';
    this.addStep = 1;
    this.modalError = '';
    this.selectedProduct = null;
    this.productResults = [];
    this.productSearchForm.reset({ query: '' });
    this.inventoryForm.reset({ price: null, stock: 0, available: true });
  }

  openCreateProduct(): void {
    this.modalMode = 'createProduct';
    this.modalError = '';
    this.productForm.reset({
      name: this.productSearchForm.controls.query.value || '',
      brand: '',
      description: '',
      image: '',
      category_id: null,
    });
    this.loadCategories();
  }

  openEditModal(item: Inventory): void {
    this.modalMode = 'edit';
    this.modalError = '';
    this.editingItem = item;
    this.editForm.reset({
      price: Number(item.price),
      stock: item.stock,
      available: item.available,
    });
  }

  closeModal(): void {
    this.modalMode = 'closed';
    this.addStep = 1;
    this.modalError = '';
    this.selectedProduct = null;
    this.editingItem = null;
  }

  selectProduct(product: ProductListItem): void {
    this.selectedProduct = product;
    this.addStep = 2;
    this.inventoryForm.reset({ price: null, stock: 0, available: true });
  }

  backToProductSearch(): void {
    this.addStep = 1;
    this.selectedProduct = null;
    this.modalError = '';
  }

  createProduct(): void {
    this.modalError = '';

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const value = this.productForm.getRawValue();
    this.isSaving = true;
    this.productService
      .createProduct({
        name: value.name?.trim(),
        brand: value.brand?.trim(),
        description: value.description?.trim(),
        image: value.image?.trim(),
        category_id: value.category_id,
      } as Partial<Product> & { category_id: string | number | null })
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (product) => {
          this.selectedProduct = product;
          this.modalMode = 'add';
          this.addStep = 2;
          this.inventoryForm.reset({ price: null, stock: 0, available: true });
        },
        error: (error: unknown) => {
          this.modalError = this.errorText(error, 'No pudimos crear el producto.');
        },
      });
  }

  createInventoryItem(): void {
    this.modalError = '';

    if (!this.store || !this.selectedProduct) {
      this.modalError = 'Selecciona un producto y verifica tu tienda.';
      return;
    }

    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    const value = this.inventoryForm.getRawValue();
    this.isSaving = true;
    this.inventoryService
      .createInventoryItem({
        product_id: this.selectedProduct.id,
        store_id: this.store.id,
        price: Number(value.price),
        stock: Number(value.stock),
        available: Boolean(value.available),
      } as Partial<Inventory> & { product_id: string | number; store_id: string | number })
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => {
          this.inventory = [item, ...this.inventory];
          this.closeModal();
        },
        error: (error: unknown) => {
          this.modalError = this.errorText(error, 'No pudimos agregar el producto al inventario.');
        },
      });
  }

  saveEdit(): void {
    this.modalError = '';

    if (!this.editingItem) {
      return;
    }

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const value = this.editForm.getRawValue();
    const payload: Partial<Inventory> = {};

    if (Number(value.price) !== Number(this.editingItem.price)) {
      payload.price = Number(value.price);
    }

    if (Number(value.stock) !== Number(this.editingItem.stock)) {
      payload.stock = Number(value.stock);
    }

    if (Boolean(value.available) !== this.editingItem.available) {
      payload.available = Boolean(value.available);
    }

    if (!Object.keys(payload).length) {
      this.closeModal();
      return;
    }

    this.isSaving = true;
    this.inventoryService
      .updateInventoryItem(this.editingItem.id, payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => {
          this.replaceInventoryItem(item);
          this.closeModal();
        },
        error: (error: unknown) => {
          this.modalError = this.errorText(error, 'No pudimos guardar los cambios.');
        },
      });
  }

  toggleAvailability(item: Inventory, checked: boolean): void {
    this.inventoryService
      .updateInventoryItem(item.id, { available: checked })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.replaceInventoryItem(updated);
        },
        error: () => {
          this.errorMessage = 'No pudimos actualizar la disponibilidad.';
        },
      });
  }

  deleteItem(item: Inventory): void {
    const confirmed = window.confirm(`Eliminar "${item.product.name}" del inventario?`);

    if (!confirmed) {
      return;
    }

    this.isDeletingId = item.id;
    this.inventoryService
      .deleteInventoryItem(item.id)
      .pipe(
        finalize(() => {
          this.isDeletingId = null;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.inventory = this.inventory.filter((current) => current.id !== item.id);
          this.clampPage();
        },
        error: (error: unknown) => {
          this.errorMessage = this.errorText(error, 'No pudimos eliminar el item.');
        },
      });
  }

  clearFilters(): void {
    this.searchForm.reset({ search: '', availability: 'all' });
    this.page = 1;
  }

  goToPage(nextPage: number): void {
    this.page = Math.min(Math.max(nextPage, 1), this.totalPages);
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  categoryName(product: ProductListItem | Product): string {
    if (typeof product.category === 'object' && product.category !== null) {
      return product.category.name;
    }

    const category = this.categories.find((item) => item.id === product.category);
    return category?.name || 'Sin categoria';
  }

  trackInventory(_: number, item: Inventory): string | number {
    return item.id;
  }

  trackProduct(_: number, product: ProductListItem): string | number {
    return product.id;
  }

  trackCategory(_: number, category: Category): string | number {
    return category.id;
  }

  private loadStore(): void {
    this.storeService
      .getMyStore()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (store) => {
          this.store = store;
          this.storeService.setActiveStore(store);
          this.loadInventory();
        },
        error: (error: unknown) => {
          this.isLoading = false;

          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.router.navigate(['/dashboard/store-setup']);
            return;
          }

          this.errorMessage = 'No pudimos cargar la tienda asociada a tu usuario.';
        },
      });
  }

  private loadInventory(): void {
    this.isLoading = true;
    this.inventoryService
      .getMyProducts()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (inventory) => {
          this.inventory = inventory;
          this.clampPage();
        },
        error: (error: unknown) => {
          this.errorMessage = this.errorText(error, 'No pudimos cargar tu inventario.');
        },
      });
  }

  private listenProductSearch(): void {
    this.productSearchForm.controls.query.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.isSearchingProducts = true;
          this.modalError = '';
        }),
        switchMap((query) => this.productService.getProducts((query || '').trim())),
        finalize(() => {
          this.isSearchingProducts = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (products) => {
          this.isSearchingProducts = false;
          this.productResults = products;
        },
        error: () => {
          this.isSearchingProducts = false;
          this.productResults = [];
          this.modalError = 'No pudimos buscar productos.';
        },
      });
  }

  private loadCategories(): void {
    if (this.categories.length) {
      return;
    }

    this.isLoadingCategories = true;
    this.productService
      .getCategories()
      .pipe(
        finalize(() => {
          this.isLoadingCategories = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: () => {
          this.modalError = 'No pudimos cargar las categorias.';
        },
      });
  }

  private replaceInventoryItem(item: Inventory): void {
    this.inventory = this.inventory.map((current) => (current.id === item.id ? item : current));
  }

  private clampPage(): void {
    this.page = Math.min(this.page, this.totalPages);
  }

  private errorText(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse) || !error.error) {
      return fallback;
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    if (typeof error.error === 'object') {
      const errors = error.error as Record<string, string | string[]>;
      const detail = errors['detail'] || errors['non_field_errors'];

      if (Array.isArray(detail)) {
        return detail.join(' ');
      }

      if (detail) {
        return detail;
      }
    }

    return fallback;
  }
}
