import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import {Database} from "../../providers/database"; 

@Component({
  selector: 'page-page1',
  templateUrl: 'page1.html'
})

/*
	We start by importing the provider that we had just created.  
	In the HomePage class we define a public variable which will be bound to the page UI.  It will contain data from the database.
	The constructor method will do two things.  
	It is where we inject the database provider for use in other functions and it is where we initialize the public variable.
	It is not a good idea to load data in the constructor method.  
	Instead we’re going to load the data from the onPageDidEnter method.  
	This method will call the load method which will call the getPeople method from the database provider.  
	Notice how we don’t use any SQL here or any data parsing.  Welcome to the magic of adding functionality to providers.
	Finally there is the create method that will insert new data and then load it once it has been saved.
 */

export class Page1 {

    public itemList: Array<Object>;
 
    public constructor(private navController: NavController, public database:Database) {
        this.itemList = [];
    }
 
    public onPageDidEnter() {
        this.load();
    }
 
    public load() {
        this.database.getPeople().then((result) => {
            this.itemList = <Array<Object>> result;
        }, (error) => {
            console.log("ERROR: ", error);
        });
    }
 
    public create(firstname: string, lastname: string) {
        this.database.createPerson(firstname, lastname).then((result) => {
            this.load();
        }, (error) => {
            console.log("ERROR: ", error);
        });
    }
    public delete(){
    	this.database.deletePerson().then((result) => {
            this.load();
        }, (error) => {
            console.log("ERROR: ", error);
        });
    }

}
