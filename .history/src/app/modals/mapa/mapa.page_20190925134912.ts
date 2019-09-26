import { Component, OnInit, NgZone, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';

import { ProductosModalPage } from '../productos-modal/productos-modal.page';

import { UbicacionService } from 'src/app/services/ubicacion.service';

import { EnterAnimation } from 'src/app/animations/enter';
import { LeaveAnimation } from 'src/app/animations/leave';

import { ClienteDesatendido, Pedido } from 'src/app/interfaces/venta.interface';
import { ClientesService } from 'src/app/services/clientes.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {

  @Input() origen;
  @Input() cliente: Pedido;

  clientes: Pedido[] = [];
  clienteReady = false;
  dir: string;

  ubicacion =  {
    lat: 20.622894,
    lng: -103.415830
  };
  ubicacionReady = false;
  ubicacionSub: Subscription;

  icon = '../../../assets/img/pin.svg';
  casa = '../../../assets/img/casa.svg';

  pagina = 'lista';


  clientesDesatendidos: ClienteDesatendido[] = [];
  clientesReady = false;

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
    if (this.origen === 'morosos') {
      this.getClientesDesatendidos();
    }
    if (this.origen === 'pedidos') {
      this.clienteService.listenPedidos();
      this.clientesSub = this.clienteService.pedidos.subscribe(pedidos => {
        this.clientes = pedidos;
        this.clientes.sort((a, b) => a.minutos - b.minutos);
        console.log(this.clientes);
      });
    }
  }

  segmentChanged(event) {
    this.pagina = event.detail.value;
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
        if (this.origen === 'morosos') {
          this.getClientesDesatendidos();
        }
      }
    });
    return await modal.present();
  }

  getClientesDesatendidos() {
    const clientes: any = JSON.parse(localStorage.getItem('clientes'));
    console.log(clientes);
    if (clientes) {
      this.clientesDesatendidos = clientes;
      this.clientesReady = true;
    } else {
      this.presentToast('No hay clientes registrados que necesiten atención inmediata');
    }
  }

  // Auxiliares

  regresar() {
    if (this.clientesSub) { this.clientesSub.unsubscribe(); }
    if (this.ubicacionSub) { this.ubicacionSub.unsubscribe(); }
    this.modalController.dismiss();
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1500
    });
    toast.present();
  }

  // Eventos Mapa

  mapaListo(event) {
    // console.log(event);
    // event.get
  }


}
