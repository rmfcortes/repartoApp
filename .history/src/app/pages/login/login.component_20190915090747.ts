import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loader: any;

  correo: string;
  pass: string;

  constructor(
    public alertController: AlertController,
    public loadingCtrl: LoadingController,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {}

  async ingresarConCorreo() {
    await this.presentLoading();
    try {
      const resp = await this.authService.loginWithEmail(this.correo, this.pass);
      this.loader.dismiss();
      console.log(resp);
      if (resp) {
        this.authService.actualizarStatus('Activo');
        this.router.navigate(['/inicio']);
      } else {
        this.presentAlert('Usuario no registrado', 'Por favor registra una cuenta antes de ingresar');
      }
    } catch (error) {
      console.log(error);
      if (error.code === 'auth/user-not-found') {
        this.presentAlert('Usuario no registrado', 'Por favor registra tu cuenta antes de ingresar');
      } else if (error.code === 'auth/wrong-password') {
        this.presentAlert('Contraseña inválida', 'La contraseña no es correcta, por favor intenta de nuevo');
      } else if (error.code === 'activo') {
        this.presentAlert
          ('Usuario activo', 'Está cuenta ya ha iniciado sesión en otro dispositivo. Si no has sido tú, comunícate con el administrador');
      } else if (error.code === 'no-es-vendedor') {
        this.presentAlert('Acceso denegado', 'No tienes permisos para acceder a estas funciones');
      }  else {
        this.presentAlert('Error', 'Algo salió mal, por favor intenta de nuevo');
      }
    }
  }

  async presentAlert(title, msg) {
    this.loader.dismiss();
    const alert = await this.alertController.create({
      header: title,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentLoading() {
    this.loader = await this.loadingCtrl.create({
     spinner: 'crescent'
    });
    return await this.loader.present();
  }

}
