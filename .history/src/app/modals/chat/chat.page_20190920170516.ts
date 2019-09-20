import { Component, OnInit, ViewChild, NgZone, Input } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { Mensaje } from 'src/app/interfaces/chat.interface';
import { ChatService } from 'src/app/services/chat.service';
import { UidService } from 'src/app/services/uid.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild(IonContent, {static: true}) content: IonContent;
  @Input() id;
  @Input() pedidoId;

  messages: Mensaje[] = [];

  newMsg = '';

  constructor(
    private ngZone: NgZone,
    private modalController: ModalController,
    private chatService: ChatService,
    private uidService: UidService,
  ) { }

  ngOnInit() {
    this.chatService.setSeen(this.pedidoId);
    this.listenMsg();
  }

  listenMsg() {
    this.chatService.listenMsg(this.id).query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        this.messages.push(snapshot.val());
        setTimeout(() => {
      this.content.scrollToBottom(0);
    });
      });
    });
  }

  sendMessage() {
    const newMsg: Mensaje = {
      isMe: false,
      createdAt: new Date().getTime(),
      msg: this.newMsg,
      vendedor: this.uidService.getUid()
    };
    console.log(newMsg);
    this.chatService.publicarMsg(this.id, newMsg);
    this.newMsg = '';
    setTimeout(() => {
      this.content.scrollToBottom(0);
    });
  }

  regresar() {
    this.modalController.dismiss();
  }

}
