import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Pedido } from 'src/app/interfaces/venta.interface';
import { fadeEnterAnimation } from 'src/app/animations/fadeEnter';
import { fadeLeaveAnimation } from 'src/app/animations/fadeLeave';
import { ChatPage } from '../chat/chat.page';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {

  @Input() pedidos: Pedido[];

  color = 'red';

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  async presentChat(cliente) {
    const modal = await this.modalCtrl.create({
      enterAnimation: fadeEnterAnimation,
      leaveAnimation: fadeLeaveAnimation,
      component: ChatPage,
      componentProps: {cliente}
    });
    return await modal.present();
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
