import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ValidPassService } from 'src/app/services/valid-pass.service';

@Component({
  selector: 'app-cierre',
  templateUrl: './cierre.page.html',
  styleUrls: ['./cierre.page.scss'],
})
export class CierrePage implements OnInit {

  validando = false;
  pass: string;

  venta = 0;
  gasto = 0;
  balance = 0;
  diferencia = 0;

  efectivoEntreado: number;

  constructor(
    private alertCtrl: AlertController,
    private modalController: ModalController,
    private validPassService: ValidPassService,
  ) { }

  ngOnInit() {
  }

  async entregarVenta() {
    this.viajes = await this.ventaService.getResumenGeneral();
    this.viajes.forEach(v => {
      this.venta += v.venta || 0;
      this.gasto += v.gasto || 0;
    });
    this.balance = this.venta - this.gasto;
    console.log(this.viajes);
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
    const cierre = {
      balance: this.balance,
      diferencia: this.diferencia,
      entrega: this.efectivoEntreado,
      gasto: this.gasto,
      validaEntrega: this.pass,
      venta: this.venta,
      viajes: this.viajes.length
    };
    await this.ventaService.guardaBalance(cierre);
    this.ventaService.borraViaje();
    this.presentToast('Información guardado. Ahora cerraremos tu sesión');
    setTimeout(() => {
      this.validando = false;
      this.logOut();
    }, 2200);
  }

  regresar() {
    this.modalController.dismiss();
  }

  // Auxiliares

  async validaPass() {
    this.validando = true;
    try {
      const resp = await this.validPassService.getValidPass(this.pass);
      if (resp) {
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

}
