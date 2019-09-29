import { Component, OnInit, ViewChild, NgZone, Input } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { Mensaje } from 'src/app/interfaces/chat.interface';
import { ChatService } from 'src/app/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild(IonContent, {static: true}) content: IonContent;
  @Input() idCliente;
  @Input() pedidoId;
  @Input() nombre;

  messages: Mensaje[] = [];

  newMsg = '';

  status = '';

  notiSub: Subscription;
  stateSub: Subscription;

  constructor(
    private ngZone: NgZone,
    private modalController: ModalController,
    private chatService: ChatService,
  ) { }

  ngOnInit() {
    this.chatService.setSeen(this.pedidoId, this.idCliente);
    this.listenMsg();
    this.listenNotification();
    this.listenState();
  }

  listenMsg() {
    this.chatService.listenMsg(this.idCliente).query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        const mensaje = snapshot.val();
        if (mensaje.isMe) {
          mensaje.position = 'left';
        } else {
          mensaje.position = 'right';
        }
        this.messages.push(snapshot.val());
        setTimeout(() => {
      this.content.scrollToBottom(0);
    });
      });
    });
  }

  listenNotification() {
    this.notiSub = this.chatService.listenNoti(this.idCliente).subscribe(mensajes => {
      if (mensajes) {
        this.chatService.setSeen(this.pedidoId, this.idCliente);
      }
    });
  }

  listenState() {
    this.stateSub = this.chatService.listenStatus(this.idCliente).subscribe((estado: any) => {
      this.status = estado || null;
    });
  }

  sendMessage() {
    const newMsg: Mensaje = {
      isMe: false,
      createdAt: new Date().getTime(),
      msg: this.newMsg,
      status: 'Enviado'
    };
    console.log(newMsg);
    this.chatService.publicarMsg(this.idCliente, newMsg);
    this.newMsg = '';
    setTimeout(() => {
      this.content.scrollToBottom(0);
    });
  }

  regresar() {
    this.chatService.listenMsg(this.idCliente).query.ref.off('child_added');
    if (this.notiSub) { this.notiSub.unsubscribe(); }
    if (this.stateSub) { this.stateSub.unsubscribe(); }
    this.modalController.dismiss();
  }

}
