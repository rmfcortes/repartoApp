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

  color = 'red';

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    
  }

  regresar() {

    this.modalCtrl.dismiss();
  }

}
