import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductosModalPage } from './productos-modal.page';
import { ChatPageModule } from '../chat/chat.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageModule,
  ],
  declarations: [ProductosModalPage ],
  entryComponents: [ProductosModalPage]
})
export class ProductosModalPageModule {}
