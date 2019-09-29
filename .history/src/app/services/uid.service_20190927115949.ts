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
    console.log('Usuario service');
    console.log(user);
    this.usuario = user;
  }

  getUid() {
    return this.uid;
  }

  getUser(): Colaborador {
    console.log('Usuario retorno');
    console.log(this.usuario);
    return this.usuario;
  }

}
