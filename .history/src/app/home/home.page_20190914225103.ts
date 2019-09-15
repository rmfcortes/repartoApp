import { Component, NgZone } from '@angular/core';
import { UbicacionService } from '../services/ubicacion.service';
import { ToastController, AlertController } from '@ionic/angular';
import { NotificationsService } from '../services/notifications.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  token: any;
  titulo = 'Prueba';
  ubicacion =  {
    lat: 0,
    lng: 0
  };

  constructor(
    private ngZone: NgZone,
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private ubicacionService: UbicacionService,
    private notificationService: NotificationsService,
  ) { }

  async ionViewDidEnter() {
    await this.ubicacionService.startBackgroundGeolocation();
    this.ubicacionService.ubicacion.subscribe(coords => {
      this.ubicacion.lat = coords.lat;
      this.ubicacion.lng = coords.lng;
      this.presentToast(coords);
    });
    await this.notificationService.setupPush();
    // this.notificationService.escuchaNotificaciones().subscribe(data => {
    //   this.ngZone.run(() => {
    //     this.titulo = 'Recibida';
    //     const msg = data.payload.body;
    //     const title = data.payload.title;
    //     const additionalData = data.payload.additionalData;
    //     this.showAlert(title, msg, additionalData.task);
    //   });
    // });

    // this.notificationService.notificacionesAbiertas().subscribe(data => {
    //   // Just a note that the data is a different place here!
    //   this.ngZone.run(() => {
    //     this.titulo = 'Abierta';
    //     const additionalData = data.notification.payload.additionalData;
    //     this.showAlert('Notification opened', 'You already read this before', additionalData.task);
    //   });
    // });

  }

  async showAlert(title, msg, task) {
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: msg,
      buttons: [
        {
          text: `Action: ${task}`,
          handler: () => {
            // E.g: Navigate to a specific screen
          }
        }
      ]
    });
    alert.present();
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 750
    });
    toast.present();
  }

}
