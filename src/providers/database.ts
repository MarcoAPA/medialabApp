import { Injectable } from '@angular/core';

/*
Leer https://github.com/litehelpers/Cordova-sqlite-storage para mas información sobre este plugin
 */
import { SQLite } from 'ionic-native'; 

//import 'rxjs/add/operator/map';

/*
Utilizaré el plugin ConnectivityService para saber si estoy accediendo a la app con un dispositivo móvil o un navegador
 */
import { ConnectivityService } from '../providers/connectivity-service';

//import { read, IWorkBook, IWorkSheet } from '@types/xlsx'; //De esta forma no funciona el import
import * as XLSX from 'xlsx';

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
                //alert('device');

                this.storage = new SQLite();
                this.storage.openDatabase({name: "data.db", location: "default"}).then(() => {
                  this.isOpen = true;

                  this.storage.executeSql("DROP TABLE events", []);
                  this.createEventTable();

                  this.storage.executeSql("DROP TABLE appinfo", []);
                  this.createAppInfoTable();

                  this.checklastUpdate();
                  this.getXLSRequest();
                }, (err) => {
                  console.error('Unable to open database: ', err);
                  //alert('Unable to open database: '+ err);
                });
            }else {
              //alert('navegador');
              
              /*
              Para que funcione la base de datos en el navegador no podemos usar el plugin nativo de SQLite, habría que usar this.storage = new Storage(SqlStorage); para utilizar WebSQL
              (<any>window).plugins.somePlugin.doSomething();
              */
            }
        }
    }

    /*
    Función que comprueba si la aplicación debe actualizarse o no.
    La aplicación se actualiza todos los días cuando se entra en ella.
    Si se debe actualizar llamamos a getXLSRequest para actualizar los eventos de la base de datos.
     */
    public checklastUpdate(){
        let currentdate = this.getCurrentDate();
        this.getInfo().then((result) => {
            let lastupdate = result;
            alert("lastupdate: " + JSON.stringify(lastupdate));
        }, (error) => {
            alert("ERROR load :" +  JSON.stringify(error));
            console.log("ERROR: ", error);
        });
    }

    /*
    Función que carga el xls de la url, lo parsea e inserta los datos en la base de datos
     */
    public getXLSRequest(){
        
      var url = 'http://datos.madrid.es/egob/catalogo/209505-0-medialab-eventos.xls';
      var oReq = new XMLHttpRequest();
      var workbook: any;
      //var db = this.storage;
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
           
          currentDate = this.getCurrentDate();

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

                  this.insert(title, description, place, pagurl, ' ', d ).then((result) => {
                  }, (error) => {
                      console.log("ERROR: ", error);
                      alert("Error insertar xlsx: " + JSON.stringify(error));
                  });
              }
          }
      }

      oReq.send();
    }
    
    /*
    Método que crea la tabla de eventos
     */
    public createEventTable(){

      this.storage.executeSql("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, place TEXT, pagurl TEXT, etype TEXT, d DATE)", []).then((data) => {
          console.log("Table created: ", data);
          alert('Tabla creada events: ' + JSON.stringify(data));
      }, (err) => {
        console.error('Unable to execute sql: ', err);
        //alert('Unable to execute sql: '+ JSON.stringify(err));
      });  

    }

    /*
    Método que crea la tabla de eventos
     */
    public createAppInfoTable(){

      this.storage.executeSql("CREATE TABLE IF NOT EXISTS appinfo (id INTEGER PRIMARY KEY AUTOINCREMENT, lastupdate DATE)", []).then((data2) => {
          let date = new Date(Date.now());
          var currentdate = {
              year: date.getFullYear(),
              month: date.getMonth(),
              day: date.getDate()
          };
          this.insertInfo(currentdate.year + "-" + currentdate.month + "-" + currentdate.day);
          console.log("Table created: ", data2);
          alert('Tabla creada appInfo: ' + JSON.stringify(data2));
      }, (err) => {
        console.error('Unable to execute sql: ', err);
        alert('Unable to execute sql: '+ JSON.stringify(err));
      });

    }

    /*
    Método que inserta una fila en la tabla appinfo
     */
    public insertInfo(d: string){
      return new Promise((resolve, reject) => {
          this.storage.executeSql("INSERT INTO appinfo (lastupdate) VALUES (?)", [d]).then((data) => {
              resolve(data);
          }, (error) => {
              alert('Fallo al insertar :' + JSON.stringify(error));
              console.error('Unable to insert in the database: ', error);
              reject(error);
          });
      });  
    }

    /*
    Métodos que devuelve las últimas fechas de acceso al xls
     */
    public getInfo() {
        return new Promise((resolve, reject) => {
            this.storage.executeSql("SELECT lastupdate FROM appinfo", []).then((data) => {
              let lup = data.rows.item(0).lastupdate;
              resolve(lup);
            }, (error) => {
                alert('Fallo al obtener info :' + JSON.stringify(error));
                console.error('Unable to obtain info from the database: ', error);
                reject(error);
            });
        });
    }

    /*
    Método que devuelve todos los datos de la tabla de eventos
     */
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

    /*
    Método que inserta una fila en la tabla eventos
     */
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

    /*
    Método que borra las filas de la tabla eventos
     */
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
