import { Component, ViewChild } from '@angular/core';
import { AlertController, IonSlides, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { VentaService } from 'src/app/services/venta.service';
import { ClientesService } from 'src/app/services/clientes.service';

import { Producto } from 'src/app/interfaces/producto.interface';
import { NotificationsService } from 'src/app/services/notifications.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild(IonSlides, {static: false}) slide: IonSlides;

  productos: Producto[] = [];

  pass = '';
  viaje = 1;

  prodsReady = false;

  validando = false;

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: false,
    loop: false,
    centeredSlides: true,
    speed: 400
  };

  inicioPage = true;

  viajes: any = [];
  venta = 0;
  gasto = 0;
  balance = 0;
  diferencia = 0;

  efectivoEntreado: number;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private notificationService: NotificationsService,
    private clienteService: ClientesService,
    private ventaService: VentaService,
    private authService: AuthService,
  ) { }

  ionViewWillEnter() {
    this.slide.lockSwipes(true);
    this.getViaje();
    this.getProductos();
    // this.notificationService.setupPush();
  }

  async getProductos() {
    try {
      this.productos = await this.ventaService.getProductos();
      console.log(this.productos);
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
    console.log(this.viaje);
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
      this.authService.actualizarStatus('En ruta');
      this.productos = this.productos.filter(p => p.agregado);
      console.log(this.productos);
      await this.ventaService.updateViaje(this.viaje);
      await this.ventaService.setCarga(this.productos);
      await this.ventaService.setViajeDB(this.pass);
      await this.clienteService.actualizaListaClientes();
      this.validando = false;
      this.router.navigate(['/ruta']);
    } catch (error) {
      this.validando = false;
      this.presentAlert('Error', error);
    }
  }

  // Entregar venta

  async entregarVenta() {
    this.slide.lockSwipes(false);
    this.slide.slideNext();
    this.inicioPage = false;
    this.slide.lockSwipes(true);
    this.viajes = await this.ventaService.getResumenGeneral();
    this.viajes.forEach(v => {
      this.venta += v.venta || 0;
      this.gasto += v.gasto || 0;
    });
    this.balance = this.venta - this.gasto;
    console.log(this.viajes);
  }

  regresar() {
    this.slide.lockSwipes(false);
    this.slide.slidePrev();
    this.inicioPage = true;
    this.slide.lockSwipes(true);
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

  // Salida

  async validaPass() {
    this.validando = true;
    try {
      const resp = await this.ventaService.getValidPass(this.pass);
      if (resp) {
        if (this.inicioPage) {
          this.aVender();
        } else {
          this.cierreTurno();
        }
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
    if (!this.inicioPage) { this.regresar(); }
    this.router.navigate(['/login']);
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
