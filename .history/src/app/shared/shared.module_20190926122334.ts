import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { PreloadImageComponent } from '../components/pre-load-image/pre-load-image.component';


@NgModule({
  imports: [
    IonicModule,
    CommonModule
  ],
    declarations: [ PreloadImageComponent ],
    exports: [ PreloadImageComponent ]
  })

  export class SharedModule {}
