import { Injectable } from '@angular/core';
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationResponse,
  BackgroundGeolocationEvents
} from '@ionic-native/background-geolocation/ngx';
import { BehaviorSubject } from 'rxjs';

import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';
import { DatePipe } from '@angular/common';
import { GeoFire } from 'geofire';

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

  constructor(
    private datePipe: DatePipe,
    private db: AngularFireDatabase,
    private backgroundGeolocation: BackgroundGeolocation,
    private uidService: UidService,
  ) { }

  setViaje(viaje) {
    this.viaje = viaje;
  }

  async startBackgroundGeolocation() {
    this.uid = this.uidService.getUid();
    await this.getFecha();
    const dbRef = this.db.list(`activos`);
    this.geoFire = new GeoFire(dbRef.query.ref);
    const config: BackgroundGeolocationConfig = {
      locationProvider: 0, // Distance filter
      desiredAccuracy: 0, // High
      stationaryRadius: 12,
      distanceFilter: 12,
      debug: true,
      notificationsEnabled: false,
      stopOnTerminate: false,
      startForeground: true
        // Android only section
    };

    this.backgroundGeolocation.configure(config).then(() => {
      this.backgroundGeolocation
        .on(BackgroundGeolocationEvents.location)
        .subscribe((location: BackgroundGeolocationResponse) => {
          if (location.accuracy > 20) {
            return;
          }
          this.updateLocation(location);
          // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
          // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
          // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        });
    });
    // start recording location
    this.backgroundGeolocation.start();
  }

  async updateLocation(data: BackgroundGeolocationResponse) {
    const coords = {
      lat: data.latitude,
      lng: data.longitude,
    };
    const punto = {
      lat: data.latitude,
      lng: data.longitude,
      speed: data.speed || 0,
      stamp: data.time || 0
    };
    this.ubicacion.next(coords);
    this.geoFire.set(this.uid, [coords.lat, coords.lng]);
    this.db.list(`recorridos/${this.uid}/${this.viaje}/${this.fecha}`).push(punto);
    this.db.object(`carga/${this.uid}/ubicacion`).set(coords);
  }

  async detenerUbicacion() {
    this.uid = this.uidService.getUid();
    this.backgroundGeolocation.stop();
    this.backgroundGeolocation.removeAllListeners();
    await this.db.object(`activos/${this.uid}`).remove();
  }

  getFecha() {
    return new Promise ((resolve, reject) => {
      const date = new Date();
      this.fecha = this.datePipe.transform(date, 'yyyy-MM-dd');
      resolve();
    });
  }

}
