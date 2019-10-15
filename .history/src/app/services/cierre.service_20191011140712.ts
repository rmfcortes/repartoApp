import { Injectable } from '@angular/core';
import { UidService } from './uid.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { DatePipe } from '@angular/common';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class CierreService {

  uid: string;
  fecha: string;

  constructor(
    private platform: Platform,
    private storage: Storage,
    private datePipe: DatePipe,
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getResumenGeneral() {
    return new Promise(async (resolve, reject) => {
      await this.getFecha();
      this.uid = this.uidService.getUid();
      const resSub = this.db.list(`ventas/${this.fecha}/${this.uid}/detalles`).valueChanges()
        .subscribe(resumen => {
          resSub.unsubscribe();
          resolve(resumen);
        });
    });
  }

  guardaBalance(cierre) {
    cierre.id = this.uid;
    return new Promise(async (resolve, reject) => {
      await this.db.object(`balance/${this.fecha}/${this.uid}`).set(cierre);
      resolve();
    });
  }

  async borraViaje() {
    return new Promise(async (resolve, reject) => {
      try {
        if ( this.platform.is('cordova') ) {
          this.storage.remove('viaje');
        } else {
          localStorage.removeItem('viaje');
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getValidPass(pass) {
    return new Promise ((resolve, reject) => {
      console.log(pass);
      const passSub = this.db.object(`solo-lectura/pass-supervisores/${pass}`).valueChanges()
        .subscribe (data => {
          console.log(data);
          passSub.unsubscribe();
          if (data) {
            resolve(true);
          } else {
            reject();
          }
        }, () => {
          reject();
        });
    });
  }

  getFecha() {
    return new Promise ((resolve, reject) => {
      const date = new Date();
      this.fecha = this.datePipe.transform(date, 'yyyy-MM-dd');
      resolve();
    });
  }

}


