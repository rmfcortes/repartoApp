import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPage } from './chat.page';
import { BubblesComponent } from 'src/app/components/bubbles/bubbles.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [ChatPage],
  entryComponents: [ChatPage, BubblesComponent]
})
export class ChatPageModule {}
