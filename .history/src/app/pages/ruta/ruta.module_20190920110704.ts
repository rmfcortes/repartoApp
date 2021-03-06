import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RutaPage } from './ruta.page';

import { AgmCoreModule } from '@agm/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { ChatPageModule } from 'src/app/modals/chat/chat.module';
import { GastoModalPageModule } from 'src/app/modals/gasto-modal/gasto-modal.module';
import { ProductosModalPageModule } from 'src/app/modals/productos-modal/productos-modal.module';
import { ResumenViajeModalPageModule } from 'src/app/modals/resumen-viaje-modal/resumen-viaje-modal.module';
import { PedidosPageModule } from 'src/app/modals/pedidos/pedidos.module';

import { environment } from 'src/environments/environment';

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
    PedidosPageModule,
    GastoModalPageModule,
    ProductosModalPageModule,
    ResumenViajeModalPageModule,
    AgmCoreModule.forRoot({
      apiKey: environment.mapsApiKey,
      libraries: ['places'],
    }),
    RouterModule.forChild(routes)
  ],
  providers: [
    BarcodeScanner,
    SocialSharing
  ],
  declarations: [RutaPage]
})
export class RutaPageModule {}
