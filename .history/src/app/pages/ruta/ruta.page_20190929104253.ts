import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  BarcodeScannerOptions,
  BarcodeScanner
} from '@ionic-native/barcode-scanner/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

import { MapaPage } from 'src/app/modals/mapa/mapa.page';
import { GastoModalPage } from 'src/app/modals/gasto-modal/gasto-modal.page';
import { ProductosModalPage } from 'src/app/modals/productos-modal/productos-modal.page';

import { UidService } from 'src/app/services/uid.service';
import { VentaService } from 'src/app/services/venta.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { NotificationsService } from 'src/app/services/notifications.service';

import { EnterAnimation } from 'src/app/animations/enter';
import { LeaveAnimation } from 'src/app/animations/leave';

import { Colaborador } from 'src/app/interfaces/colaborador.interface';
import { ProductoCarga, ResumenViaje } from 'src/app/interfaces/producto.interface';
import { FinViajePage } from 'src/app/modals/fin-viaje/fin-viaje.page';

@Component({
  selector: 'app-ruta',
  templateUrl: './ruta.page.html',
  styleUrls: ['./ruta.page.scss'],
})
export class RutaPage implements OnInit, OnDestroy {

  colaborador: Colaborador;
  calificaciones: number;
  promedio: number;
  colabSub: Subscription;

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

  salir = false;

  url = 'https://repartoapp-50540.firebaseapp.com';

  pedidos: number;
  mensajes: any;
  msnSub: Subscription;
  pedidosSub: Subscription;
  pedidosNotActive: boolean;

  avatar = '../../../assets/img/avatar.png';

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
    this.getColaborador();
    await this.notificationService.setupPush();
    await this.ubicacionService.startBackgroundGeolocation();
    this.getUbicacion();
    this.pedidosEntrantes();
    this.pedidosNoAsignados();
  }

  getColaborador() {
    console.log(this.colabSub);
    if (this.colabSub) {
      return;
    }
    this.colaborador = this.uidService.getUser();
    this.colabSub =  this.ventaService.getCalificacion().subscribe((rate: any) => {
      this.calificaciones = rate.calificaiones;
      this.promedio = rate.promedio || 0.1;
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
    if (this.pedidosSub) {
      return;
    }
    this.pedidosSub =  this.clienteService.hayPedidos().subscribe((pedidos: any) => {
        this.pedidos = pedidos;
        this.mensajesEntrantes();
    });
  }

  mensajesEntrantes() {
    if (this.msnSub) {
      return;
    }
    this.msnSub =  this.clienteService.hayMensajes().subscribe((mensajes: any) => {
        this.mensajes = mensajes;
    });
  }

  pedidosNoAsignados() {
    if (this.pedidosNotActive) {
      return;
    }
    this.clienteService.hayPedidosNot().query.ref.on('child_added', snapshot => {
      this.pedidosNotActive = true;
      if (snapshot.exists()) {
        const data = snapshot.val();
        this.clienteService.autoAsignaPedido(data);
      }
    });
  }

  // Eventos

  async presentMapa(origen: string) {
    const modal = await this.modalController.create({
      enterAnimation: EnterAnimation,
      leaveAnimation: LeaveAnimation,
      component: MapaPage,
      componentProps: {origen}
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
        if (resp) {
          const cliente = {
            cliente: resp.text,
          };
          this.presentProductos(cliente, 'qr');
        }
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

  // Salida

  async presentFinViaje() {
    const modal = await this.modalController.create({
      enterAnimation: EnterAnimation,
      leaveAnimation: LeaveAnimation,
      component: FinViajePage,
      componentProps: {}
    });
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        this.clienteService.stopCount();
        this.router.navigate(['/inicio']);
      }
    });
    return await modal.present();
  }

  ngOnDestroy(): void {
    console.log('Detener ubicacion');
    if (this.msnSub) { this.msnSub.unsubscribe(); }
    if (this.colabSub) { this.colabSub.unsubscribe(); }
    if (this.pedidosSub) { this.pedidosSub.unsubscribe(); }
    if (this.ubicacionSub) { this.ubicacionSub.unsubscribe(); }
    if (this.pedidosNotActive) { this.clienteService.hayPedidosNot().query.ref.off(); }
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