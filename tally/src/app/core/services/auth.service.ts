import { Injectable, inject } from '@angular/core';

import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@angular/fire/auth';

import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private auth = inject(Auth);

  //$ denotes a stream of values that arrives over time
  user$ = authState(this.auth);

  isLoggedIn$ = this.user$.pipe(map(user => !!user));

  register(name: string, email: string, password: string) {
    return createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    ).then(credential =>
      updateProfile(credential.user, {
        displayName: name
      }).then(() => credential)
    );
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );
  }

  logout() {
    return signOut(this.auth);
  }
}