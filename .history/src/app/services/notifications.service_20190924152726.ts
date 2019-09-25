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
  uid: string;

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
        this.uid = this.uidService.getUid();
        this.db.object(`carga/${this.uid}/datos/token`).set(data.userId);
      });
      await this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

      this.oneSignal.handleNotificationReceived().subscribe(data => {
        this.ngZone.run(() => {
          if (data.payload.additionalData.cliente) {
            const info = data.payload.additionalData.cliente;
            if (!this.pedidos) {
              this.pedidos.push(info);
              this.clientesObs.next(this.pedidos);
              return;
            }
            const i = this.pedidos.findIndex(p => p.pedido.id === info.pedido.id);
            if (i >= 0) {
              return;
            }
            this.pedidos.push(info);
          } else if (data.payload.additionalData.mensaje) {
            const info = data.payload.additionalData.mensaje;
            console.log(info);
            const i = this.pedidos.findIndex(p => p.pedido.id === info.idPedido);
            if (i >= 0) {
              this.pedidos[i].msgPend = true;
              this.clientesObs.next(this.pedidos);
              return;
            }
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

}
