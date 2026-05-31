import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UserRole } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';

type RegisterRole = Extract<UserRole, 'CLIENT' | 'STORE'>;
type RegisterField = 'email' | 'name' | 'password' | 'password_confirm' | 'phone' | 'role';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly roles: Array<{ value: RegisterRole; title: string; description: string }> = [
    {
      value: 'CLIENT',
      title: 'Cliente',
      description: 'Busca productos disponibles cerca de ti.',
    },
    {
      value: 'STORE',
      title: 'Tienda',
      description: 'Publica inventario y administra tu negocio.',
    },
  ];

  readonly registerForm = this.formBuilder.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirm: ['', [Validators.required]],
      phone: [''],
      role: ['CLIENT' as RegisterRole, [Validators.required]],
    },
    { validators: this.passwordsMatchValidator },
  );

  isLoading = false;
  authError = '';

  selectRole(role: RegisterRole): void {
    this.registerForm.controls.role.setValue(role);
    this.registerForm.controls.role.markAsTouched();
  }

  submit(): void {
    this.authError = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload = this.registerForm.getRawValue();
    const sanitizedPayload = {
      ...payload,
      phone: payload.phone.trim() || undefined,
    };

    this.isLoading = true;

    this.authService.register(sanitizedPayload).subscribe({
      next: ({ user }) => {
        this.router.navigate([this.redirectForRole(user.role)]);
      },
      error: (error) => {
        this.authError = this.getAuthError(error);
        this.isLoading = false;
      },
    });
  }

  hasFieldError(fieldName: RegisterField): boolean {
    const field = this.registerForm.controls[fieldName];
    return field.invalid && (field.touched || field.dirty);
  }

  showPasswordMismatch(): boolean {
    const confirmField = this.registerForm.controls.password_confirm;
    return (
      this.registerForm.hasError('passwordMismatch') &&
      (confirmField.touched || confirmField.dirty)
    );
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const passwordConfirm = control.get('password_confirm')?.value;

    return password && passwordConfirm && password !== passwordConfirm
      ? { passwordMismatch: true }
      : null;
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
      const response = (error as { error?: Record<string, string[] | string> }).error;
      const firstError = Object.values(response ?? {})[0];

      if (Array.isArray(firstError) && firstError.length) {
        return firstError[0];
      }

      if (typeof firstError === 'string') {
        return firstError;
      }
    }

    return 'No pudimos crear tu cuenta. Revisa los datos e intentalo otra vez.';
  }
}
