import { Component, OnInit, ViewChild, NgZone, Input } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { Mensaje } from 'src/app/interfaces/chat.interface';
import { ChatService } from 'src/app/services/chat.service';
import { UidService } from '../../../../.history/src/app/services/uid.service_20190915085200';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild(IonContent, {static: true}) content: IonContent;
  @Input() id;

  messages: Mensaje[] = [
    {
      isMe: true,
      createdAt: 1554090856000,
      msg: 'Hey whats up mate?',
      vendedor: 'f3Hfk3of5EPdvT7owYIBKA82QP62'
    },
    {
      isMe: false,
      createdAt: 1554090956000,
      msg: 'Working on the Ionic mission, you?',
      vendedor: 'f3Hfk3of5EPdvT7owYIBKA82QP62'
    },
    {
      isMe: true,
      createdAt: 1554091056000,
      msg: 'Doing some new tutorial stuff',
      vendedor: 'f3Hfk3of5EPdvT7owYIBKA82QP62'
    }
  ];

  newMsg = '';

  constructor(
    private ngZone: NgZone,
    private modalController: ModalController,
    private chatService: ChatService,
    private uidService: UidService,
  ) { }

  ngOnInit() {
    this.listenMsg();
  }

  sendMessage() {
    const newMsg: Mensaje = {
      isMe: false,
      createdAt: new Date().getTime(),
      msg: this.newMsg,
      vendedor: this.uidService.getUid()
    };
    this.chatService.publicarMsg(this.id, newMsg);
    this.newMsg = '';
    setTimeout(() => {
      this.content.scrollToBottom(0);
    });
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

  regresar() {
    this.modalController.dismiss();
  }

}
