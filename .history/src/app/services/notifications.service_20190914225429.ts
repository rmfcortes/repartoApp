import { Injectable } from '@angular/core';

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(
    private oneSignal: OneSignal,
  ) { }

  async setupPush() {
    return new Promise(async (resolve, reject) => {
      await this.oneSignal.startInit(environment.oneSignalID, environment.senderID);
      await this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      this.oneSignal.handleNotificationReceived().subscribe(data => {
        console.log('Recibida');
      });
      this.oneSignal.handleNotificationOpened().subscribe(data => {
        console.log('Abierta');
      });
      await this.oneSignal.endInit();
      resolve();
    });
  }

  escuchaNotificaciones() {
    return this.oneSignal.handleNotificationReceived().subscribe(data => {
      console.log('Recibida');
    });
  }

  notificacionesAbiertas() {
    return this.oneSignal.handleNotificationOpened().subscribe(data => {
      console.log('Abierta');
    });
  }

}
