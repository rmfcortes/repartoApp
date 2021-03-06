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

  salir = false;
  color = 'red';

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.salir = false;
    const hora = Date.now();
    console.log(hora);
    this.pedidos.forEach(p => {
      const momento = ( p.createdAt + 1800000 - hora ) / 1000;
      const tiempo = momento / 60;
      p.minutos = Math.floor(tiempo);
      p.segundos = Math.floor((tiempo - p.minutos) * 60);
    });
    this.pedidos.sort((a, b) => a.minutos - b.minutos); // de menor a mayor
    this.countDown();
  }

  countDown() {
    setTimeout(() => {
      if (this.salir) {
        return;
      }
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
    this.salir = true;
    this.modalCtrl.dismiss();
  }

}
