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
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
      .then(result => {
        if (result.hasPermission) {
          // If having permission show 'Turn On GPS' dialogue
          this.locationStatus();
        } else {
          // If not having permission ask for permission
          this.requestGPSPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }

    // To check whether Location Service is enabled or Not
    async locationStatus() {
        this.diagnostic.isLocationEnabled()
          .then((isEnabled) => {
            if (!isEnabled) {
              this.requestGPSPermission();
              // To check if GPS is set to High Accuracy
              this.diagnostic.isGpsLocationEnabled().then(resp => {
                if (resp) {
                } else {
                  this.askToTurnOnGPS();
                }
              });
            }
          })
          .catch((e) => {
            // this.showToast('Please turn on Location');
            this.presentAlert(
              'Algo salió mal',
              'Por favor activa tu GPS e intenta de nuevo',
              null);
          });
    }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        this.askToTurnOnGPS();
      } else {
        // Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(() => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              // Show alert if user click on 'No Thanks'
              this.presentAlert(
                'Otorga permisos',
                'Para continuar necesitamos conocer tu ubiación, por favor acepta',
                'permiso');
            }
          );
      }
    });
  }

  askPer() {
    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(() => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              // Show alert if user click on 'No Thanks'
              this.presentAlert(
                'Otorga permisos',
                'Para continuar necesitamos conocer tu ubiación, por favor acepta',
                'permiso');
            }
          );
  }

  askGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(() => {
        console.log('Acabas de prender el GPS');
        console.log('Continuar');
        // When GPS Turned ON call method to get Accurate location coordinates
      },
      error => {
        this.presentAlert(
          'Activa el servicio de ubiación',
          'Para continuar es necesario prender el GPS, por favor acepta',
          'ask');
      }
    );
  }

  // Para activar alta precision
  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(() => {
        console.log('Acabas de prender el GPS');
        console.log('Continuar');
        // When GPS Turned ON call method to get Accurate location coordinates
      },
      error => {
        this.presentAlert(
          'Activa el servicio de ubiación',
          'Para continuar es necesario prender el GPS, por favor acepta',
          'ask');
      }
    );
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
            if (accion === 'ask') {
              this.askToTurnOnGPS();
            } else if (accion === 'permiso') {
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
