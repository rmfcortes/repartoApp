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

  async getId() {
    const id = this.oneSignal.getIds();
    const uid = this.uidService.getUid();
    this.db.object(`repartidores/${uid}/notificationId`).update(id);
    console.log(id);
  }

  async setupPush() {
    return new Promise(async (resolve, reject) => {
      await this.oneSignal.startInit(environment.oneSignalID, environment.senderID);
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
