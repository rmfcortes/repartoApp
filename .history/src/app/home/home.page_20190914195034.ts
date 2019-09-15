import { Component } from '@angular/core';
import { FcmService } from '../services/fcm.service';
import { UbicacionService } from '../services/ubicacion.service';
import { ToastController } from '@ionic/angular';

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
    private toastController: ToastController,
    private ubicacionService: UbicacionService,
    private fcm: FcmService,
  ) { }

  async ionViewDidEnter() {
    await this.ubicacionService.startBackgroundGeolocation();
    this.ubicacionService.ubicacion.subscribe(coords => {
      this.ubicacion.lat = coords.lat;
      this.ubicacion.lng = coords.lng;
      this.presentToast(coords);
    });
    this.token = await this.fcm.getToken();
    this.fcm.notificationEntrante().subscribe(data => {
      alert(data);
      console.log(data);
      if (data.wasTapped) {
        console.log('Received in background');
        // this.router.navigate([data.landing_page, data.price]);
      } else {
        console.log('Received in foreground');
        // this.router.navigate([data.landing_page, data.price]);
      }
    });
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 750
    });
    toast.present();
  }

}
