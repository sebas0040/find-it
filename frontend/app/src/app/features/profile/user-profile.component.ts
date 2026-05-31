import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { User } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';

type ProfileField = 'name' | 'phone' | 'avatar';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly profileForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    avatar: [''],
  });

  user: User | null = null;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.authService
      .loadProfile()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => {
          this.user = user;
          this.patchForm(user);
        },
        error: () => {
          this.errorMessage = 'No pudimos cargar tu perfil.';
        },
      });
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.user) {
      this.errorMessage = 'No encontramos tu usuario activo.';
      return;
    }

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    this.isSaving = true;
    this.authService
      .updateProfile(this.user.id, {
        name: value.name.trim(),
        phone: value.phone.trim(),
        avatar: value.avatar.trim(),
      })
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => {
          this.user = user;
          this.patchForm(user);
          this.successMessage = 'Perfil actualizado correctamente.';
        },
        error: (error: unknown) => {
          this.errorMessage = this.errorText(error);
        },
      });
  }

  hasFieldError(fieldName: ProfileField): boolean {
    const field = this.profileForm.controls[fieldName];
    return field.invalid && (field.touched || field.dirty);
  }

  initials(): string {
    const name = this.user?.name || this.user?.email || 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  private patchForm(user: User): void {
    this.profileForm.reset({
      name: user.name || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
    });
  }

  private errorText(error: unknown): string {
    if (!(error instanceof HttpErrorResponse) || typeof error.error !== 'object' || error.error === null) {
      return 'No pudimos guardar los cambios.';
    }

    const errors = error.error as Record<string, string | string[]>;
    const first = Object.values(errors)[0];

    if (Array.isArray(first)) {
      return first.join(' ');
    }

    return first || 'No pudimos guardar los cambios.';
  }
}
