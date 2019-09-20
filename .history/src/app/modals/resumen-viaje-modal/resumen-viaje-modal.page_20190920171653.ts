import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VentaService } from 'src/app/services/venta.service';
import { ComprasService } from 'src/app/services/compras.service';
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

  noMore = false;
  batch = 3;
  lastKey = '';

  constructor(
    private modalCtrl: ModalController,
    private ventaService: VentaService,
    private compraService: ComprasService
  ) { }

  ngOnInit() {
    console.log(this.tipo);
    if (this.tipo === 'ventas') {
      this.getVentas();
    } else if (this.tipo === 'gastos') {
      this.getGastos();
    }
  }

  async getVentas(event?) {
    const ventas = await this.ventaService.getVentas(this.batch + 1, this.lastKey);
    this.cargaVentas(ventas, event);
  }

  async getGastos() {
    this.compras = await this.compraService.getCompras();
    console.log(this.compras);
  }

  cargaVentas(ventas, event) {
    console.log(ventas);
    if (ventas.length === this.batch + 1) {
      this.lastKey = ventas[ventas.length - 1].id;
      ventas.pop();
    } else {
      this.noMore = true;
    }
    if (this.ventas.length === 0) {
      this.ventas = [...ventas];
    } else {
      this.ventas = this.ventas.concat(ventas);
    }
    if (event) {
      event.target.complete();
    }
    console.log(this.ventas);
  }

  async loadData(event) {
    if (this.noMore) {
      event.target.disabled = true;
      event.target.complete();
      return;
    }
    this.getVentas(event);
    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
