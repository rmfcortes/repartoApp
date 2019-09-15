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
    GastoModalPageModule,
    ResumenViajeModalPageModule,
    ProductosModalPageModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBFJ19-ZZzdW8ftMiMJcgf4eoaBCoCEsS0',
      libraries: ['places']
    }),
    RouterModule.forChild(routes)
  ],
  providers: [ BarcodeScanner ],
  declarations: [RutaPage]
})
export class RutaPageModule {}
