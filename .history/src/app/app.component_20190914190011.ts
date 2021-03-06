import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FcmService } from './services/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private fcm: FcmService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    console.log('Init');
    this.platform.ready().then(() => {
      console.log('Plat ready');
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.fcm.getToken();
    });
  }
}
