import { Injectable, NgZone } from '@angular/core';

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';
import { PedidoCliente } from '../interfaces/venta.interface';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  clientesObs = new BehaviorSubject([]);
  pedidos: PedidoCliente[] = [];

  constructor(
    private ngZone: NgZone,
    private oneSignal: OneSignal,
    private db: AngularFireDatabase,
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
          this.pedidos.push(data.payload.additionalData.cliente);
          this.clientesObs.next(this.pedidos);
          console.log('Recibida');
          console.log(data);
        });
      });
      this.oneSignal.handleNotificationOpened().subscribe(data => {
        this.ngZone.run(() => {
          this.pedidos.push(data.notification.payload.additionalData.cliente);
          this.clientesObs.next(this.pedidos);
          console.log('Abierta');
          console.log(data);
        });
      });
      await this.oneSignal.endInit();
      resolve();
    });
  }

}
