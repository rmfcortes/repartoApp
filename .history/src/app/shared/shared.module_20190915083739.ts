import { NgModule } from '@angular/core';

import { PreloadImageComponent } from 'src/app/components/pre-load-image/pre-load-image.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@NgModule({
    imports: [
      CommonModule,
      IonicModule,
    ],
    declarations: [ PreloadImageComponent ],
    exports: [ PreloadImageComponent ]
  })

  export class SharedModule {}
