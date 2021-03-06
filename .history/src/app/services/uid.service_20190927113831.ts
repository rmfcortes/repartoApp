import { Injectable } from '@angular/core';
import { Colaborador } from '../interfaces/colaborador.interface';

@Injectable({
  providedIn: 'root'
})
export class UidService {

  private uid: string;
  public usuario: Colaborador;

  constructor() {  }

  setUid(uid) {
    this.uid = uid;
  }

  setUser(user) {
    console.log(this.usuario);
    this.usuario = user;
  }

  getUid() {
    return this.uid;
  }

  getUser(): Colaborador {
    return this.usuario;
  }

}
