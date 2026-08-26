import { Component, inject } from '@angular/core';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {

    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    isSubmitting = false;
    errorMessage = '';

    readonly loginForm = this.formBuilder.nonNullable.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        rememberMe: [false]
    });

    onSubmit(): void {
        this.errorMessage = '';

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const { username, password } = this.loginForm.getRawValue();

        this.authService.login({
            username,
            password
        }).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.router.navigate(['/dashboard']);
            },
            error: () => {
                this.isSubmitting = false;
                this.errorMessage = 'Invalid username or password.';
            }
        });
    }

    goToForgotPassword(): void {
        this.router.navigate(['/auth/forgot-password']);
    }
}