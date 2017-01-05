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

@Injectable()
export class Database {
 
    private storage: SQLite;
    private isOpen: boolean;
     
    /*
        This constructor method is called every time we inject this provider into a page, 
        but our conditional logic prevents trying to open more than one instance of the database.
     */
    public constructor(public connectivityService: ConnectivityService) {
        if(!this.isOpen) {
            /* Compruebo si estoy en un dispositivo o en un navegador */
            if (connectivityService.onDevice){
                alert('device');
                this.storage = new SQLite();
                this.storage.openDatabase({name: "data.db", location: "default"}).then(() => {
                  this.isOpen = true;
                  this.storage.executeSql("DROP TABLE events", []);
                  this.storage.executeSql("CREATE TABLE events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, place TEXT, pagurl TEXT, etype TEXT, d DATE)", []).then((data) => {
                      console.log("Table created: ", data);
                      //alert('Tabla creada: ' + JSON.stringify(data));
                  }, (err) => {
                    console.error('Unable to execute sql: ', err);
                    //alert('Unable to execute sql: '+ JSON.stringify(err));
                  });
                }, (err) => {
                  console.error('Unable to open database: ', err);
                  //alert('Unable to open database: '+ err);
                });
            }else {
                alert('navegador');

                /*
                Para que funcione la base de datos en el navegador no podemos usar el plugin nativo de SQLite, habría que usar this.storage = new Storage(SqlStorage); para utilizar WebSQL
                (<any>window).plugins.somePlugin.doSomething();
                 */
            }
        }
    }
 
    public getAll() {
        return new Promise((resolve, reject) => {
            this.storage.executeSql("SELECT * FROM events", []).then((data) => {
                let events = [];
                if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {
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
            }, (error) => {
                reject(error);
            });
        });
    }
 
    public insert(title: string, description: string, place: string, pageurl: string, etype: string, d: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.storage.executeSql("INSERT INTO events (title, description, place, pagurl, etype, d) VALUES (?, ?, ?, ?, ?, ?)", [title, description, place, pageurl, etype, d]).then((data) => {
                resolve(data);
            }, (error) => {
                alert('Fallo al insertar :' + JSON.stringify(error));
                console.error('Unable to insert in the database: ', error);
                reject(error);
            });
        });
    }

    public delete() {
        return new Promise((resolve, reject) => {
            this.storage.executeSql("DELETE FROM events", []).then((data) => {
                resolve(data);
            }, (error) => {
                alert("Fallo al borrar :" + JSON.stringify(error));
                console.error('Unable to delete from the database: ', error);
                reject(error);
            });
        });
    }
 
}
