import { Injectable } from '@angular/core';
import { FCM } from '@ionic-native/fcm/ngx';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private fcm: FCM
  ) { }

  getToken() {
    console.log('Get token');
    this.fcm.getToken().then(token => {
      console.log(token);
    });
  }
}
