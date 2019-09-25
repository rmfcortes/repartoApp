import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: 'inicio',
        loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'login',
        loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
      },
      {
        path: 'ruta',
        loadChildren: () => import('./pages/ruta/ruta.module').then( m => m.RutaPageModule),
        canActivate: [AuthGuard]
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
