import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private router: Router,
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private authService: AuthService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      const user = await this.authService.getUsuarioStorage();
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      const estado = await this.authService.getStatus();
      if (estado === 'Inactivo') {
        this.router.navigate(['/login']);
      } else if (estado === 'Activo') {
        this.router.navigate(['/inicio']);
      } else if (estado === 'En ruta') {
        this.router.navigate(['/ruta']);
      }
    });
  }
}
