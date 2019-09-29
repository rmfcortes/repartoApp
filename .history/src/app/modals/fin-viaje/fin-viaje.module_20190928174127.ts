import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinViajePage } from './fin-viaje.page';
import { ResumenViajeModalPageModule } from '../resumen-viaje-modal/resumen-viaje-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResumenViajeModalPageModule,
  ],
  declarations: [FinViajePage],
  entryComponents: [FinViajePage]
})
export class FinViajePageModule {}
