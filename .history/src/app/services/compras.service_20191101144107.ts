import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { UidService } from './uid.service';
import { VentaService } from './venta.service';

import { Compra } from 'src/app/interfaces/compra.interface';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  uid: string;
  idCompra: string;

  constructor(
    private datePipe: DatePipe,
    private db: AngularFireDatabase,
    private fireStorage: AngularFireStorage,
    private uidService: UidService,
    private ventaService: VentaService,
  ) { }

  guardaFotoCompra(compra: Compra, foto) {
    return new Promise (async (resolve, reject) => {
      this.idCompra = await this.db.createPushId();
      this.uid = this.uidService.getUid();
      const ref = this.fireStorage.ref(`compras/${this.uid}/${this.idCompra}`);
      const task = ref.putString( foto, 'base64', { contentType: 'image/jpeg'} );

      const p = new Promise ((resolver, rejecte) => {
        const tarea = task.snapshotChanges().pipe(
          finalize(async () => {
            const downloadURL = await ref.getDownloadURL().toPromise();
            tarea.unsubscribe();
            resolver(this.guardaDatosCompra(compra, downloadURL));
          })
          ).subscribe(
            x => { console.log(x); },
            err => {
              rejecte();
              console.log(err);
            }
          );
      });
      resolve(p);
    });
  }

  guardaDatosCompra(compra: Compra, url) {
    return new Promise(async (resolve, reject) => {
      compra.fecha = new Date();
      const fecha = this.datePipe.transform(compra.fecha, 'yyyy-MM-dd');
      compra.url = url;
      compra.viaje = await this.ventaService.getViaje();
      await this.db.object(`compras/${this.uid}/${fecha}/${this.idCompra}`).set(compra);
      await this.db.object(`ventas/${fecha}/${this.uid}/detalles/${compra.viaje}/gasto`).query.ref
        .transaction( count => count ? count + compra.total : compra.total);
      await this.db.object(`carga/${this.uid}/sumario/gasto`).query.ref
        .transaction( count => count ? count + compra.total : compra.total);
      resolve(true);
    });
  }

  getCompras(): Promise<Compra[]> {
    return new Promise(async (resolve, reject) => {
      const uid = this.uidService.getUid();
      const date = new Date();
      const fecha = this.datePipe.transform(date, 'yyyy-MM-dd');
      const viaje = await this.ventaService.getViaje();
      const comSub = this.db.list(`compras/${uid}/${fecha}`, data =>
        data.orderByChild('viaje').equalTo(viaje)).valueChanges()
        .subscribe((compras: Compra[]) => {
          comSub.unsubscribe();
          resolve(compras);
        });
    });
  }
}
