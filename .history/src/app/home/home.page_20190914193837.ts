import { Component } from '@angular/core';
import { FcmService } from '../services/fcm.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  token: any;
  titulo = 'Prueba';

  constructor(
    private fcm: FcmService,
  ) { }

  async ionViewDidEnter() {
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

}
