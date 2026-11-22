import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

function passwordsMatch(group: AbstractControl) {
  return group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
})
export class Register {
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirm: ['', Validators.required],
      },
      { validators: passwordsMatch },
    );
  }

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.touched && control.invalid;
  }

  get mismatch(): boolean {
    return this.form.hasError('mismatch') && !!this.form.get('confirm')?.touched;
  }

  submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const { name, email, password } = this.form.value;

  this.authService.register(name, email, password)
    .then(() => {
      this.router.navigate(['/dashboard']);
    })
    .catch((error) => {
      console.error('Registration error:', error);
    });
  }
}
