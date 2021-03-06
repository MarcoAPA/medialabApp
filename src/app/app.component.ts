import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

/* Añadimos la DB para poder usarla de forma global en la aplicación */
import { Database } from "../providers/database";

import { Events } from '../pages/events/events';
import { Maps } from '../pages/maps/maps';
import { About } from '../pages/about/about';


@Component({
  templateUrl: 'app.html',
  providers: [Database]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = Events;
  activePage: any;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public database: Database) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Eventos', component: Events },
      { title: 'Cómo llegar', component: Maps },
      { title: 'Acerca de', component: About }
    ];

    this.activePage = this.pages[0];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
    this.activePage = page;
  }

  checkActive(page){
    return page == this.activePage;
  }

}
