import { Component } from '@angular/core';
import { FcmService } from '../services/fcm.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  token: any;

  constructor(
    private fcm: FcmService,
  ) {
    console.log('Home');
  }

  async ionViewDidEnter() {
    this.token = await this.fcm.getToken();
  }

}
