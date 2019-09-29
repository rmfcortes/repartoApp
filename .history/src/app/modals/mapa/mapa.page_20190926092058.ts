import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController, PickerController } from '@ionic/angular';

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
  todosPines = true;
  pinSolo: Pines;

  clientesReady = false;
  // Para Registrados
  clientesDesatendidos: ClienteDesatendido[] = [];
  lapso = 1;

  // Para pedidos
  clientes: Pedido[] = [];
  clientesSub: Subscription;
  pinesSub: Subscription;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    public pickerController: PickerController,
    private ubicacionService: UbicacionService,
    private clienteService: ClientesService,
  ) { }

  ngOnInit() {
    this.getUbicacion();
  }

  ionViewDidEnter() {
    if (this.origen === 'registrados') {
      this.getClientesRegistrados();
    }
    if (this.origen === 'pedidos') {
      this.getClientesPedido();
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

  getClientesPedido() {
    this.clientes = [];
    this.clienteService.resetClientes();
    this.clienteService.listenPedidos();
    this.clientesSub = this.clienteService.pedidos.subscribe(pedidos => {
      this.clientes = pedidos;
      this.clientes.sort((a, b) => a.minutos - b.minutos);
      this.clientesReady = true;
    });
    this.pinesSub = this.clienteService.pinesObs.subscribe(pines => {
      this.pines = pines;
    });
  }

  async getClientesRegistrados() {
    this.clientesDesatendidos = await this.clienteService.getClientesDesatendidos(this.lapso);
    this.pines = [];
    this.sortClientesRegistrados();
  }

  async sortClientesRegistrados() {
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
    this.clientesReady = true;
  }

  // Acciones

  presentPinSolo(id) {
    this.pagina = 'mapa';
    this.todosPines = false;
    const i = this.pines.findIndex(p => p.id === id);
    this.pinSolo = {
      id: this.pines[i].id,
      lat: this.pines[i].lat,
      lng: this.pines[i].lng,
    };
  }

  pinSelected(pin) {
    let cliente;
    if (this.origen === 'pedidos') {
      cliente = this.clientes.find(c => c.cliente === pin.id);
    }
    if (this.origen === 'registrados') {
      cliente = this.clientesDesatendidos.find(c => c.cliente === pin.id);
    }
    this.presentProductos(cliente);
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
          this.clientesDesatendidos = this.clientesDesatendidos.filter(c => c.cliente !== cliente.cliente);
        }
      }
    });
    return await modal.present();
  }

  // Auxiliares

  regresar() {
    if (this.pinesSub) { this.pinesSub.unsubscribe(); }
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
    if (this.pagina === 'lista') {
      this.todosPines = true;
    }
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

  async openPicker() {
    const options: any = this.getOptions();
    const picker = await this.pickerController.create({
      columns: [
        {
          name: 'Días',
          options: [options]
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: (value) => {
            console.log(`Got Value ${value}`);
          }
        }
      ]
    });
    await picker.present();
  }

  getOptions() {
    const options = [];
    for (let i = 0; i < 20; i++) {
      options.push({
        text: i,
        value: i
      });
    }
    return options;
}


}
