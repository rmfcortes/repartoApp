import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements  CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

    async canActivate() {
      const resp = await this.authService.revisaFireAuth();
      console.log(resp);
      if (resp) {
        return true;
      } else {
        console.log('Guard a login');
        this.router.navigate(['/login']);
        return false;
      }
    }
}