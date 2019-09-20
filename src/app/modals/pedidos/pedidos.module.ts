import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PedidosPage } from './pedidos.page';
import { ChatPageModule } from '../chat/chat.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageModule,
  ],
  declarations: [PedidosPage],
  entryComponents: [PedidosPage]
})
export class PedidosPageModule {}
