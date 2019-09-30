import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  clientes = [];

  constructor(
    private storage: Storage,
    private platform: Platform,
    private datePipe: DatePipe,
    private db: AngularFireDatabase,
  ) { }

  // Firebase Database

  actualizaListaClientes() {
    return new Promise (async (resolve, reject) => {
      const lapsosSub = this.db.object(`solo-lectura/lapso`).valueChanges()
        .subscribe(async (lapso) => {
          lapsosSub.unsubscribe();
          const fecha = await this.getFecha(lapso);
          await this.getClientesDesatendidos(fecha);
          resolve();
        });
    });
  }

  getClientesDesatendidos(fecha) {
    return new Promise((resolve, reject) => {
      const clSub = this.db.list(`clientes`, data => data
        .orderByChild('ultimaCompra').endAt(fecha))
        .valueChanges().subscribe(clientes => {
          clSub.unsubscribe();
          if (clientes.length > 0 && clientes) {
            this.guardaClientesStorage(clientes);
          }
          resolve();
        });
    });
  }

  // Guarda en el Storage

  guardaClientesStorage(clientes) {
    return new Promise ((resolve, reject) => {
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

  // Auxiliares


  getFecha(lapso) {
    return new Promise ((resolve, reject) => {
      const date = new Date();
      date.setDate(date.getDate() - lapso);
      const fecha = this.datePipe.transform(date, 'yyyy-MM-dd');
      resolve(fecha);
    });
  }

}