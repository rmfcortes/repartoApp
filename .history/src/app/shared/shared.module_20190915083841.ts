import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PreloadImageComponent } from '../components/pre-load-image/pre-load-image.component';

@NgModule({
    imports: [
      CommonModule,
      IonicModule,
    ],
    declarations: [ PreloadImageComponent ],
    exports: [ PreloadImageComponent ]
  })

  export class SharedModule {}
