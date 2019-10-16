import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { IonicStorageModule } from '@ionic/storage';

import { Badge } from '@ionic-native/badge/ngx';
import { Network } from '@ionic-native/network/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
  ],
  providers: [
    Badge,
    Network,
    DatePipe,
    OneSignal,
    StatusBar,
    Diagnostic,
    Geolocation,
    SplashScreen,
    BackgroundMode,
    LocationAccuracy,
    AndroidPermissions,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
