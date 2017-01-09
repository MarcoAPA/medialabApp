import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { Database } from "../../providers/database"; 

import { readFile, IWorkBook, IWorkSheet } from '@types/xlsx';
//import XLSX from 'xlsx/xlsx';
//import { Http } from '@angular/http';

@Component({
  selector: 'page-page1',
  templateUrl: 'page1.html'
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

export class Page1 {

    private itemList: Array<Object>;
    private wb: IWorkBook;

    public constructor(private navController: NavController, public database: Database) {
        this.itemList = [];
        this.getXLSRequest();
    }
 	
    public getXLSRequest(){
    	
    	var url = 'http://datos.madrid.es/egob/catalogo/209505-0-medialab-eventos.xls';
    	//var XLSX: any;
 		
 		/*turn new Promise(resolve => {
	      // We're using Angular Http provider to request the data,
	      // then on the response it'll map the JSON data to a parsed JS object.
	      // Next we process the data and resolve the promise with the new data.
	      this.Http.get(url)
	        .subscribe( data => {
	          console.log( 'Raw Data', data );
	          alert('data' + JSON.stringify(data));
	          resolve(data);
	        });
	    });*/

	    alert(url);
    	//if (typeof require !== 'undefined') XLSX = require('xlsx');
		this.wb = readFile('../../assets/medialab-prado_eventos.xls');
		//alert('valor = ' + this.wb.SheetNames[0]);
    } 

    public parseXLSX(){

    	var sheet_name_list = this.wb.SheetNames;
		sheet_name_list.forEach(function(y) { /* iterate through sheets */
		  var worksheet = this.wb.Sheets[y];
		  for (var ws in worksheet) {
		    /* all keys that do not begin with "!" correspond to cell addresses */
		    if(ws[0] === '!') continue;
		    console.log(y + "!" + ws + "=" + JSON.stringify(worksheet[ws].v));
		    //this.createEvent(' ', ' ');
		  }
		  alert(y + "!" + ws + "=" + JSON.stringify(worksheet[ws].v));
		});

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
