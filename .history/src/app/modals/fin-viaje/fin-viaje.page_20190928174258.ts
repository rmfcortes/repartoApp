import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';

import { ResumenViajeModalPage } from 'src/app/modals/resumen-viaje-modal/resumen-viaje-modal.page';

import { fadeEnterAnimation } from 'src/app/animations/fadeEnter';
import { fadeLeaveAnimation } from 'src/app/animations/fadeLeave';

import { VentaService } from 'src/app/services/venta.service';
import { ResumenViaje, ProductoCarga } from 'src/app/interfaces/producto.interface';

@Component({
  selector: 'app-fin-viaje',
  templateUrl: './fin-viaje.page.html',
  styleUrls: ['./fin-viaje.page.scss'],
})
export class FinViajePage implements OnInit {

  productos: ProductoCarga[];

  resumen: ResumenViaje = {
    venta : 0,
    gasto : 0
  };
  balance: number;

  pass = '';
  validando = false;
  resumenReady = false;

  constructor(
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private ventaService: VentaService,
  ) { }

  ngOnInit() {
  }

  async finViaje() {
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

  // Validación

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

  // Salida

  async terminarViaje() {
    await this.ventaService.updateBDFinViaje(this.pass);
    this.ventaService.resetCarga();
    this.validando = false;
    this.modalController.dismiss(true);
  }

  regresar() {
    this.modalController.dismiss();
  }

  // Auxiliares

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
