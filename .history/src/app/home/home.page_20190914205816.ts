import { Component } from '@angular/core';
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
  ) { }

  async ionViewDidEnter() {
    await this.ubicacionService.startBackgroundGeolocation();
    this.ubicacionService.ubicacion.subscribe(coords => {
      this.ubicacion.lat = coords.lat;
      this.ubicacion.lng = coords.lng;
      this.presentToast(coords);
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
