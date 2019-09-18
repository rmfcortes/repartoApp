import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VentaService } from 'src/app/services/venta.service';
import { CompraService } from 'src/app/services/compra.service';
import { Compra } from 'src/app/interfaces/compra.interface';

@Component({
  selector: 'app-resumen-viaje-modal',
  templateUrl: './resumen-viaje-modal.page.html',
  styleUrls: ['./resumen-viaje-modal.page.scss'],
})
export class ResumenViajeModalPage implements OnInit {

  @Input() tipo;

  ventas: any = [];
  compras: Compra[] = [];

  constructor(
    private modalCtrl: ModalController,
    private ventaService: VentaService,
    private compraService: CompraService
  ) { }

  ngOnInit() {
    if (this.tipo === 'ventas') {
      this.getVentas();
    } else if (this.tipo === 'gastos') {
      this.getGastos();
    }
  }

  async getVentas() {
    this.ventas = await this.ventaService.getVentas();
    console.log(this.ventas);
  }

  async getGastos() {
    this.compras = await this.compraService.getCompras();
    console.log(this.compras);
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
