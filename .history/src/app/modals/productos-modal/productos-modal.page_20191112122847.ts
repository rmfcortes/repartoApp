import { Component, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { ChatPage } from '../chat/chat.page';

import { ClientesService } from 'src/app/services/clientes.service';
import { VentaService } from 'src/app/services/venta.service';

import { fadeLeaveAnimation } from 'src/app/animations/fadeLeave';
import { fadeEnterAnimation } from 'src/app/animations/fadeEnter';

import { ProductoCarga } from '../../interfaces/producto.interface';
import { DatosVenta } from 'src/app/interfaces/venta.interface';
@Component({
  selector: 'app-productos-modal',
  templateUrl: './productos-modal.page.html',
  styleUrls: ['./productos-modal.page.scss'],
})
export class ProductosModalPage {

  @Input() cliente;

  productos: ProductoCarga[] = [];
  prodsReady = false;

  cuenta = 0;

  validando = false;

  datosVenta: DatosVenta = {
    hora: 0,
    id: '',
    lat: 0,
    lng: 0,
    total: 0,
    cliente: ''
  };

  usuario: string;
  direccion: string;
  telefono = '';

  ubicacion =  {
    lat: 20.622894,
    lng: -103.415830
  };

  ubicacionSub: Subscription;


  constructor(
    private callNumber: CallNumber,
    private clienteService: ClientesService,
    private toastController: ToastController,
    private modalController: ModalController,
    private ventaService: VentaService,
  ) { }

  ionViewWillEnter() {
    this.getProds();
  }

  async getProds() {
    this.productos = await this.ventaService.getCargaStorage();
    this.productos = this.productos.filter(p => p.actual > 0);
    if (this.cliente.cliente) {
      this.datosVenta.id = this.cliente.cliente;
      switch (this.cliente.origen) {
        case 'pedidos':
          await this.getPerfil();
          await this.setDatosPedido();
          break;
        case 'qr':
          const cliente = await this.getPerfil();
          this.setDatos(cliente);
          break;
        case 'registrados':
          this.setDatos(this.cliente);
          break;
        }
      await this.setPrecios();
    } else {
      this.setDatosAnom();
    }
    this.prodsReady = true;
  }

  // Set info Pedidos

  setDatosAnom() {
    this.datosVenta.lat = this.cliente.lat;
    this.datosVenta.lng = this.cliente.lng;
  }

  setDatosPedido() {
    return new Promise((resolve, reject) => {
      this.datosVenta.lat = this.cliente.pedido.direccion.lat;
      this.datosVenta.lng = this.cliente.pedido.direccion.lng;
      this.direccion = this.cliente.pedido.direccion.direccion;
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
          if (this.cliente.precio && this.cliente.precio[producto.id]) {
            this.cuenta += parseInt(producto.cantidad, 10) * parseInt(this.cliente.precio[producto.id], 10);
          } else {
            this.cuenta += parseInt(producto.cantidad, 10) * parseInt(this.productos[i].precio, 10);
          }
        }
      });
      resolve();
    });
  }

  // QR

  getPerfil() {
    return new Promise(async (resolve, reject) => {
      const cliente: any = await this.clienteService.getCliente(this.cliente.cliente);
      this.cliente.precio = cliente.precio || null;
      if (this.cliente.origen === 'pedidos') {
        this.usuario = this.cliente.pedido.usuario || cliente.nombre;
      } else {
        this.usuario = cliente.nombre || 'Anónimo';
      }
      this.telefono = cliente.telefono || '';
      resolve(cliente);
    });
  }

  // QR y Registrados

  setDatos(cliente) {
    this.datosVenta.lat = cliente.direccion.lat;
    this.datosVenta.lng = cliente.direccion.lng;
    this.direccion = cliente.direccion.direccion;
    this.usuario = cliente.nombre || 'Anónimo';
    this.telefono = cliente.telefono || '';
  }

  setPrecios() {
    return new Promise(async (resolve, reject) => {
      if (this.cliente.precio) {
        Object.entries(this.cliente.precio).forEach((pre: any) => {
          const i = this.productos.findIndex(p => p.id === pre[0]);
          if (i >= 0) {
            this.productos[i].precioEspecial = pre[1];
          }
        });
      }
      resolve();
    });
  }

  // Acciones

  addProduct(producto) {
    producto.agregado = true;
    producto.cantidad = 1;
    this.cuenta += parseInt(producto.precioEspecial, 10) ? parseInt(producto.precioEspecial, 10) : parseInt(producto.precio, 10);
  }

  plusProduct(producto) {
    if (producto.actual === producto.cantidad) {
      this.presentToast('Ya no tienes más inventario en existencia de este producto');
      return;
    }
    producto.cantidad++;
    this.cuenta += parseInt(producto.precioEspecial ,10) ? parseInt(producto.precioEspecial, 10) : parseInt(producto.precio, 10);
  }

  minusProduct(producto) {
    producto.cantidad--;
    this.cuenta -= parseInt(producto.precioEspecial, 10) ? parseInt(producto.precioEspecial, 10) : parseInt(producto.precio, 10);
    if (producto.cantidad === 0) {
      producto.agregado = false;
    }
  }

  async cerrarVenta() {
    this.validando = true;
    this.datosVenta.cliente = this.usuario || 'No registrado';
    const vendidos = this.productos.filter(p => p.cantidad > 0);
    if (this.cliente.origen === 'pedidos') {
      await this.ventaService.deletePedido(this.cliente.pedido.id);
    }
    this.ventaService.guardaSoloCargaEnStorage(this.productos);
    await this.ventaService.updateCargaDB(this.productos);
    this.ventaService.pushVenta(vendidos, this.datosVenta, this.cuenta);
    this.presentToast('Venta guardada');
    this.validando = false;
    this.modalController.dismiss(true);
  }

  async presentChat() {
    const modal = await this.modalController.create({
      enterAnimation: fadeEnterAnimation,
      leaveAnimation: fadeLeaveAnimation,
      component: ChatPage,
      componentProps: {
        idCliente: this.cliente.cliente,
        pedidoId: this.cliente.pedido.id,
        nombre: this.usuario
      }
    });
    modal.onDidDismiss().then(() => {
      this.cliente.msgPend = false;
    });
    return await modal.present();
  }

  llamar() {
    this.callNumber.callNumber(this.telefono, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.error(err));
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
