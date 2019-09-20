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

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.pedidos.forEach(p => {
      const momento = ( Date.now() - p.createdAt ) / 1000;
      const tiempo = momento / 60;
      p.minutos = Math.floor(tiempo);
      p.segundos = Math.floor((tiempo - p.minutos) * 60);
    });
    this.countDown();
  }

  countDown() {
    setTimeout(() => {
      this.pedidos.forEach(p => {
        if (p.segundos === 0) {
          p.minutos -= 1;
          p.segundos = 59;
        } else {
          p.segundos -= 1;
        }
      });
      this.countDown();
    }, 1000);
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
