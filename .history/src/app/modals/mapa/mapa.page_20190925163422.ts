import { Component, OnInit, NgZone, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';

import { ProductosModalPage } from '../productos-modal/productos-modal.page';

import { UbicacionService } from 'src/app/services/ubicacion.service';

import { EnterAnimation } from 'src/app/animations/enter';
import { LeaveAnimation } from 'src/app/animations/leave';

import { ClienteDesatendido, Pedido, Pines } from 'src/app/interfaces/venta.interface';
import { ClientesService } from 'src/app/services/clientes.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {

  @Input() origen;

  // General
  ubicacion =  {
    lat: 20.622894,
    lng: -103.415830
  };

  pines: Pines[] = [];
  icon = '../../../assets/img/pin.svg';
  casa = '../../../assets/img/casa.svg';

  ubicacionReady = false;
  ubicacionSub: Subscription;

  pagina = 'lista';

  clientesReady = false;
  // Para Registrados
  clientesDesatendidos: ClienteDesatendido[] = [];
  lapso = 1;

  // Para pedidos
  clientes: Pedido[] = [];
  clientesSub: Subscription;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private ubicacionService: UbicacionService,
    private clienteService: ClientesService,
  ) { }

  ngOnInit() {
    console.log(this.origen);
    this.getUbicacion();
  }

  ionViewDidEnter() {
    if (this.origen === 'registrados') {
      this.getUbicacion();
      this.getClientesDesatendidos();
    }
    if (this.origen === 'pedidos') {
      this.clientes = [];
      this.clienteService.listenPedidos();
      this.clientesSub = this.clienteService.pedidos.subscribe(pedidos => {
        this.clientes = pedidos;
        this.clientes.sort((a, b) => a.minutos - b.minutos);
        this.setPinesPedido(this.clientes);
        console.log(this.clientes);
      });
    }
  }

  getUbicacion() {
    if (this.ubicacionSub) {
      return;
    }
    this.ubicacionSub =  this.ubicacionService.ubicacion.subscribe(coords => {
      this.ubicacion.lat = coords.lat;
      this.ubicacion.lng = coords.lng;
      this.ubicacionReady = true;
    });
  }

  async presentProductos(cliente) {
    cliente.origen = this.origen;
    const modal = await this.modalController.create({
      enterAnimation: EnterAnimation,
      leaveAnimation: LeaveAnimation,
      component: ProductosModalPage,
      componentProps: {
        cliente,
      }
    });
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        if (this.origen === 'registrados') {
          this.getClientesDesatendidos();
        }
      }
    });
    return await modal.present();
  }

  presentMapaPedido(cliente) {
    this.pagina = 'mapa';
  }

  presentMapaMoroso(cliente) {
    this.pagina = 'mapa';
  }

  async getClientesDesatendidos() {
    this.clientesDesatendidos = await this.clienteService.getClientesDesatendidos(this.lapso);
    this.pines = [];
    this.sortClientesRegistrados();
  }

  setPinesPedido(clientes: Pedido[]) {
    console.log(clientes);
    clientes.forEach(c => {
      const pin: Pines = {
        id: c.cliente,
        lat: c.pedido.direccion.lat,
        lng: c.pedido.direccion.lng
      };
      this.pines.push(pin);
    });
    this.clientesReady = true;
  }

  async sortClientesRegistrados() {
    console.log(this.ubicacion);
    for (const c of this.clientesDesatendidos) {
      const pin: Pines = {
        id: c.cliente,
        lat: c.lat,
        lng: c.lng
      };
      this.pines.push(pin);
      c.distancia = await this.calculaDistancia(this.ubicacion.lat, this.ubicacion.lng, c.lat, c.lng);
    }
    this.clientesDesatendidos.sort((a, b) => a.distancia - b.distancia);
    console.log(this.clientesDesatendidos);
    this.clientesReady = true;
  }

  // Auxiliares

  regresar() {
    if (this.clientesSub) { this.clientesSub.unsubscribe(); }
    if (this.ubicacionSub) { this.ubicacionSub.unsubscribe(); }
    if (this.origen === 'pedidos') { this.clienteService.stopCount(); }
    this.modalController.dismiss();
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1500
    });
    toast.present();
  }

  segmentChanged(event) {
    this.pagina = event.detail.value;
  }

  calculaDistancia( lat1, lng1, lat2, lng2 ): Promise<number> {
    return new Promise ((resolve, reject) => {
      const R = 6371; // Radius of the earth in km
      const dLat = this.deg2rad(lat2- lat1);  // this.deg2rad below
      const dLon = this.deg2rad(lng2 - lng1);
      const a =
         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
         Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
         Math.sin(dLon / 2) * Math.sin(dLon / 2)
         ;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km
      resolve(d);
    });
  }

  deg2rad( deg ) {
    return deg * (Math.PI / 180);
  }


}
