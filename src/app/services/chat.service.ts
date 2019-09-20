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

  listenMsg(id) {
    return this.db.list(`chats/${this.uid}/${id}`, data => data.limitToLast(1));
  }

  publicarMsg(id, msg: Mensaje) {
    this.db.list(`chats/${this.uid}/${id}`).push(msg);
  }

}
