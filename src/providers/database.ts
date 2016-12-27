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
                this.storage.executeSql("CREATE TABLE IF NOT EXISTS people (id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT, lastname TEXT)", []);
                this.isOpen = true;
            });
        }
    }
 
    public getPeople() {
        return new Promise((resolve, reject) => {
            this.storage.executeSql("SELECT * FROM people", []).then((data) => {
                let people = [];
                if(data.rows.length > 0) {
                    for(let i = 0; i < data.rows.length; i++) {
                        people.push({
                            id: data.rows.item(i).id,
                            firstname: data.rows.item(i).firstname,
                            lastname: data.rows.item(i).lastname
                        });
                    }
                }
                resolve(people);
            }, (error) => {
                reject(error);
            });
        });
    }
 
    public createPerson(firstname: string, lastname: string) {
        return new Promise((resolve, reject) => {
            this.storage.executeSql("INSERT INTO people (firstname, lastname) VALUES (?, ?)", [firstname, lastname]).then((data) => {
                resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }

    public deletePerson() {
        return new Promise((resolve, reject) => {
            this.storage.executeSql("DELETE FROM people", []).then((data) => {
                resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    }
 
}
