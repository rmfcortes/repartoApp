import { NgModule } from '@angular/core';

import { PreloadImageComponent } from '../components/pre-load-image/pre-load-image.component';
import { StarsComponent } from '../components/stars/stars.component';

@NgModule({
    declarations: [ PreloadImageComponent, StarsComponent ],
    exports: [ PreloadImageComponent, StarsComponent ]
  })

  export class SharedModule {}
