import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UidService {

  private uid: string;
  public usuario = new BehaviorSubject('inactivo');

  constructor() {  }

  setUid(uid) {
    this.uid = uid;
  }

  setUser(user) {
    this.usuario.next(user);
  }

  getUid() {
    return this.uid;
  }

  getUser() {
    return this.usuario;
  }

}
