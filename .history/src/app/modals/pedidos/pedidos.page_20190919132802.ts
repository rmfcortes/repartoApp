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
    this.pedidos.forEach(p => {
      const tiempo = ( Date.now() - p.createdAt ) / 1000;
      let minutos = tiempo / 60;
      const segundos = (tiempo - minutos) * 60;
      minutos = minutos - segundos;
      console.log(tiempo);
      console.log(minutos);
      console.log(segundos);
    });
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
