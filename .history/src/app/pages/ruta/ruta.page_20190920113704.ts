import { Component, OnInit, NgZone, ViewChild, OnDestroy } from '@angular/core';
import { ModalController, IonSlides, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';


import { MapsAPILoader } from '@agm/core';
import { } from 'googlemaps';
import {
  BarcodeScannerOptions,
  BarcodeScanner
} from '@ionic-native/barcode-scanner/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

import { PedidosPage } from 'src/app/modals/pedidos/pedidos.page';
import { GastoModalPage } from 'src/app/modals/gasto-modal/gasto-modal.page';
import { ProductosModalPage } from 'src/app/modals/productos-modal/productos-modal.page';
import { ResumenViajeModalPage } from 'src/app/modals/resumen-viaje-modal/resumen-viaje-modal.page';

import { VentaService } from 'src/app/services/venta.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { NotificationsService } from 'src/app/services/notifications.service';

import { fadeEnterAnimation } from 'src/app/animations/fadeEnter';
import { fadeLeaveAnimation } from 'src/app/animations/fadeLeave';
import { EnterAnimation } from 'src/app/animations/enter';
import { LeaveAnimation } from 'src/app/animations/leave';

import { ProductoCarga, ResumenViaje } from 'src/app/interfaces/producto.interface';
import { Pedido, ClienteDesatendido } from 'src/app/interfaces/venta.interface';

@Component({
  selector: 'app-ruta',
  templateUrl: './ruta.page.html',
  styleUrls: ['./ruta.page.scss'],
})
export class RutaPage implements OnInit, OnDestroy {

  @ViewChild(IonSlides, {static: false}) slide: IonSlides;

  ubicacion =  {
    lat: 20.622894,
    lng: -103.415830
  };
  ubicacionReady = false;
  zoom = 16;
  icon = '../../../assets/img/pin.svg';
  casa = '../../../assets/img/casa.svg';
  pinHappy = '../../../assets/img/pinHappy.svg';
  pinSad = '../../../assets/img/pinSad.svg';
  pinAngry = '../../../assets/img/pinAngry.svg';

  cliente =  {
    lat: 0,
    lng: 0,
    direccion: ''
  };

  dir: string;

  clienteReady = false;

  scannedData: {};
  barcodeScannerOptions: BarcodeScannerOptions = {
    showTorchButton: true,
    showFlipCameraButton: true
  };

  pageMap = true;

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: false,
    loop: false,
    centeredSlides: true,
    speed: 400
  };

  productos: ProductoCarga[];
  resumen: ResumenViaje = {
    venta : 0,
    gasto : 0
  };
  balance: number;

  pass = '';
  validando = false;
  resumenReady = false;

  clientes: Pedido[] = [];

  salir = false;

  clientesDesatendidos: ClienteDesatendido[] = [];
  clientesReady = false;

  url = 'https://repartoapp-50540.firebaseapp.com';

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private socialSharing: SocialSharing,
    private alertCtrl: AlertController,
    private mapsAPILoader: MapsAPILoader,
    private barcodeScanner: BarcodeScanner,
    private modalController: ModalController,
    private toastController: ToastController,
    private notificationService: NotificationsService,
    private ubicacionService: UbicacionService,
    private clienteService: ClientesService,
    private ventaService: VentaService,
  ) { }

  // Inicio

  async ngOnInit() {
    await this.clienteService.actualizaListaClientes();
    // await this.notificationService.setupPush();
    await this.notificationService.pedidosPendientes();
    // await this.ubicacionService.startBackgroundGeolocation();
    // this.ubicacionService.ubicacion.subscribe(coords => {
    //   this.ubicacion.lat = coords.lat;
    //   this.ubicacion.lng = coords.lng;
    //   this.ubicacionReady = true;
    //   console.log(coords);
    // });
    this.pedidosEntrantes();
  }

  ionViewDidEnter() {
    this.slide.lockSwipes(true);
    setTimeout(() => {
      this.setAutocomplete();
    }, 500);
  }

  pedidosEntrantes() {
    this.notificationService.clientesObs.subscribe((clientes: Pedido[]) => {
      this.clientes = clientes;
      this.salir = false;
      const hora = Date.now();
      this.clientes.forEach(p => {
        const momento = ( p.createdAt + 1800000 - hora ) / 1000;
        const tiempo = momento / 60;
        p.minutos = Math.floor(tiempo);
        p.segundos = Math.floor((tiempo - p.minutos) * 60);
      });
      this.clientes.sort((a, b) => a.minutos - b.minutos); // de menor a mayor
      this.countDown();
      console.log(this.clientes);
    });
  }

  // Eventos

  async presentProductos(cliente, origen: string, i?) {
    cliente.origen = origen;
    const modal = await this.modalController.create({
      enterAnimation: EnterAnimation,
      leaveAnimation: LeaveAnimation,
      component: ProductosModalPage,
      componentProps: {cliente}
    });
    modal.onWillDismiss().then(resp => {
      this.clienteReady = false;
      if (resp.data) {
        if (i >= 0 && origen === 'pedido') {
          this.clientes.splice(i, 1);
        }
        if (i >= 0 && origen === 'morosos') {
          this.clientesDesatendidos.splice(i, 1);
        }
        this.presentToast('Venta guardada');
      }
    });
    return await modal.present();
  }

  async presentPedidos() {
    const modal = await this.modalController.create({
      enterAnimation: fadeEnterAnimation,
      leaveAnimation: fadeLeaveAnimation,
      component: PedidosPage,
      componentProps: {pedidos: this.clientes}
    });
    return await modal.present();
  }

  async presentGasto() {
    const modal = await this.modalController.create({
      enterAnimation: EnterAnimation,
      leaveAnimation: LeaveAnimation,
      component: GastoModalPage,
      componentProps: {}
    });
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        this.presentToast('Compra guardada');
      }
    });
    return await modal.present();
  }

  scanCode() {
    this.barcodeScanner
      .scan()
      .then(barcodeData => {
        const resp: any = JSON.stringify(barcodeData);
        console.log(resp);
        const cliente = {
          cliente: resp.text,
        };
        this.presentProductos(cliente, 'qr');
      })
      .catch(err => {
        console.log('Error', err);
      });
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

  limpiaClientesDesatendidos() {
    console.log('Limpiar');
    this.clientesDesatendidos = [];
    this.clientesReady = false;
  }

  async shareViaWhatsApp(telefono) {
    this.socialSharing.shareViaWhatsAppToReceiver(
      telefono,
      'Hola, visita nuestra página, en ella podrás generar y rastrear pedidos',
      null,
      this.url
    ).then(resp => {
      this.presentAlert('Mensaje enviado', 'Listo, hemos compartido el enlace.');
    }).catch(err => {
      this.presentAlert('Error', err);
    });
  }

  // Fin viaje

  async finViaje() {
    this.slide.lockSwipes(false);
    this.slide.slideNext();
    this.pageMap = false;
    this.slide.lockSwipes(true);
    this.pass = '';
    this.productos = await this.ventaService.getCargaStorage();
    const resp: ResumenViaje = await this.ventaService.getResumen();
    if (resp && resp.gasto) {
      this.resumen.gasto = resp.gasto;
    }
    if (resp && resp.venta) {
      this.resumen.venta = resp.venta;
    }
    this.balance = this.resumen.venta - this.resumen.gasto;
    this.resumenReady = true;
  }

  async presentResumen(origen) {
    const modal = await this.modalController.create({
      enterAnimation: fadeEnterAnimation,
      leaveAnimation: fadeLeaveAnimation,
      component: ResumenViajeModalPage,
      componentProps: {tipo: origen}
    });
    return await modal.present();
  }

  regresar() {
    this.slide.lockSwipes(false);
    this.slide.slidePrev();
    this.pageMap = true;
    this.slide.lockSwipes(true);
  }

  // Salida

  async validaPass() {
    this.validando = true;
    try {
      const resp = await this.ventaService.getValidPass(this.pass);
      if (resp) {
        this.terminarViaje();
      } else {
        this.validando = false;
        this.presentAlert('Error', `Contraseña incorrecta. O no tienes permisos suficientes para validar
                              la carga. Intenta con otra contraseña o ponte en contacto con el administrador`);
      }
    } catch (error) {
      this.validando = false;
      this.presentAlert('Error', `Contraseña incorrecta. O no tienes permisos suficientes para validar
                              la carga. Intenta con otra contraseña o ponte en contacto con el administrador`);
    }
  }

  async terminarViaje() {
    await this.ventaService.updateBDFinViaje(this.pass);
    this.ventaService.resetCarga();
    this.router.navigate(['/inicio']);
  }

  ngOnDestroy(): void {
    console.log('On destroy');
    this.salir = true;
    this.ubicacionService.detenerUbicacion();
  }

  // Auxiliares

  async presentTelPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Ingresa el teléfono',
      inputs: [
        {
          name: 'telefono',
          type: 'tel',
          placeholder: 'Sin espacios ej. 4581188913'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: data => {
            this.shareViaWhatsApp(data.telefono);
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1500
    });
    toast.present();
  }

  async presentAlert(title, msg) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

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
              this.cliente.lat = lat;
              this.cliente.lng = lng;
              this.cliente.direccion = place.formatted_address;
              this.clienteReady = true;
              this.dir = '';
          });
      });
    });
  }

  guardaLoc(evento) {
    this.cliente.lat = evento.coords.lat;
    this.cliente.lng = evento.coords.lng;
  }

  countDown() {
    setTimeout(() => {
      if (this.salir) {
        return;
      }
      this.clientes.forEach(p => {
        if (p.minutos > 15 ) {
          p.pin = this.pinHappy;
        } else if (p.minutos > 5 ) {
          p.pin = this.pinSad;
        } else {
          p.pin = this.pinAngry;
        }
        if (p.segundos === 0) {
          p.minutos -= 1;
          p.segundos = 59;
        } else {
          p.segundos -= 1;
        }
      });
      this.ubicacionReady = true;
      this.countDown();
    }, 1000);
  }

}
