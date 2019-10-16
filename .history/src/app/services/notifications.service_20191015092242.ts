import { Injectable, NgZone } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { AngularFireDatabase } from '@angular/fire/database';

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Badge } from '@ionic-native/badge/ngx';

import { UidService } from './uid.service';
import { environment } from 'src/environments/environment';

import { Pedido } from '../interfaces/venta.interface';
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  pedidos: Pedido[] = [];
  uid: string;

  constructor(
    private badge: Badge,
    private ngZone: NgZone,
    private oneSignal: OneSignal,
    private db: AngularFireDatabase,
    private toastController: ToastController,
    private uidService: UidService,
  ) { }

  async setupPush() {
    return new Promise(async (resolve, reject) => {
      await this.oneSignal.startInit(environment.oneSignalID, environment.senderID);
      this.oneSignal.getIds().then(data => {
        this.uid = this.uidService.getUid();
        this.db.object(`carga/${this.uid}/datos/token`).set(data.userId);
      });
      await this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

      this.oneSignal.handleNotificationReceived().subscribe(data => {
        this.ngZone.run(() => {
          this.badge.set(1);
          if (data.payload.additionalData.mensaje) {
            this.presentToast('Nuevo mensaje recibido');
          }
          if (data.payload.additionalData.pedido) {
            this.presentToast('Nuevo pedido');
          }
        });
      });

      await this.oneSignal.endInit();
      resolve();
    });
  }

  setSeen(id) {
    this.db.object(`pedidos/${this.uid}/${id}`).update({msgPend: false});
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1500
    });
    toast.present();
  }

  clearBadge() {
    this.badge.clear();
  }
}
