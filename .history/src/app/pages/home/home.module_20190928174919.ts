import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { PreloadImageComponent } from 'src/app/components/pre-load-image/pre-load-image.component';

import { HomePage } from './home.page';
import { CierrePageModule } from 'src/app/modals/cierre/cierre.module';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CierrePageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [HomePage, PreloadImageComponent]
})
export class HomePageModule {}
