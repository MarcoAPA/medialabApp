import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { Database } from "../../providers/database"; 

//import { read, IWorkBook, IWorkSheet } from '@types/xlsx'; //De esta forma no funciona el import
import * as XLSX from 'xlsx';
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
	
	ionVierDidLoad() {
        
	}

	ionViewDidEnter() {
    	this.load();
  	}

    private itemList: Array<Object>;

    public constructor(private navController: NavController, public database: Database) {
        this.itemList = [];
        this.getXLSRequest();
    }
 	
    public getXLSRequest(){
    	
    	var url = 'http://datos.madrid.es/egob/catalogo/209505-0-medialab-eventos.xls';
    	var oReq = new XMLHttpRequest();
    	var workbook: any;
    	var db = this.database;
    	var currentDate;

		oReq.open("GET", url, true);

		oReq.responseType = "arraybuffer";

		oReq.onload = function(e) {

			var arraybuffer = oReq.response;

		  	/* convert data to binary string */
		  	var data = new Uint8Array(arraybuffer);
		  	var arr = new Array();
		  	for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
		  	var bstr = arr.join("");
		  
		 	workbook = XLSX.read(bstr, {type:"binary"});
		 	
		 	currentDate = new Date(Date.now());
			let currentYear = currentDate.getFullYear();
			let currentMonth = currentDate.getMonth()+1;
			let currentDay = currentDate.getDate();

			var worksheetname = workbook.SheetNames[0];
			var worksheet = workbook.Sheets[worksheetname];
			var rowNum;
			for(rowNum = 1; rowNum <= worksheet['!range'].e.r; rowNum++){
				//Inserción de la fila en la base de datos si la fecha del evento es mayor o igual que la del dia del dispositivo
				let day = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 6})].v;
				let month = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 7})].v;
				let year = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 8})].v;
				
				if( currentYear <= year && currentMonth <= month && currentDay <= day ){
					let place = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 2})].v;
					let pagurl = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 3})].v;
					let title = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 4})].v;
					let description = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 5})].v;
					let d = year + "-" + month + "-" + day;

					db.insert(title, description, place, pagurl, ' ', d ).then((result) => {
			        }, (error) => {
			            console.log("ERROR: ", error);
			            alert("Error insertar xlsx: " + JSON.stringify(error));
			        });
			    }
			}
		}

		oReq.send();

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
