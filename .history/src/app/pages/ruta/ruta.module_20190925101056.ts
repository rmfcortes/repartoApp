import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RutaPage } from './ruta.page';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { GastoModalPageModule } from 'src/app/modals/gasto-modal/gasto-modal.module';
import { ProductosModalPageModule } from 'src/app/modals/productos-modal/productos-modal.module';
import { ResumenViajeModalPageModule } from 'src/app/modals/resumen-viaje-modal/resumen-viaje-modal.module';
import { MapaPageModule } from 'src/app/modals/mapa/mapa.module';
import { ChatPageModule } from 'src/app/modals/chat/chat.module';
import { SharedModule } from 'src/app/shared/shared.module';

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
    SharedModule,
    MapaPageModule,
    ChatPageModule,
    GastoModalPageModule,
    ProductosModalPageModule,
    ResumenViajeModalPageModule,

    RouterModule.forChild(routes)
  ],
  providers: [
    BarcodeScanner,
    SocialSharing
  ],
  declarations: [RutaPage]
})
export class RutaPageModule {}
