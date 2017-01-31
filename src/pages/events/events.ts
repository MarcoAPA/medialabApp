import { Component } from '@angular/core';

import { NavController, LoadingController } from 'ionic-angular';

import { Database } from "../../providers/database"; 


@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})

/*
    We start by importing the database from providers.  
    The constructor method is where we inject the database provider for use in other functions and it is where we initialize the public variable.
    It is not a good idea to load data in the constructor method.  
    Instead we’re going to load the data from the ionViewDidLoad method.  
    This method will call the load method which will call the getAll method from the database provider.  
    Notice how we don’t use any SQL here or any data parsing.  Welcome to the magic of adding functionality to providers.
 */

export class Events {

    ionViewDidLoad(){

        // Create the loading popup
        this.loading = this.loadingCtrl.create({
          spinner: 'bubbles',
          content: 'Cargando eventos...'
        });

        // Show the loading popup
        this.loading.present();

        this.loadEvents();

        // Dismiss the loading popup because data is ready
        this.loading.dismiss();
    }

    private eventList: Array<Object>;
    private loading;

    public constructor(private navController: NavController, public database: Database, private loadingCtrl: LoadingController) {
        this.eventList = [];
    }
 
    public loadEvents() {          
        this.database.getAll().then((result) => {
           this.eventList = <Array<Object>> result;
        }, (error) => {
            alert("ERROR load :" +  JSON.stringify(error));
            console.log("Error Loading Events: ", error);
        });
    }

}
