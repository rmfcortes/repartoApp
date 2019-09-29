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
    return this.db.list(`chats/${this.uid}/${idCliente}`);
  }

  listenNoti(idCliente) {
    return this.db.list(`pedidos/${this.uid}/mensajes/${idCliente}`).valueChanges();
  }

  publicarMsg(id, msg: Mensaje) {
    this.db.list(`chats/${this.uid}/${id}`).push(msg);
  }

}
