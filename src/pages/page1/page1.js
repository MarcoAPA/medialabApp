var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Database } from "../../providers/database";
//import { read, IWorkBook, IWorkSheet } from '@types/xlsx'; //De esta forma no funciona el import
import * as XLSX from 'xlsx';
//import XLSX from 'xlsx/xlsx';
//import { Http } from '@angular/http';
var Page1 = (function () {
    //private wb: any;
    function Page1(navController, database) {
        this.navController = navController;
        this.database = database;
        this.itemList = [];
        this.getXLSRequest();
    }
    Page1.prototype.getXLSRequest = function () {
        var url = 'http://datos.madrid.es/egob/catalogo/209505-0-medialab-eventos.xls';
        var oReq = new XMLHttpRequest();
        var workbook;
        var db = this.database;
        var currentDate;
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";
        oReq.onload = function (e) {
            var arraybuffer = oReq.response;
            /* convert data to binary string */
            var data = new Uint8Array(arraybuffer);
            var arr = new Array();
            for (var i = 0; i != data.length; ++i)
                arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");
            workbook = XLSX.read(bstr, { type: "binary" });
            currentDate = new Date(Date.now());
            alert("dia es : " + JSON.stringify(currentDate.getFullYear()));
            alert("dia es : " + JSON.stringify(currentDate.getFullYear()));
            var worksheetname = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[worksheetname];
            var rowNum;
            for (rowNum = 1; rowNum <= worksheet['!range'].e.r; rowNum++) {
                //Inserción de la fila en la base de datos si la fecha del evento es mayor o igual que la del dia del dispositivo
                var day = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 6 })].v;
                var month = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 7 })].v;
                var year = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 8 })].v;
                //if(){
                var place = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 2 })].v;
                var pagurl = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 3 })].v;
                var title = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 4 })].v;
                var description = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 5 })].v;
                var d = year + "-" + month + "-" + day;
                db.insert(title, description, place, pagurl, ' ', d).then(function (result) {
                }, function (error) {
                    console.log("ERROR: ", error);
                    alert("Error insertar xlsx: " + JSON.stringify(error));
                });
            }
            alert("He acabado de leer");
        };
        oReq.send();
        /*function parseXLSX(){

            var sheet_name_list = this.wb.SheetNames;
            sheet_name_list.forEach(function(y) { // iterate through sheets
                var worksheet = workbook.Sheets[y];
                for (var ws in worksheet) {
                    // all keys that do not begin with "!" correspond to cell addresses
                    if(ws[0] === '!') continue;
                    console.log(y + "!" + ws + "=" + JSON.stringify(worksheet[ws].v));
                    alert(y + "!" + ws + "=" + JSON.stringify(worksheet[ws].v));
                    //this.createEvent(worksheet[ws].v, 'EXCEL');
                }
            });

        }*/
        //if (typeof require !== 'undefined') XLSX = require('xlsx');
        //this.wb = readFile('../../assets/medialab-prado_eventos.xls');
        //alert('valor = ' + this.wb.SheetNames[0]);
    };
    Page1.prototype.load = function () {
        var _this = this;
        this.database.getAll().then(function (result) {
            _this.itemList = result;
        }, function (error) {
            alert("ERROR load :" + JSON.stringify(error));
            console.log("ERROR: ", error);
        });
    };
    Page1.prototype.createEvent = function (title, description /*, place: string, pageurl: string, type: string, d: Date*/) {
        var _this = this;
        //this.database.insert(firstname, lastname, place, pageurl, type, d)
        this.database.insert(title, description, 'lugar de pepe', 'www.place.com', 'taller', '2017-01-12').then(function (result) {
            _this.load();
        }, function (error) {
            console.log("ERROR: ", error);
        });
    };
    Page1.prototype.deleteEvent = function () {
        var _this = this;
        this.database.delete().then(function (result) {
            _this.load();
        }, function (error) {
            alert("ERROR deleteEvent");
            console.log("ERROR: ", error);
        });
    };
    return Page1;
}());
Page1 = __decorate([
    Component({
        selector: 'page-page1',
        templateUrl: 'page1.html'
    }),
    __metadata("design:paramtypes", [NavController, Database])
], Page1);
export { Page1 };
//# sourceMappingURL=page1.js.map