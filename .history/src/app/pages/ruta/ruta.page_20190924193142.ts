import { Component, OnInit, NgZone, ViewChild, OnDestroy } from '@angular/core';
import { ModalController, IonSlides, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import {
  BarcodeScannerOptions,
  BarcodeScanner
} from '@ionic-native/barcode-scanner/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

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
import { Pedido } from 'src/app/interfaces/venta.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ruta',
  templateUrl: './ruta.page.html',
  styleUrls: ['./ruta.page.scss'],
})
export class RutaPage implements OnInit, OnDestroy {

  @ViewChild(IonSlides, {static: false}) slide: IonSlides;

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
    private ngZone: NgZone,
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
  ) { }

  // Inicio

  async ngOnInit() {
    await this.clienteService.actualizaListaClientes();
    await this.notificationService.setupPush();
    // await this.ubicacionService.startBackgroundGeolocation();
    this.pedidosEntrantes();
  }

  ionViewDidEnter() {
    this.slide.lockSwipes(true);
  }

  pedidosEntrantes() {
    this.ventaService.listenPedidos().query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        const cliente = snapshot.val();
        this.salir = false;
        const hora = Date.now();
        const momento = ( cliente.pedido.createdAt + 1800000 - hora ) / 1000;
        const tiempo = momento / 60;
        cliente.minutos = Math.floor(tiempo);
        cliente.segundos = Math.floor((tiempo - cliente.minutos) * 60);
        this.clientes.push(snapshot.val());
        this.clientes.sort((a, b) => a.minutos - b.minutos); // de menor a mayor
        this.countDown();
      });
    });
  }

  pedidoQuitado() {
    this.ventaService.listenPedidos().query.ref.on('child_removed', snapshot => {
      this.ngZone.run(() => {
        const cliente = snapshot.val();
        console.log(cliente);
        const index = this.clientes.findIndex(p => p.pedido.id === cliente.pedido.id);
        console.log(index);
        if (index >= 0) {
          this.clientes.splice(index, 1);
        }
      });
    });
  }

  mensajesEntrantes() {
    this.ventaService.listenPedidos().query.ref.on('child_changed', snapshot => {
      this.ngZone.run(() => {
        const cliente = snapshot.val();
        console.log(cliente);
        const index = this.clientes.findIndex(p => p.pedido.id === cliente.pedido.id);
        console.log(index);
        if (index >= 0) {
          if (cliente.msgPend) {
            this.clientes[index].msgPend = true;
          } else {
            this.clientes[index].msgPend = false;
          }
        }
      });
    });
  }

  // Eventos

  async presentMapa(origen: string, clientes?, i?) {
    const modal = await this.modalController.create({
      enterAnimation: EnterAnimation,
      leaveAnimation: LeaveAnimation,
      component: ProductosModalPage,
      componentProps: {
        origen,
        clientes}
    });
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        if (i >= 0 && origen === 'pedido') {
          this.clientes.splice(i, 1);
        }
        this.presentToast('Venta guardada');
      }
    });
    return await modal.present();
  }

  async presentProductos(cliente, origen: string, i?) {
    cliente.origen = origen;
    const modal = await this.modalController.create({
      enterAnimation: EnterAnimation,
      leaveAnimation: LeaveAnimation,
      component: ProductosModalPage,
      componentProps: {cliente}
    });
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        if (i >= 0 && origen === 'pedido') {
          this.clientes.splice(i, 1);
        }
        this.presentToast('Venta guardada');
      }
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

  countDown() {
    setTimeout(() => {
      if (this.salir) {
        return;
      }
      this.clientes.forEach(p => {
        if (p.segundos === 0) {
          p.minutos -= 1;
          p.segundos = 59;
        } else {
          p.segundos -= 1;
        }
      });
      this.countDown();
    }, 1000);
  }

}
