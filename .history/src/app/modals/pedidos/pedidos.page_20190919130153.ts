import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Pedido } from 'src/app/interfaces/venta.interface';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {

  @Input() pedidos: Pedido[];

  minutos = 5;
  segundos = 45;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    console.log(Date.now());
    this.countDown();
  }

  countDown() {
    setTimeout(() => {
      if (this.segundos === 0) {
        this.minutos -= 1;
        this.segundos = 60;
      } else {
        this.segundos -= 1;
      }
      this.countDown();
    }, 1000);
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
