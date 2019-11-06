import { Component } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { CierrePage } from 'src/app/modals/cierre/cierre.page';

import { AuthService } from 'src/app/services/auth.service';
import { VentaService } from 'src/app/services/venta.service';

import { EnterAnimation } from 'src/app/animations/enter';
import { LeaveAnimation } from 'src/app/animations/leave';

import { Producto } from 'src/app/interfaces/producto.interface';
import { NetworkService } from 'src/app/services/network.service';
import { PermissionsService } from 'src/app/services/permissions.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  productos: Producto[] = [];

  pass = '';
  viaje = 1;

  prodsReady = false;

  validando = false;

  isConnected = true;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    private permissionService: PermissionsService,
    private ventaService: VentaService,
    private netService: NetworkService,
    private authService: AuthService,
  ) { }

  ionViewWillEnter() {
    this.netService.checkNetStatus();
    this.netService.isConnected.subscribe(resp => {
      this.isConnected = resp;
    });
    this.getViaje();
    this.getProductos();
  }

  async getProductos() {
    try {
      this.productos = await this.ventaService.getProductos();
      this.prodsReady = true;
    } catch (error) {
      console.log(error);
    }
  }

  async getViaje() {
    const resp = await this.ventaService.getViaje();
    let viaje = parseInt(resp, 10);
    if (viaje >= 1 ) {
      viaje++;
      this.viaje = viaje;
    } else {
      this.viaje = 1;
    }
  }

  addProduct(producto) {
    producto.agregado = true;
    producto.cantidad = 1;
  }

  plusProduct(producto) {
    producto.cantidad++;
  }

  minusProduct(producto) {
    producto.cantidad--;
    if (producto.cantidad === 0) {
      producto.agregado = false;
    }
  }

  async aVender() {
    try {
      const resp = await this.permissionService.checkGPSPermission();
      if (resp) {
        this.authService.actualizarStatus('En ruta');
        this.productos = this.productos.filter(p => p.agregado);
        await this.ventaService.updateViaje(this.viaje);
        await this.ventaService.setCarga(this.productos);
        await this.ventaService.setViajeDB(this.pass);
        this.validando = false;
        this.pass = '';
        this.router.navigate(['/ruta']);
      }
    } catch (error) {
      this.validando = false;
      this.presentAlert('Error', error);
    }
  }

  // Entregar venta

  async cierre() {
    const modal = await this.modalController.create({
      enterAnimation: EnterAnimation,
      leaveAnimation: LeaveAnimation,
      component: CierrePage,
      componentProps: {}
    });
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        this.logOut();
      }
    });
    return await modal.present();
  }

  // Salida

  async validaPass() {
    this.validando = true;
    try {
      const resp = await this.ventaService.getValidPass(this.pass);
      if (resp) {
        this.aVender();
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

  alertSalir() {
    this.presentAlertSalida(
      'Cerrar sesión',
      '¿Estás seguro que quieres cerrar sesión?',
    );
  }

  async logOut() {
    await this.authService.actualizarStatus('Inactivo');
    await this.authService.logout();
    this.router.navigate(['/login']);
    const nombre = 'app';
    navigator[nombre].exitApp();
  }

  // Auxiliares

  async presentAlertSalida(title, msg) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: [{
        text: 'OK',
        handler: () => { this.logOut(); }
      }]
    });

    await alert.present();
  }

  async presentAlert(title, msg) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500
    });
    toast.present();
  }
}
