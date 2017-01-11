import { Component } from '@angular/core';

import { NavController, LoadingController } from 'ionic-angular';

import { Database } from "../../providers/database"; 


@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})

/*
    We start by importing the database from providers.  
    In the HomePage class we define a public variable which will be bound to the page UI. It will contain data from the database.
    The constructor method is where we inject the database provider for use in other functions and it is where we initialize the public variable.
    It is not a good idea to load data in the constructor method.  
    Instead we’re going to load the data from the onPageDidEnter method.  
    This method will call the load method which will call the getAll method from the database provider.  
    Notice how we don’t use any SQL here or any data parsing.  Welcome to the magic of adding functionality to providers.
    Finally there is the create method that will insert new data and then load it once it has been saved.
 */

export class Events {

    /*ionViewDidLoad(){

        // Create the loading popup
        this.loading = this.loadingCtrl.create({
          content: 'Loading...'
        });

        // Show the popup
        this.loading.present();

        this.checklastUpdate();
        this.load();
    }*/

    private itemList: Array<Object>;
    //private loading;

    public constructor(private navController: NavController, public database: Database, private loadingCtrl: LoadingController) {
        this.itemList = [];
    }
 
    public load() {
        this.database.getAll().then((result) => {
                this.itemList = <Array<Object>> result;
        }, (error) => {
            alert("ERROR load :" +  JSON.stringify(error));
            console.log("ERROR: ", error);
        });
    }
 
    public createEvent(title: string, description: string/*, place: string, pageurl: string, type: string, d: Date*/) {
        //this.database.insert(firstname, lastname, place, pageurl, type, d)
        this.database.insert(title, description, 'lugar de pepe', 'www.place.com', 'taller', '2017-01-12').then((result) => {
            this.load();
        }, (error) => {
            console.log("ERROR: ", error);
        });
    }

    public deleteEvent(){
        this.database.delete().then((result) => {
            this.load();
        }, (error) => {
            alert("ERROR deleteEvent");
            console.log("ERROR: ", error);
        });
    }

}
