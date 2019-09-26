import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ModalController, IonSlides, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  BarcodeScannerOptions,
  BarcodeScanner
} from '@ionic-native/barcode-scanner/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

import { ChatPage } from 'src/app/modals/chat/chat.page';
import { MapaPage } from 'src/app/modals/mapa/mapa.page';
import { GastoModalPage } from 'src/app/modals/gasto-modal/gasto-modal.page';
import { ProductosModalPage } from 'src/app/modals/productos-modal/productos-modal.page';
import { ResumenViajeModalPage } from 'src/app/modals/resumen-viaje-modal/resumen-viaje-modal.page';

import { UidService } from 'src/app/services/uid.service';
import { VentaService } from 'src/app/services/venta.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { NotificationsService } from 'src/app/services/notifications.service';

import { EnterAnimation } from 'src/app/animations/enter';
import { LeaveAnimation } from 'src/app/animations/leave';
import { fadeEnterAnimation } from 'src/app/animations/fadeEnter';
import { fadeLeaveAnimation } from 'src/app/animations/fadeLeave';

import { Pedido } from 'src/app/interfaces/venta.interface';
import { Colaborador } from 'src/app/interfaces/colaborador.interface';
import { ProductoCarga, ResumenViaje } from 'src/app/interfaces/producto.interface';

@Component({
  selector: 'app-ruta',
  templateUrl: './ruta.page.html',
  styleUrls: ['./ruta.page.scss'],
})
export class RutaPage implements OnInit, OnDestroy {

  @ViewChild(IonSlides, {static: false}) slide: IonSlides;

  colaborador: Colaborador;
  calificaciones: number;
  promedio: number;

  scannedData: {};
  barcodeScannerOptions: BarcodeScannerOptions = {
    showTorchButton: true,
    showFlipCameraButton: true
  };

  ubicacion =  {
    lat: 20.622894,
    lng: -103.415830
  };
  ubicacionReady = false;
  ubicacionSub: Subscription;

  pageMap = true;

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: false,
    loop: false,
    centeredSlides: true,
    speed: 1000
  };

  productos: ProductoCarga[];

  clientes: Pedido[] = [];

  salir = false;

  url = 'https://repartoapp-50540.firebaseapp.com';

  pedidosReady = false;
  pedidosSub: Subscription;

  // Resumen viaje
  resumen: ResumenViaje = {
    venta : 0,
    gasto : 0
  };
  balance: number;

  pass = '';
  validando = false;
  resumenReady = false;

  constructor(
    private router: Router,
    private socialSharing: SocialSharing,
    private alertCtrl: AlertController,
    private barcodeScanner: BarcodeScanner,
    private modalController: ModalController,
    private toastController: ToastController,
    private notificationService: NotificationsService,
    private ubicacionService: UbicacionService,
    private clienteService: ClientesService,
    private ventaService: VentaService,
    private uidService: UidService
  ) { }

  // Inicio

  async ngOnInit() {
    // await this.notificationService.setupPush();
    // await this.ubicacionService.startBackgroundGeolocation();
    // this.getUbicacion();
    this.ubicacionReady = true; // quitar
    this.getColaborador();
    this.pedidosEntrantes();
  }

  ionViewDidEnter() {
    this.slide.lockSwipes(true);
  }

  getColaborador() {
    this.colaborador = this.uidService.getUser();
    this.ventaService.getCalificacion().subscribe((rate: any) => {
      this.calificaciones = rate.calificaiones;
      this.promedio = rate.promedio;
    });
  }

  getUbicacion() {
    if (this.ubicacionSub) {
      return;
    }
    this.ubicacionSub = this.ubicacionService.ubicacion.subscribe(coords => {
      this.ubicacion.lat = coords.lat;
      this.ubicacion.lng = coords.lng;
      this.ubicacionReady = true;
    });
  }

  pedidosEntrantes() {
    this.clienteService.listenPedidos();
    this.clienteService.pedidos.subscribe(pedidos => {
      if (pedidos && pedidos.length > 0) {
        this.clientes = pedidos;
      }
    });
  }

  // Eventos

  async presentMapa(origen: string, cliente?) {
    const modal = await this.modalController.create({
      enterAnimation: EnterAnimation,
      leaveAnimation: LeaveAnimation,
      component: MapaPage,
      componentProps: {
        origen,
        cliente}
    });
    return await modal.present();
  }

  setClienteAnonimo() {
    const cliente = {
      lat: this.ubicacion.lat,
      lng: this.ubicacion.lng
    };
    this.presentProductos(cliente, 'anonimo');
  }

  async presentProductos(cliente, origen: string) {
    cliente.origen = origen;
    const modal = await this.modalController.create({
      enterAnimation: EnterAnimation,
      leaveAnimation: LeaveAnimation,
      component: ProductosModalPage,
      componentProps: {cliente}
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

  async shareViaWhatsApp(telefono) {
    const tel = '+521' + telefono;
    this.socialSharing.shareViaWhatsAppToReceiver(
      tel,
      'App Agua Viva:',
      null,
      this.url
    ).then(resp => {
      console.log('Success');
    }).catch(err => {
      this.presentAlert('Error', err);
    });
  }

  async presentChat(cliente) {
    const modal = await this.modalController.create({
      enterAnimation: fadeEnterAnimation,
      leaveAnimation: fadeLeaveAnimation,
      component: ChatPage,
      componentProps: {idCliente: cliente.cliente, pedidoId: cliente.pedido.id}
    });
    return await modal.present();
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
    console.log(resp);
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
    this.validando = false;
    this.router.navigate(['/inicio']);
    this.regresar();
  }

  ngOnDestroy(): void {
    if (this.ubicacionSub) { this.ubicacionSub.unsubscribe(); }
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

}
