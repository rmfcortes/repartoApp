import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductosModalPage } from './productos-modal.page';
import { ChatPageModule } from '../chat/chat.module';
import { CallNumber } from '@ionic-native/call-number/ngx';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageModule,
  ],
  providers: [CallNumber],
  declarations: [ProductosModalPage ],
  entryComponents: [ProductosModalPage],
})
export class ProductosModalPageModule {}
