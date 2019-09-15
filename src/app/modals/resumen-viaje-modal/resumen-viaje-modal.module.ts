import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResumenViajeModalPage } from './resumen-viaje-modal.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [ResumenViajeModalPage],
  entryComponents: [ResumenViajeModalPage]
})
export class ResumenViajeModalPageModule {}
