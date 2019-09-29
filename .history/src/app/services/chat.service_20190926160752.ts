import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';
import { Mensaje } from '../interfaces/chat.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  uid: string;

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) {
    this.uid = this.uidService.getUid();
  }

  setSeen(idPedido, idCliente) {
    this.db.object(`pedidos/${this.uid}/detalles/${idPedido}`).update({msgPend: false});
    this.db.object(`pedidos/${this.uid}/mensajes/${idCliente}`).remove();
  }

  listenMsg(idCliente) {
    return this.db.list(`chats/${this.uid}/${idCliente}/mensajes`);
  }

  listenNoti(idCliente) {
    return this.db.object(`pedidos/${this.uid}/mensajes/${idCliente}`).valueChanges();
  }

  listenStatus(idCliente) {
    return this.db.object(`chats/${this.uid}/${idCliente}/status`).valueChanges();
  }

  publicarMsg(idCliente, msg: Mensaje) {
    this.db.object(`chats/${this.uid}/${idCliente}/status`).remove();
    this.db.list(`chats/${this.uid}/${idCliente}/mensajes`).push(msg);
  }

}
