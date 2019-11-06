import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(
    private diagnostic: Diagnostic,
    public alertController: AlertController,
    private locationAccuracy: LocationAccuracy,
    private androidPermissions: AndroidPermissions,
  ) { }

  // Check if application having GPS access permission
  checkGPSPermission() {
    return new Promise((resolve, reject) => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
        .then(async (result) => {
          if (result.hasPermission) {
            // If having permission show 'Turn On GPS' dialogue
            const resp = await this.locationStatus();
            if (resp) {
              resolve(true);
            }
          } else {
            // If not having permission ask for permission
            const resp = await this.requestGPSPermission();
            if (resp) {
              resolve(true);
            }
          }
        },
        err => {
          alert(err);
        }
      );
    });
  }

  requestGPSPermission() {
    return new Promise((resolve, reject) => {
      // Show 'GPS Permission Request' dialogue
      this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
        .then(async () => {
            // call method to turn on GPS
            const resp = await this.locationStatus();
            if (resp) {
              resolve(true);
            }
          },
          error => {
            // Show alert if user click on 'No Thanks'
            this.presentAlert(
              'Otorga permisos',
              'Para continuar necesitamos conocer tu ubiación, por favor acepta',
              'permiso');
          }
        );
    });
  }

  // To check whether Location Service is enabled or Not
  async locationStatus() {
    return new Promise(async (resolve, reject) => {
      this.diagnostic.isLocationEnabled()
        .then(async (isEnabled) => {
          if (!isEnabled) {
            const resp = await this.askToTurnOnGPS();
            if (resp) {
              resolve(true);
            }
            // To check if GPS is set to High Accuracy
          } else {
            const resp = await this.isGpsTurnedOn();
            if (resp) {
              resolve(true);
            }
          }
        })
        .catch((e) => {
          // this.showToast('Please turn on Location');
          this.presentAlert(
            'Algo salió mal',
            'Por favor activa tu GPS e intenta de nuevo',
            null);
        });
    });
  }

  isGpsTurnedOn() {
    return new Promise((resolve, reject) => {
      this.diagnostic.isGpsLocationEnabled()
        .then(async (resp) => {
          if (resp) {
            resolve(true);
          } else {
            const r = await this.askToTurnOnGPS();
            if (r) {
              resolve(true);
            }
          }
        });
    });
  }

  // Para activar alta precision
  askToTurnOnGPS() {
    return new Promise((resolve, reject) => {
      this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
        .then(() => {
          resolve(true);
          // When GPS Turned ON call method to get Accurate location coordinates
        },
        error => {
          this.askToTurnOnGPS();
        }
      );
    });
  }

  async presentAlert(title, msg, accion) {
    const alert = await this.alertController.create({
      header: title,
      message: msg,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: () => {
            if (accion === 'permiso') {
              this.requestGPSPermission();
            } else if (accion === 'licencia') {
              this.checkGPSPermission();
            }
          }
        },
      ]
    });

    await alert.present();
  }



}
