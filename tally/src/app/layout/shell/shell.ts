import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: false,
  templateUrl: './shell.html',
})
export class Shell {

  user$;

  constructor(private authService: AuthService, private router: Router) {
    this.user$ = this.authService.user$;
  }

  logout() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  }
}