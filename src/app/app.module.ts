import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Page1 } from '../pages/page1/page1';
import { Page2 } from '../pages/page2/page2';
import { About } from '../pages/about/about';

import { Database } from "../providers/database";
import { ConnectivityService } from '../providers/connectivity-service'; /* Nos va a permitir ver si el usuario tiene o no conexión de Internet */ 

@NgModule({
  declarations: [
    MyApp,
    Page1,
    Page2,
    About
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Page1,
    Page2,
    About
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, Database, ConnectivityService]
})
export class AppModule {}
