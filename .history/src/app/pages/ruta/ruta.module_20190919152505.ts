import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AgmCoreModule } from '@agm/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { RutaPage } from './ruta.page';
import { GastoModalPageModule } from 'src/app/modals/gasto-modal/gasto-modal.module';
import { ProductosModalPageModule } from 'src/app/modals/productos-modal/productos-modal.module';
import { ResumenViajeModalPageModule } from 'src/app/modals/resumen-viaje-modal/resumen-viaje-modal.module';
import { environment } from 'src/environments/environment';
import { PedidosPageModule } from 'src/app/modals/pedidos/pedidos.module';
import { ChatPageModule } from 'src/app/modals/chat/chat.module';


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
  providers: [ BarcodeScanner ],
  declarations: [RutaPage]
})
export class RutaPageModule {}
