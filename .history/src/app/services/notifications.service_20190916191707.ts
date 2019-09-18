import { Injectable, NgZone } from '@angular/core';

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';
import { Pedido } from '../interfaces/venta.interface';
import { VentaService } from './venta.service';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  clientesObs = new BehaviorSubject({});
  pedidos: Pedido[] = [];

  constructor(
    private ngZone: NgZone,
    private oneSignal: OneSignal,
    private db: AngularFireDatabase,
    private ventaService: VentaService,
    private uidService: UidService,
  ) { }

  async setupPush() {
    return new Promise(async (resolve, reject) => {
      await this.oneSignal.startInit(environment.oneSignalID, environment.senderID);
      this.oneSignal.getIds().then(data => {
        const uid = this.uidService.getUid();
        this.db.object(`repartidores/${uid}`).update({notificationId: data.userId});
      });
      await this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

      this.oneSignal.handleNotificationReceived().subscribe(data => {
        this.ngZone.run(() => {
          const info = data.payload.additionalData.cliente;
          console.log('Recibida');
          console.log(info);
          if (!this.pedidos) {
            this.pedidos.push(info);
            console.log(this.pedidos);
            this.clientesObs.next(this.pedidos);
            return;
          }
          const i = this.pedidos.findIndex(p => p.pedido.id === info.pedido.id);
          if (i >= 0) {
            return;
          }
          this.pedidos.push(info);
          console.log(this.pedidos);
        });
      });
      this.oneSignal.handleNotificationOpened().subscribe(data => {
        this.ngZone.run(() => {
          const info = data.notification.payload.additionalData.cliente;
          console.log('Abierta');
          console.log(info);
          if (!this.pedidos) {
            this.pedidos.push(info);
            console.log(this.pedidos);
            this.clientesObs.next(this.pedidos);
            return;
          }
          const i = this.pedidos.findIndex(p => p.pedido.id === info.pedido.id);
          if (i >= 0) {
            return;
          }
          this.pedidos.push(info);
          console.log(this.pedidos);
        });
      });
      await this.oneSignal.endInit();
      resolve();
    });
  }

  async pedidosPendientes() {
    return new Promise(async (resolve, reject) => {
      const clientes = await this.ventaService.revisaPedidos();
      console.log('Pendientes');
      console.log(clientes);
      this.pedidos = clientes;
      this.clientesObs.next(this.pedidos);
      resolve();
    });
  }

}
