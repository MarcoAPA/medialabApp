import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Events } from '../pages/events/events';
import { Maps } from '../pages/maps/maps';
import { About } from '../pages/about/about';

import { Database } from "../providers/database";
import { ConnectivityService } from '../providers/connectivity-service'; /* Nos va a permitir ver si el usuario tiene o no conexión de Internet */ 
import { DetailsPage } from '../pages/details/details';
@NgModule({
  declarations: [
    MyApp,
    Events,
    Maps,
    About,
	DetailsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Events,
    Maps,
    About,
	DetailsPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, Database, ConnectivityService]
})
export class AppModule {}
