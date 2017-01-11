import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { Database } from "../../providers/database"; 

//import { read, IWorkBook, IWorkSheet } from '@types/xlsx'; //De esta forma no funciona el import
import * as XLSX from 'xlsx';

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

    ionViewDidEnter(){
        this.load();
    }

    private itemList: Array<Object>;

    public constructor(private navController: NavController, public database: Database) {
        this.itemList = [];
        this.getXLSRequest();
        //this.checklastUpdate();
    }

    /*
    Función que comprueba si la aplicación debe actualizarse o no.
    La aplicación se actualiza todos los días cuando se entra en ella.
    Si se debe actualizar llamamos a getXLSRequest para actualizar los eventos de la base de datos.
     */
    public checklastUpdate(){

        let currentdate = this.getCurrentDate();
        this.database.getInfo().then((result) => {
            let lastupdate = <Array<Object>> result;
            alert("lastupdate: " + JSON.stringify(lastupdate));
        }, (error) => {
            alert("ERROR load :" +  JSON.stringify(error));
            console.log("ERROR: ", error);
        });
    }

    public getXLSRequest(){
        
        var url = 'http://datos.madrid.es/egob/catalogo/209505-0-medialab-eventos.xls';
        var oReq = new XMLHttpRequest();
        var workbook: any;
        var db = this.database;
        var currentDate;

        oReq.open("GET", url, true);

        oReq.responseType = "arraybuffer";

        oReq.onload = (e) => {

            var arraybuffer = oReq.response;

            /* convert data to binary string */
            var data = new Uint8Array(arraybuffer);
            var arr = new Array();
            for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");
          
            workbook = XLSX.read(bstr, {type:"binary"});
             
            let currentDate = this.getCurrentDate();

            var worksheetname = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[worksheetname];
            var rowNum;
            for(rowNum = 1; rowNum <= worksheet['!range'].e.r; rowNum++){
                //Inserción de la fila en la base de datos si la fecha del evento es mayor o igual que la del dia del dispositivo
                let day = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 6})].v;
                let month = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 7})].v;
                let year = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 8})].v;
                
                if( currentDate.year <= year && currentDate.month <= month && currentDate.day <= day ){
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

    public getCurrentDate(){
       let date = new Date(Date.now());
       var currentdate = {
           year: date.getFullYear(),
           month: date.getMonth(),
           day: date.getDate()
       };
       return currentdate;
    }

}
