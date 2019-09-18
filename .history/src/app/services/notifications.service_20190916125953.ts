import { Injectable } from '@angular/core';

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';
import { Cliente } from '../interfaces/compra.interface';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  clientesObs = new BehaviorSubject([]);
  clientes: Cliente[] = [];

  constructor(
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
        this.clientes.push(data.payload.additionalData.cliente);
        this.clientesObs.next(this.clientes);
        console.log(data);
      });
      this.oneSignal.handleNotificationOpened().subscribe(data => {
        this.clientesObs.next(data.notification.payload.additionalData.cliente);
        console.log('Abierta');
        console.log(data);
      });
      await this.oneSignal.endInit();
      resolve();
    });
  }

}
