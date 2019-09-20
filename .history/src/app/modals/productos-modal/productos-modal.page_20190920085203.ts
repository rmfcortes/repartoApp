import { Component, OnInit, Input } from '@angular/core';
import { ProductoCarga } from '../../interfaces/producto.interface';
import { ModalController, ToastController } from '@ionic/angular';
import { VentaService } from 'src/app/services/venta.service';
import { DatosVenta } from 'src/app/interfaces/venta.interface';

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

  datosVenta: DatosVenta;

  constructor(
    private toastController: ToastController,
    private modalController: ModalController,
    private ventaService: VentaService,
  ) { }

  ngOnInit() {
    this.getProds();
  }

  async getProds() {
    this.productos = await this.ventaService.getCargaStorage();
    this.productos = this.productos.filter(p => p.actual > 0);
    if (this.cliente.cliente) {
      this.datosVenta.id = this.cliente.cliente;
      if (this.cliente.origen === 'qr' || this.cliente.origen === 'pedido') {
        await this.getPerfil();
      }
      await this.setPrecios();
      if (this.cliente.pedido) {
        await this.setPedido();
      }
    }
    this.prodsReady = true;
    console.log(this.cliente);
    console.log(this.productos);
  }

  // Set info

  getPerfil() {
    return new Promise(async (resolve, reject) => {
      const cliente: any = await this.ventaService.getCliente(this.cliente.cliente);
      this.datosVenta.usuario = cliente.nombre;
      this.datosVenta.direccion = cliente.direccion;
      this.datosVenta.lat = cliente.lat;
      this.datosVenta.lng = cliente.lng;
      this.cliente.precios = cliente.precios;
      resolve();
    });
  }

  setPrecios() {
    return new Promise(async (resolve, reject) => {
      if (this.cliente.precios) {
        Object.entries(this.cliente.precios).forEach((pre: any) => {
          const i = this.productos.findIndex(p => p.id === pre[0]);
          if (i >= 0) {
            this.productos[i].precio = pre[1];
          }
        });
      }
      resolve();
    });
  }

  setPedido() {
    return new Promise((resolve, reject) => {
      this.datosVenta.lat = this.cliente.pedido.direccion.lat;
      this.datosVenta.lng = this.cliente.pedido.direccion.lng;
      const pedido  = this.cliente.pedido.productos;
      pedido.forEach(producto => {
        const i = this.productos.findIndex(p => p.id === producto.id);
        if (i >= 0) {
          this.productos[i].agregado = true;
          if (producto.cantidad > this.productos[i].actual) {
            this.productos[i].cantidad = this.productos[i].actual;
          } else {
            this.productos[i].cantidad = producto.cantidad;
          }
          this.cuenta += producto.cantidad * this.productos[i].precio;
        }
      });
      resolve();
    });
  }

  // Acciones

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
    this.ventaService.pushVenta(vendidos, this.datosVenta, this.cuenta);
    if (this.cliente.origen === 'pedido') {
      await this.ventaService.deletePedido(this.cliente.pedido.id);
    }
    if (this.cliente.cliente) {
      await this.ventaService.updateLastCompra(this.cliente.cliente);
    }
    console.log(vendidos);
    console.log(this.productos);
    this.validando = false;
    this.modalController.dismiss(true);
  }

  // Salida

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
