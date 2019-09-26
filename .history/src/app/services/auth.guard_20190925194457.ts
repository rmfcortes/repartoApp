import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements  CanActivate {

  constructor(
    private uidService: UidService,
    private router: Router
  ) {}

    async canActivate() {
      const resp = await this.uidService.getUid();
      if (resp) {
        return true;
      } else {
        console.log('Guard a login');
        this.router.navigate(['/login']);
        return false;
      }
    }
}