import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './_components/login/login.component';
import { HomepageComponent } from './_components/homepage/homepage.component';
import { HomepageAdminComponent } from './_components/homepage-admin/homepage-admin.component';
import { BarchartComponent } from './_components/barchart/barchart.component';
import { SocketioService } from './socketio.service';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomepageComponent,
    HomepageAdminComponent,
    BarchartComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    ChartsModule
  ],
  providers: [SocketioService],
  bootstrap: [AppComponent]
})
export class AppModule { }
