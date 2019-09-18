import { Component, OnInit, Input } from '@angular/core';
import { ProductoCarga } from '../../interfaces/producto.interface';
import { ModalController, ToastController } from '@ionic/angular';
import { VentaService } from 'src/app/services/venta.service';

@Component({
  selector: 'app-productos-modal',
  templateUrl: './productos-modal.page.html',
  styleUrls: ['./productos-modal.page.scss'],
})
export class ProductosModalPage implements OnInit {

  @Input() cliente;

  productos: ProductoCarga[] = [];
  prodsReady = false;

  cuenta = 0;

  validando = false;

  constructor(
    private toastController: ToastController,
    private modalController: ModalController,
    private ventaService: VentaService,
  ) { }

  ngOnInit() {
    console.log(this.cliente);
    this.getProds();
  }

  async getProds() {
    this.productos = await this.ventaService.getCargaStorage();
    this.productos = this.productos.filter(p => p.actual > 0);
    if (this.cliente.pedido) {
      const pedido = this.cliente.pedido.productos;
      console.log(pedido);
      const i = this.productos.findIndex(p => p.id === pedido.id);
      if (i >= 0) {
        this.productos[i].agregado = true;
        this.productos[i].cantidad = pedido.cantidad;
        this.cuenta = pedido.cantidad * pedido.precio;
      }
    }
    this.prodsReady = true;
    console.log(this.productos);
  }

  addProduct(producto) {
    producto.agregado = true;
    producto.cantidad = 1;
    this.cuenta += producto.precio;
  }

  plusProduct(producto) {
    if (producto.actual === producto.cantidad) {
      this.presentToast('Ya no tienes más inventario en existencia de este producto');
      return;
    }
    producto.cantidad++;
    this.cuenta += producto.precio;
  }

  minusProduct(producto) {
    producto.cantidad--;
    this.cuenta -= producto.precio;
    if (producto.cantidad === 0) {
      producto.agregado = false;
    }
  }

  async cerrarVenta() {
    this.validando = true;
    const vendidos = this.productos.filter(p => p.cantidad > 0);
    this.ventaService.guardaSoloCargaEnStorage(this.productos);
    await this.ventaService.updateCargaDB(this.productos);
    this.ventaService.pushVenta(vendidos, this.cliente, this.cuenta);
    console.log(vendidos);
    console.log(this.productos);
    this.validando = false;
    this.modalController.dismiss(true);
  }

  regresar() {
    this.modalController.dismiss(null);
  }

  // Auxiliares

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }

}
