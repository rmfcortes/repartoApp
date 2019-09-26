import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { PreloadImageComponent } from '../components/pre-load-image/pre-load-image.component';
import { StarsComponent } from '../components/stars/stars.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule
  ],
    declarations: [ PreloadImageComponent, StarsComponent ],
    exports: [ PreloadImageComponent, StarsComponent ]
  })

  export class SharedModule {}
