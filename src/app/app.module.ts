import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule,  MAT_DATE_LOCALE } from '@angular/material/core';
import { PartialLayoutComponent } from './partial/partial-layout/partial-layout.component';
import { FooterComponent } from './partial/partial-layout/footer/footer.component';
import { HeaderComponent } from './partial/partial-layout/header/header.component';
import { SidebarComponent } from './partial/partial-layout/sidebar/sidebar.component';
import { MaterialModule } from './shared/angularMaterialModule/material.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AccessDenideComponent } from './error/access-denide/access-denide.component';
import { PageNotFoundComponent } from './error/page-not-found/page-not-found.component';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationComponent } from './dialogs/confirmation/confirmation.component';
import { ModalsComponent } from './dialogs/driver_modals/modals.component';
import { AddUpdateUserComponent } from './partial/user-management-system/add-update-user/add-update-user.component';
import { MakePaymentComponent } from './partial/payment/make-payment/make-payment.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [
    AppComponent,
    PartialLayoutComponent,
    FooterComponent,
    HeaderComponent,
    SidebarComponent,
    AccessDenideComponent,
    PageNotFoundComponent,
    ConfirmationComponent,
    ModalsComponent,
    AddUpdateUserComponent,
    MakePaymentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    PerfectScrollbarModule,
    HttpClientModule,
    NgxSpinnerModule,
    NgbModule,
  ], 
  providers: [ {
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  },
  DatePipe, { provide: MAT_DATE_LOCALE, useValue: 'en-GB'}, CurrencyPipe, TitleCasePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
