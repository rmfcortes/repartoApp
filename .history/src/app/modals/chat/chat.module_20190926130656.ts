import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPage } from './chat.page';
import { BubblesComponent } from 'src/app/components/bubbles/bubbles.component';
import { AutosizeModule } from 'ngx-autosize';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AutosizeModule,
  ],
  declarations: [ChatPage, BubblesComponent],
  entryComponents: [ChatPage]
})
export class ChatPageModule {}
