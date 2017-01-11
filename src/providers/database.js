var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
//import { Http } from '@angular/http';
/*
Leer https://github.com/litehelpers/Cordova-sqlite-storage para mas información sobre este plugin
 */
import { SQLite } from 'ionic-native';
//import 'rxjs/add/operator/map';
/*
Utilizaré el plugin ConnectivityService para saber si estoy accediendo a la app con un dispositivo móvil o un navegador
 */
import { ConnectivityService } from '../providers/connectivity-service';
/*
  Generated class for the Database provider.

  Since we’re using SQLite we can use of Ionic Native to make it a bit more Angular 2 friendly.
  We import the Ionic Native components along with the Injectable component so we can inject it in our pages and providers list.
  In the Database class we create a private variable for keeping track of our storage solution.
  In the constructor method we initialize the storage solution and create a new database table only if it doesn’t already exist.
  This constructor method is called every time we inject this provider into a page, but our conditional logic prevents trying to open more than one instance of the database.
  Finally we have two functions, a getPeople function and a createPerson function.  The function for retrieving data will return a promise.
  The success response of the promise will be an array because we are transforming the SQLite results to an array of objects.  The function for creating data will take two strings and return a row id.
*/
var Database = (function () {
    /*
        This constructor method is called every time we inject this provider into a page,
        but our conditional logic prevents trying to open more than one instance of the database.
     */
    function Database(connectivityService) {
        var _this = this;
        this.connectivityService = connectivityService;
        if (!this.isOpen) {
            /* Compruebo si estoy en un dispositivo o en un navegador */
            if (connectivityService.onDevice) {
                //alert('device');
                this.storage = new SQLite();
                this.storage.openDatabase({ name: "data.db", location: "default" }).then(function () {
                    _this.isOpen = true;
                    _this.storage.executeSql("DROP TABLE events", []);
                    _this.storage.executeSql("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, place TEXT, pagurl TEXT, etype TEXT, d DATE)", []).then(function (data) {
                        console.log("Table created: ", data);
                        //alert('Tabla creada: ' + JSON.stringify(data));
                    }, function (err) {
                        console.error('Unable to execute sql: ', err);
                        //alert('Unable to execute sql: '+ JSON.stringify(err));
                    });
                }, function (err) {
                    console.error('Unable to open database: ', err);
                    //alert('Unable to open database: '+ err);
                });
            }
            else {
            }
        }
    }
    /*
    Falta contemplar que no devuelva ningun elemento porque la tabla está vacía
     */
    Database.prototype.getAll = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.storage.executeSql("SELECT * FROM events", []).then(function (data) {
                var events = [];
                if (data.rows.length > 0) {
                    for (var i = 0; i < data.rows.length; i++) {
                        events.push({
                            id: data.rows.item(i).id,
                            title: data.rows.item(i).title,
                            description: data.rows.item(i).description,
                            place: data.rows.item(i).place,
                            pagurl: data.rows.item(i).pagurl,
                            etype: data.rows.item(i).etype,
                            d: data.rows.item(i).d
                        });
                    }
                }
                resolve(events);
            }, function (error) {
                alert("Fallo en getAll :" + JSON.stringify(error));
                reject(error);
            });
        });
    };
    Database.prototype.insert = function (title, description, place, pageurl, etype, d) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.storage.executeSql("INSERT INTO events (title, description, place, pagurl, etype, d) VALUES (?, ?, ?, ?, ?, ?)", [title, description, place, pageurl, etype, d]).then(function (data) {
                resolve(data);
            }, function (error) {
                alert('Fallo al insertar :' + JSON.stringify(error));
                console.error('Unable to insert in the database: ', error);
                reject(error);
            });
        });
    };
    Database.prototype.delete = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.storage.executeSql("DELETE FROM events", []).then(function (data) {
                resolve(data);
            }, function (error) {
                alert("Fallo al borrar :" + JSON.stringify(error));
                console.error('Unable to delete from the database: ', error);
                reject(error);
            });
        });
    };
    return Database;
}());
Database = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConnectivityService])
], Database);
export { Database };
//# sourceMappingURL=database.js.map