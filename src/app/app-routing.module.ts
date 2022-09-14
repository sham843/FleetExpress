import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebLayoutComponent } from './web/web-layout/web-layout.component';
import { PartialLayoutComponent } from './partial/partial-layout/partial-layout.component';
import { LoginAuthGuard } from './auth/login-auth.guard';
import { LoggedInAuthGuard } from './auth/logged-in-auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    component: WebLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./web/web-layout/web-layout.module').then(m => m.WebLayoutModule)},
      {path:'login',loadChildren:()=>import('./web/login/login.module').then(m=>m.LoginModule) ,canActivate:[LoggedInAuthGuard]},
      {path:'forget-password',loadChildren:()=>import('./web/forget-password/forget-password.module').then(m=>m.ForgetPasswordModule) ,canActivate:[LoggedInAuthGuard]}
        ]
  },
  {
    path: '',
    canActivate:[LoginAuthGuard],
    component: PartialLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./partial/partial-layout/partial-layout.module').then(m => m.PartialLayoutModule), data: { title: 'Login' } },
    ]
  },
  { path: 'forget-password', loadChildren: () => import('./web/forget-password/forget-password.module').then(m => m.ForgetPasswordModule), data: { title: 'Forget Password' }, },
  
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
