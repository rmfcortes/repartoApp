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

  setupPush() {
    // I recommend to put these into your environment.ts
    this.oneSignal.startInit(environment.oneSignalID, environment.senderID);

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.endInit();
  }

  escuchaNotificaciones() {
    return this.oneSignal.handleNotificationReceived();
  }

  notificacionesAbiertas() {
    return this.oneSignal.handleNotificationOpened();
  }

}
