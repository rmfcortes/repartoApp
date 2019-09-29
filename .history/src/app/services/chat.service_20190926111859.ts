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

  setSeen(id) {
    this.db.object(`pedidos/${this.uid}/detalles/${id}`).update({msgPend: false});
    this.db.object(`pedidos/${this.uid}/mensajes/${id}`).remove();
  }

  listenMsg(id) {
    return this.db.list(`chats/${this.uid}/${id}`);
  }

  publicarMsg(id, msg: Mensaje) {
    this.db.list(`chats/${this.uid}/${id}`).push(msg);
  }

}
