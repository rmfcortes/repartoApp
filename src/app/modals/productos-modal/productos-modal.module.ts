import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductosModalPage } from './productos-modal.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChatPageModule } from '../chat/chat.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ChatPageModule,
  ],
  declarations: [ProductosModalPage ],
  entryComponents: [ProductosModalPage]
})
export class ProductosModalPageModule {}
