import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ToastController, Platform } from '@ionic/angular';
import { DatePipe } from '@angular/common';


import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';


import { GeoFire } from 'geofire';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';
import { VentaService } from './venta.service';
import { PermissionsService } from './permissions.service';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {

  public ubicacion = new BehaviorSubject({
    lat: 20.61,
    lng: -103.42
  });

  uid: string;
  fecha: string;

  geoFire: any;
  viaje: string;

  wathSubscription: Subscription;
  backSubscription: Subscription;
  deActBackSubscription: Subscription;
  backInterval: any;
  intervalo = 1000 * 10;

  options: GeolocationOptions = {
    enableHighAccuracy: true,
  };

  lastLoc = {
    lat: null,
    lng: null
  };

  previousLoc = {
    lag: null,
    lng: null
  };

  constructor(
    private ngZone: NgZone,
    public platform: Platform,
    private datePipe: DatePipe,
    private diagnostic: Diagnostic,
    private db: AngularFireDatabase,
    public geolocation: Geolocation,
    public backgroundMode: BackgroundMode,
    private toastController: ToastController,
    private uidService: UidService,
    private ventaService: VentaService,
    private permissionService: PermissionsService,
  ) { }

  // Inicializar BackMode, Watch

  async initBackgroundMode() {
    this.initDatos();

    this.platform.ready().then(() => {
      this.backgroundMode.setDefaults({silent: true});
      if (!this.backSubscription) {
        this.setBackMode();
      }
      if (!this.deActBackSubscription) {
        this.setFrontMode();
      }
      this.backgroundMode.enable();
      this.backgroundMode.excludeFromTaskList();
      this.regLocMode();
    });
  }

  async initDatos() {
    this.uid = this.uidService.getUid();
    await this.getFecha();
    this.viaje = await this.ventaService.getViaje();
    const dbRef = this.db.list(`activos`);
    this.geoFire = new GeoFire(dbRef.query.ref);
  }

  setBackMode() {
    this.backSubscription =  this.backgroundMode.on('activate').subscribe(() => {
      this.ngZone.run(() => {
        this.backgroundMode.disableWebViewOptimizations();
        if (!this.backInterval) {
          this.backInterval = setInterval(() => {
            console.log('En Back');
            if (this.wathSubscription) { this.wathSubscription.unsubscribe(); }
            this.wathSubscription = null;
            this.getPositionVoid();
          }, this.intervalo);
        }
      });
    });
  }

  setFrontMode() {
    this.deActBackSubscription = this.backgroundMode.on('deactivate').subscribe(async () => {
      clearInterval(this.backInterval);
      this.backInterval = null;
      const resp = await this.permissionService.isGpsTurnedOn();
      if (resp) {
        this.watchPosition();
      }
    });
  }

  regLocMode() {
    this.diagnostic.registerLocationStateChangeHandler((status) => {
      console.log(status);
      if (status === 'location_off') {
        this.backgroundMode.isScreenOff(isOff => {
          if (!isOff) {
            this.permissionService.askToTurnOnGPS();
            this.db.list('test/gps/off').push(Date.now());
          } else {
            this.db.list('test/gps').push('GPS signal was lost');
          }
        });
      } else {
        this.db.list('test/gps/on').push(Date.now());
      }
    });
  }

  // Ubicar

  getPositionVoid(): void {
    this.geolocation.getCurrentPosition(this.options)
      .then(async (position: Geoposition) => {
        this.ngZone.run(async () => {
          this.lastLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          this.comparaLoc(position);
        });
      }).catch(err => {
        this.ngZone.run(() => {
        console.log(err);
        });
      });
  }

  watchPosition() {
    if (this.wathSubscription) {
      return;
    }
    this.wathSubscription = this.geolocation.watchPosition(this.options).subscribe((position: Geoposition) => {
      this.ngZone.run(async () => {
        this.comparaLoc(position);
      }, err => console.log(err));
    });
  }

  // Compara si no es una ubicación erronea

  async comparaLoc(position: Geoposition) {
    if (position.coords.accuracy > 25) {
      return;
    }
    if (!this.lastLoc.lat || !this.lastLoc.lng) {
      this.lastLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.updateLocation(position);
    } else {
      const d = await this.calculaDistancia(
        this.lastLoc.lat,
        this.lastLoc.lng,
        position.coords.latitude,
        position.coords.longitude,
      );
      if (d < 5) {
        // Muy cerca
        return;
      } else {
        this.lastLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.updateLocation(position);
      }
    }
  }

  // Suba ubicación a base de datos

  async updateLocation(data: Geoposition) {
    const coords = {
      lat: data.coords.latitude,
      lng: data.coords.longitude,
    };
    const punto = {
      lat: data.coords.latitude,
      lng: data.coords.longitude,
      speed: data.coords.speed || 0,
      stamp: data.timestamp || 0
    };
    this.ubicacion.next(coords);
    this.geoFire.set(this.uid, [coords.lat, coords.lng]);
    this.db.list(`recorridos/${this.uid}/${this.fecha}/${this.viaje}`).push(punto);
    this.db.object(`carga/${this.uid}/ubicacion`).set(coords);
  }

  // Detener geolocalización

  async detenerUbicacion() {
    if (this.backSubscription) { this.backSubscription.unsubscribe(); }
    if (this.wathSubscription) { this.wathSubscription.unsubscribe(); }
    if (this.deActBackSubscription) { this.deActBackSubscription.unsubscribe(); }
    clearInterval(this.backInterval);
    this.backgroundMode.setEnabled(false);
    this.uid = this.uidService.getUid();
    await this.db.object(`activos/${this.uid}`).remove();
  }

  // Auxiliares

  getFecha() {
    return new Promise ((resolve, reject) => {
      const date = new Date();
      this.fecha = this.datePipe.transform(date, 'yyyy-MM-dd');
      resolve();
    });
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1500
    });
    toast.present();
  }

  calculaDistancia( lat1, lng1, lat2, lng2 ): Promise<number> {
    return new Promise ((resolve, reject) => {
      const R = 6371; // Radius of the earth in km
      const dLat = this.deg2rad(lat2 - lat1);  // this.deg2rad below
      const dLon = this.deg2rad(lng2 - lng1);
      const a =
         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
         Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
         Math.sin(dLon / 2) * Math.sin(dLon / 2)
         ;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c * 1000; // Distance in mts
      resolve(d);
    });
  }

  deg2rad( deg ) {
    return deg * (Math.PI / 180);
  }

}
