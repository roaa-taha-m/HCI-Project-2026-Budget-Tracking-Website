import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
})
export class Login {
  form: FormGroup;
  loginError: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.touched && control.invalid;
  }

  submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const { email, password } = this.form.value;

  this.authService.login(email, password)
    .then(() => {
      this.router.navigate(['/dashboard']);
    })
    .catch((error) => {
      console.error('Login error:', error);

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) 
      {
        this.loginError = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        this.loginError = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        this.loginError = 'Network error. Please check your connection.';
      } else {
        this.loginError = 'Something went wrong. Please try again.';
      }
    });
  }
}
