import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';

import { ProductosModalPage } from './productos-modal.page';
import { ChatPageModule } from '../chat/chat.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageModule,
  ],
  providers: [CallNumber, BarcodeScanner],
  declarations: [ProductosModalPage ],
  entryComponents: [ProductosModalPage],
})
export class ProductosModalPageModule {}
