import { Component, OnInit, NgZone, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

import { MapsAPILoader } from '@agm/core';
import { } from 'googlemaps';

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

  icon = '../../../assets/img/pin.svg';
  casa = '../../../assets/img/casa.svg';

  ubicacionReady = false;

  clientesDesatendidos: ClienteDesatendido[] = [];
  clientesReady = false;

  clientesSub: Subscription;

  constructor(
    private ngZone: NgZone,
    private mapsAPILoader: MapsAPILoader,
    private modalController: ModalController,
    private toastController: ToastController,
    private ubicacionService: UbicacionService,
    private clienteService: ClientesService,
  ) { }

  ngOnInit() {
    this.getUbicacion();
  }

  ionViewDidEnter() {
    if (this.origen === 'busqueda') {
      setTimeout(() => {
        this.setAutocomplete();
      }, 500);
    }
    if (this.origen === 'morosos') {
      this.getClientesDesatendidos();
    }
    if (this.origen === 'pedido') {
      this.clientesSub = this.clienteService.pedidos.subscribe(pedidos => {
        this.clientes = pedidos;
      });
    }
  }

  getUbicacion() {
    this.ubicacionService.ubicacion.subscribe(coords => {
      this.ubicacion.lat = coords.lat;
      this.ubicacion.lng = coords.lng;
      this.ubicacionReady = true;
    });
  }

  async presentProductos(cliente, i?) {
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
        if (i >= 0 && this.origen === 'pedido') {
          this.clientes.splice(i, 1);
        }
        if (i >= 0 && this.origen === 'morosos') {
          this.clientesDesatendidos.splice(i, 1);
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

  setAutocomplete() {
    this.mapsAPILoader.load().then(async () => {
      const nativeHomeInputBox = document.getElementById('txtHome').getElementsByTagName('input')[0];
      const autocomplete = new google.maps.places.Autocomplete(nativeHomeInputBox, {
        types: ['address']
      });
      autocomplete.addListener('place_changed', () => {
          this.ngZone.run(async () => {
              // get the place result
              const place: google.maps.places.PlaceResult = autocomplete.getPlace();

              // verify result
              if (place.geometry === undefined || place.geometry === null) {
                  return;
              }
              // set latitude, longitude and zoom
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              // this.cliente.lat = lat;
              // this.cliente.lng = lng;
              // this.cliente.direccion = place.formatted_address;
              this.clienteReady = true;
              this.dir = '';
          });
      });
    });
  }

  regresar() {
    if (this.clientesSub) { this.clientesSub.unsubscribe(); }
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
