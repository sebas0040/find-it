import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UserRole } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isLoading = false;
  authError = '';

  submit(): void {
    this.authError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: ({ user }) => {
        this.router.navigate([this.redirectForRole(user.role)]);
      },
      error: (error) => {
        this.authError = this.getAuthError(error);
        this.isLoading = false;
      },
    });
  }

  hasFieldError(fieldName: 'email' | 'password'): boolean {
    const field = this.loginForm.controls[fieldName];
    return field.invalid && (field.touched || field.dirty);
  }

  private redirectForRole(role: UserRole): string {
    const redirects: Record<UserRole, string> = {
      CLIENT: '/search',
      STORE: '/dashboard',
      ADMIN: '/admin',
    };

    return redirects[role];
  }

  private getAuthError(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const response = (error as { error?: { detail?: string; non_field_errors?: string[] } }).error;

      if (response?.detail) {
        return response.detail;
      }

      if (response?.non_field_errors?.length) {
        return response.non_field_errors[0];
      }
    }

    return 'No pudimos iniciar sesion. Revisa tus credenciales e intentalo otra vez.';
  }
}
