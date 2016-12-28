import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { SQLite } from 'ionic-native';
import 'rxjs/add/operator/map';

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
 
    public constructor() {
        if(!this.isOpen) {
            this.storage = new SQLite();
            this.storage.openDatabase({name: "data.db", location: "default"}).then(() => {
              this.storage.executeSql("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, url TEXT, place TEXT)", {}).then(() => {
              }, (err) => {
                console.error('Unable to execute sql: ', err);
                alert('Unable to execute sql: '+ err);
              });
              this.isOpen = true;
            }, (err) => {
              console.error('Unable to open database: ', err);
              alert('Unable to open database: '+ err);
            });
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
                            url: data.rows.item(i).url,
                            place: data.rows.item(i).place
                            //fecha: data.rows.item(i).fecha
                        });
                    }
                }
                resolve(events);
            }, (error) => {
                alert("ERROR GETALL");
                reject(error);
            });
        });
    }
 
    public insert(title: string, description: string, url: string, place: string) {
        return new Promise((resolve, reject) => {
            this.storage.executeSql("INSERT INTO events (title, description, url, place) VALUES (?, ?, ?, ?)", ["Pepe1", "Pepe Gaylor", "a1", "a2"]).then((data) => {
                resolve(data);
            }, (error) => {
                alert("ERROR INSERT1 " + error);
                reject(error);
            });
            /*this.storage.executeSql("INSERT INTO events (title, description, url, place) VALUES (?, ?, ?, ?)", [title, description, url, place]).then((data) => {
                resolve(data);
            }, (error) => {
                alert("ERROR INSERT2");
                reject(error);
            });*/
        });

    }

    public delete() {
        return new Promise((resolve, reject) => {
            this.storage.executeSql("DELETE FROM events", []).then((data) => {
                resolve(data);
            }, (error) => {
                alert("ERROR DELETE");
                reject(error);
            });
        });
    }
 
}
