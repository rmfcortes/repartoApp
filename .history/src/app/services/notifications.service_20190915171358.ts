import { Injectable } from '@angular/core';

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  public pedido = new BehaviorSubject({
    lat: null,
    lng: null
  });

  constructor(
    private oneSignal: OneSignal,
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  async setupPush() {
    return new Promise(async (resolve, reject) => {
      console.log('init');
      await this.oneSignal.startInit(environment.oneSignalID, environment.senderID);
      console.log('iniciado');
      const id: any = await this.oneSignal.getIds();
      console.log('ideado');
      const uid = this.uidService.getUid();
      console.log(id);
      this.db.object(`repartidores/${uid}`).update({notificationId: id.userId});
      await this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      this.oneSignal.handleNotificationReceived().subscribe(data => {
        console.log('Recibida');
        console.log(data);
      });
      this.oneSignal.handleNotificationOpened().subscribe(data => {
        console.log('Abierta');
        console.log(data);
      });
      await this.oneSignal.endInit();
      resolve();
    });
  }

  escuchaNotificaciones() {
    return this.oneSignal.handleNotificationReceived().subscribe(data => {
      const pedido = {
        lat: data.payload.additionalData.lat,
        lng: data.payload.additionalData.lng,
      };
      console.log(pedido);
      this.pedido.next(pedido);
    });
  }

  notificacionesAbiertas() {
    return this.oneSignal.handleNotificationOpened().subscribe(data => {
      console.log('Abierta');
    });
  }

}
