import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  clientes = [];
  lapsos = {};

  constructor(
    private storage: Storage,
    private platform: Platform,
    private db: AngularFireDatabase,
  ) { }

    // Memoria local

  setClientes(clientes) {
    this.clientes = clientes;
  }

  getClientes() {
    return this.clientes;
  }

  setLapsos(lapsos) {
    this.lapsos = lapsos;
  }

  getLapsos() {
    return this.lapsos;
  }

  // Firebase Database

  actualizaListaClientes() {
    return new Promise ((resolve, reject) => {
      const clSub = this.db.object(`clientes/datos`).valueChanges()
      .subscribe ( clientes => {
        clSub.unsubscribe();
        if (clientes) {
          this.guardaClientesStorage(Object.values(clientes));
          resolve(Object.values(clientes));
        } else {
          resolve(null);
        }
      });
    });
  }

  getLapsosCompra() {
    return new Promise (async (resolve, reject) => {
      const lapsosSub = this.db.object(`solo-lectura/lapsos-compra`).valueChanges()
        .subscribe(async (lapsos) => {
          lapsosSub.unsubscribe();
          await this.guardaLapsosStorage(lapsos);
          resolve(lapsos);
        });
    });
  }

  // Guarda en el Storage

  guardaLapsosStorage(lapsos) {
    return new Promise ( (resolve, reject) => {
      this.setLapsos(lapsos);
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(() => {
          this.storage.set('lapsos', lapsos);
          resolve();
        });
      } else {
        // Escritorio
        localStorage.setItem('lapsos', lapsos);
        resolve();
      }
    });
  }

  guardaClientesStorage(clientes) {
    return new Promise ((resolve, reject) => {
      this.setClientes(clientes);
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(() => {
          this.storage.set('clientes', JSON.stringify(clientes));
          resolve();
        });
      } else {
          // Escritorio
          localStorage.setItem('clientes', JSON.stringify(clientes));
          resolve();
      }
    });
  }

  // Get from Storage

  getLapsosStorage() {
    return new Promise ( (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(() => {
          this.storage.get('lapsos').then( val => {
            if ( val ) {
              this.setLapsos(val);
              resolve(val);
            } else {
              resolve(false);
            }
          });
        });
      } else {
        // Escritorio
        if ( localStorage.getItem('lapsos') ) {
          const val = localStorage.getItem('lapsos')
          this.setLapsos(val);
          resolve(val);
        } else {
          resolve(false);
        }
      }
    });
  }

}
