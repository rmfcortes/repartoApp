import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';

import { CierreService } from 'src/app/services/cierre.service';

@Component({
  selector: 'app-cierre',
  templateUrl: './cierre.page.html',
  styleUrls: ['./cierre.page.scss'],
})
export class CierrePage implements OnInit {

  validando = false;
  pass = '';

  venta = 0;
  gasto = 0;
  kmRecorridos = 0;
  balance = 0;
  diferencia = 0;

  efectivoEntreado: number;

  viajes: any = [];

  constructor(
    private alertCtrl: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    private cierreService: CierreService,
  ) { }

  ngOnInit() {
    this.entregarVenta();
  }

  async entregarVenta() {
    this.viajes = await this.cierreService.getResumenGeneral();
    console.log(this.viajes);
    this.viajes.forEach(v => {
      this.venta += v.venta || 0;
      this.gasto += v.gasto || 0;
      this.kmRecorridos += v.recorrido;
    });
    this.balance = this.venta - this.gasto;
  }

  evaluaDiferencia() {
    this.validando = true;
    this.diferencia = this.balance - this.efectivoEntreado;
    if (this.diferencia > 0) {
      this.presentAlertEntrega('Dinero faltante', `Faltan $${this.diferencia}, confirma si estás de acuerdo.`);
      return;
    }
    this.validaPass();
  }

  async cierreTurno() {
    try {
      const cierre = {
        balance: this.balance,
        diferencia: this.diferencia,
        entrega: this.efectivoEntreado,
        gasto: this.gasto,
        valida: this.pass,
        venta: this.venta,
        recorrido: this.kmRecorridos,
        viajes: this.viajes.length
      };
      await this.cierreService.guardaBalance(cierre);
      this.cierreService.borraViaje();
      this.presentToast('Información guardado. Ahora cerraremos tu sesión');
      setTimeout(() => {
        this.validando = false;
        this.modalController.dismiss(true);
      }, 2200);
    } catch (error) {
      console.log(error);
    }
  }

  regresar() {
    this.modalController.dismiss();
  }

  // Auxiliares

  async validaPass() {
    this.validando = true;
    try {
      const resp = await this.cierreService.getValidPass(this.pass);
      if (resp) {
        this.cierreTurno();
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

  async presentAlert(title, msg) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentAlertEntrega(title, msg) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
        text: 'Aceptar',
        handler: () => { this.validaPass(); }
        },
    ]
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
