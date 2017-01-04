import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { Database } from "../../providers/database"; 

@Component({
  selector: 'page-page1',
  templateUrl: 'page1.html'
})

/*
	We start by importing the provider that we had just created.  
	In the HomePage class we define a public variable which will be bound to the page UI. It will contain data from the database.
	
	The constructor method is where we inject the database provider for use in other functions and it is where we initialize the public variable.
	It is not a good idea to load data in the constructor method.  
	Instead we’re going to load the data from the onPageDidEnter method.  
	This method will call the load method which will call the getAll method from the database provider.  
	Notice how we don’t use any SQL here or any data parsing.  Welcome to the magic of adding functionality to providers.
	Finally there is the create method that will insert new data and then load it once it has been saved.
 */

export class Page1 {

    private itemList: Array<Object>;
 
    public constructor(private navController: NavController, public database: Database) {
        this.itemList = [];
    }
 
    public onPageDidEnter() {
        this.load();
    }
 
    public load() {
        this.database.getAll().then((result) => {
            this.itemList = <Array<Object>> result;
        }, (error) => {
        	alert("ERROR load");
            console.log("ERROR: ", error);
        });
    }
 
    public createEvent(title: string, description: string) {
    	//this.database.insert(firstname, lastname, 'lugar de pepe', 'www.place.com', 'taller', '2017-01-12')
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
