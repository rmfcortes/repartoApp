import { Injectable, NgZone } from '@angular/core';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation/ngx';

import { BehaviorSubject, Subscription } from 'rxjs';

import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';
import { DatePipe } from '@angular/common';
import { GeoFire } from 'geofire';
import { ToastController, Platform } from '@ionic/angular';
import { VentaService } from './venta.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {

  public ubicacion = new BehaviorSubject({
    lat: 20.622894,
    lng: -103.415830
  });

  uid: string;
  fecha: string;

  geoFire: any;
  viaje: string;

  wathSubscription: Subscription;
  backSubscription: Subscription;
  backInterval: any;
  intervalo = 1000 * 10;

  options: GeolocationOptions = {
    enableHighAccuracy: true,
  };

  lastLoc = {
    lat: null,
    lng: null
  };

  constructor(
    private ngZone: NgZone,
    public platform: Platform,
    private datePipe: DatePipe,
    private db: AngularFireDatabase,
    public geolocation: Geolocation,
    public backgroundMode: BackgroundMode,
    private toastController: ToastController,
    private uidService: UidService,
    private ventaService: VentaService
  ) { }

  async setGeoFireRef() {
    this.uid = this.uidService.getUid();
    await this.getFecha();
    this.viaje = await this.ventaService.getViaje();
    const dbRef = this.db.list(`activos`);
    this.geoFire = new GeoFire(dbRef.query.ref);
  }

  initBackgroundMode() {
    this.platform.ready().then(() => {
      if (this.backSubscription) {
        return;
      }
      this.backgroundMode.setDefaults({silent: true});
      this.backSubscription =  this.backgroundMode.on('activate').subscribe(() => {
        this.ngZone.run(() => {
          this.backgroundMode.disableWebViewOptimizations();
          if (this.backInterval) {
            // Intervalo ya está activo
          } else {
            this.backInterval = setInterval(() => this.getPosition(), this.intervalo);
          }
        });
      });
      this.backgroundMode.enable();
    });
  }

  getPosition(): Promise<Geoposition> {
    return new Promise((resolve, reject) => {
      this.geolocation.getCurrentPosition(this.options)
        .then(async (position: Geoposition) => {
          this.ngZone.run(async () => {
            resolve(position);
            this.comparaLoc(position);
          });
        }).catch(err => {
          this.ngZone.run(() => {
          console.log(err);
          });
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

  async comparaLoc(position: Geoposition) {
    if (position.coords.accuracy > 22) {
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

  async detenerUbicacion() {
    if (this.backSubscription) { this.backSubscription.unsubscribe(); }
    if (this.wathSubscription) { this.wathSubscription.unsubscribe(); }
    clearInterval(this.backInterval);
    this.backgroundMode.setEnabled(false);
    this.uid = this.uidService.getUid();
    await this.db.object(`activos/${this.uid}`).remove();
  }

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
