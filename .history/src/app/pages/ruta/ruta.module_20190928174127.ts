import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RutaPage } from './ruta.page';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { StarsComponent } from 'src/app/components/stars/stars.component';

import { MapaPageModule } from 'src/app/modals/mapa/mapa.module';
import { FinViajePageModule } from 'src/app/modals/fin-viaje/fin-viaje.module';
import { GastoModalPageModule } from 'src/app/modals/gasto-modal/gasto-modal.module';
import { ProductosModalPageModule } from 'src/app/modals/productos-modal/productos-modal.module';

const routes: Routes = [
  {
    path: '',
    component: RutaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapaPageModule,
    FinViajePageModule,
    GastoModalPageModule,
    ProductosModalPageModule,

    RouterModule.forChild(routes)
  ],
  providers: [
    BarcodeScanner,
    SocialSharing
  ],
  declarations: [RutaPage, StarsComponent]
})
export class RutaPageModule {}
