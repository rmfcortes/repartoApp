import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GastoModalPage } from './gasto-modal.page';
import { Camera } from '@ionic-native/camera/ngx';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  providers: [Camera],
  declarations: [GastoModalPage],
  entryComponents: [GastoModalPage]
})
export class GastoModalPageModule {}
