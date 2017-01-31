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
      this.storage = new SQLite();
    }

    /*
    Método que abre la base de datos
     */
    public openDatabase(){
      return this.storage.openDatabase({
        name: 'data.db',
        location: 'default' // the location field is required
      }).then(() => {
        this.isOpen = true;
      });
    }

    /*
    Método que crea las tablas necesarias para la app
     */
    public createTables(){
      this.createEventTable().then((result) => {
      }, (error) => {
          alert("ERROR: " +  JSON.stringify(error));
          console.log("ERROR: ", error);
      });

      this.createAppInfoTable().then((result) => {   
      }, (error) => {
          alert("ERROR: " +  JSON.stringify(error));
          console.log("ERROR: ", error);
      });
    }

    /*
    Método que comprueba el estado de la tabla eventos
     */
    public checkEventsState(){
      return new Promise((resolve, reject) => {
          this.storage.executeSql("SELECT count(*) AS cuenta FROM events", []).then((data) => {
              let numRows = data.rows.item(0).cuenta;
              resolve(numRows);
          }, (error) => {
              console.error('Unable to obtain info from the database: ', error);
              reject(error);
          })
      })
    }

    // Método que decide si actualizar o no los eventos en base a estos conceptos.
    // Si es la primera vez que ejecutamos la aplicación, las tablas ya están cradas.
    // Si la tabla eventos está vacía, es la primara vez que ejecutamos la app, y la rellenamos con los eventos.
    // Si no está vacía comprobamos si hay que actualizar los eventos. Los eventos se actualizan diariamente.
    public updateEvents(result){
      if (result < 1) { 
        //Al hacer el return estamos devolviendo la Promise que nos devuelve la cadena de funciones asíncronas
        return this.insertLastUpdate().then(() => this.getXLSRequest())
      } else {
        //alert('Entrando else');
        return this.checklastUpdate()
      }
    }

    /*
    Función que comprueba si la aplicación debe actualizarse o no.
    La aplicación se actualiza todos los días cuando se entra en ella.
    Si se debe actualizar llamamos a getXLSRequest para actualizar los eventos de la base de datos.
     */
    public checklastUpdate(){
      return new Promise((resolve, reject) => {
        var currentDate = this.getCurrentDate();
        this.getInfo().then((result) => {
            var lastupdate = result[0];
            //Se actualizan las tablas si la fecha es mayor a la de la última actualización.
            //Hay que eliminar LAS tablas antes de volver a insertar todos los eventos.
            if (( currentDate.year > lastupdate.year ) ||
               ( currentDate.year == lastupdate.year && currentDate.month > lastupdate.month ) ||
               ( currentDate.year == lastupdate.year && currentDate.month == lastupdate.month && currentDate.day > lastupdate.day )){ //quitar iguAl
               this.updateNeeded().then((result) => resolve(result));
            } else resolve('No update needed');
        }, (error) => {
            reject(error);
            console.log("Error Checklastupdate: ", error);
        })
      })
    }

    /*
    Función que actualiza las tablas si es necesario actualizarlas
     */
    public updateNeeded(){
      return new Promise((resolve, reject) => {
        alert('Hay que actualizar');
        this.delete().then(() =>
        this.insertLastUpdate()).then(() =>
        this.getXLSRequest()).then((result) => resolve(result));
      });
    }

    /*
    Función que carga el xls de la url, lo parsea e inserta los datos en la base de datos guardando la fecha de actualización
    en la tabla infoapp
     */
    public getXLSRequest(){
      return new Promise((resolve, reject) => {
        var url = 'http://datos.madrid.es/egob/catalogo/209505-0-medialab-eventos.xls';
        var oReq = new XMLHttpRequest();
        var workbook: any;
        var currentDate = this.getCurrentDate();

        oReq.open("GET", url, true);

        oReq.responseType = "arraybuffer";

        oReq.onload = (e) => {
          if (oReq.status >= 200 && oReq.status < 300) {
            
            var arraybuffer = oReq.response;

            /* convert data to binary string */
            var data = new Uint8Array(arraybuffer);
            var arr = new Array();
            for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");
          
            workbook = XLSX.read(bstr, {type:"binary"});

            var worksheetname = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[worksheetname];
            var rowNum;

            for(rowNum = 1; rowNum < worksheet['!range'].e.r; rowNum++){
              //Inserción de la fila en la base de datos si la fecha del evento es mayor o igual que la del dia del dispositivo
              var day = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 6})].v;
              var month = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 7})].v;
              var year = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 8})].v;
              var place = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 2})].v;
              var pagurl = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 3})].v;
              var title = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 4})].v;
              var description = worksheet[XLSX.utils.encode_cell({r: rowNum, c: 5})].v;
              var d = year + "-" + month + "-" + day;

              if (( currentDate.year < year ) ||
                ( currentDate.year == year && currentDate.month < month) || 
                ( currentDate.year == year && currentDate.month == month && currentDate.day <= day )){
                  this.insert(title, description, place, pagurl, ' ', d ).then((result) => {
                  }, (error) => {
                      console.log("Error al insertar del getXLSRequest: ", error);
                      alert("Error al insertar del getXLSRequest: " + JSON.stringify(error));
                  });
              }
            }
            resolve('Finished inserting XLS data');
          } else {
            reject(console.log('XMLHttpRequest failed; error code:' + oReq.statusText));
          }
        }

        oReq.onerror = (e) => {
          reject(console.log('XMLHttpRequest failed; error code:' + oReq.statusText));
        }

        oReq.send();

      });
    }


    /*
    Método que inserta en la tabla appinfo el día de la última actualización de los eventos
     */
    public insertLastUpdate(){
      return new Promise((resolve, reject) => {
        var currentDate = this.getCurrentDate();
        this.insertInfo(currentDate.year, + currentDate.month, currentDate.day).then((result) => {
          resolve(result);
        }, (error) => {
          console.log("Error insertLastUpdate: ", error);
          reject(error);
        });
      });
    }


    /*
    Método para borrar la tabla events
     */
    public dropE(){
      return new Promise((resolve, reject) => {
        this.storage.executeSql("DROP TABLE events", []).then((data) => {
          resolve(data);
        }, (error) => {
          reject(error);
          console.error('Unable to execute sql: ', error);
        }); 
      });
    }

    /*
    Método para borrar la tabla appinfo
     */
    public dropAPPI(){
      return new Promise((resolve, reject) => {
        this.storage.executeSql("DROP TABLE appinfo", []).then((data) => {
            resolve(data);
        }, (error) => {
            reject(error);
            console.error('Unable to execute sql: ', error);
        }); 
      });
    }

    /*
    Método que crea la tabla de eventos
     */
    public createEventTable(){
      return new Promise((resolve, reject) => {
        this.storage.executeSql("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, place TEXT, pagurl TEXT, etype TEXT, d DATE)", []).then((data) => {
            console.log("Table created: ", data);
            resolve(data);
        }, (error) => {
            reject(error);
            console.error('Unable to execute sql: ', error);
        });  
      });
    }

    /*
    Método que crea la tabla de información para la aplicación e inserta la fecha actual para llevar el control
    de cuándo se ha actualizado el XLS por última vez
     */
    public createAppInfoTable(){
      return new Promise((resolve, reject) => {
        this.storage.executeSql("CREATE TABLE IF NOT EXISTS appinfo (id INTEGER PRIMARY KEY AUTOINCREMENT, year INTEGER, month INTEGER, day INTEGER)", []).then((data) => {
            console.log("Table created: ", data);
            resolve(data);
        }, (error) => {
            reject(error);
            console.error('Unable to execute sql: ', error);
        });
      });
    }

    /*
    Método que inserta una fila en la tabla appinfo
     */
    public insertInfo(y: number, m: number, d: number){
      return new Promise((resolve, reject) => {
          this.storage.executeSql("INSERT INTO appinfo (year, month, day) VALUES (?, ?, ?)", [y, m, d]).then((data) => {
              resolve(data);
          }, (error) => {
              alert('Fallo al insertar :' + JSON.stringify(error));
              console.error('Unable to insert in the database: ', error);
              reject(error);
          });
      });  
    }

    /*
    Método que devuelve las últimas fechas de carga del xls
     */
    public getInfo() {
      return new Promise((resolve, reject) => {
          this.storage.executeSql("SELECT year, month, day FROM appinfo ORDER BY id DESC LIMIT 1", []).then((data) => {
              let lup = [];
              lup.push({
                year: data.rows.item(0).year,
                month: data.rows.item(0).month,
                day: data.rows.item(0).day
              });
              resolve(lup);
          }, (error) => {
              console.error('Unable to obtain info from the database: ', error);
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
              console.error('Unable to insert into the database: ', error);
              reject(error);
          });
      });
    }

    /*
    Método que devuelve todos los datos de la tabla de eventos
     */
    public getAll() {
        return new Promise((resolve, reject) => {
            this.storage.executeSql("SELECT * FROM events ORDER BY d", []).then((data) => {
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
                alert("Fallo en getAll :" + JSON.stringify(error));
                console.error('Unable to delete from the database: ', error);
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

    /*
    Método que devuelve la fecha actual
     */
    public getCurrentDate(){
      let date = new Date(Date.now());
      var currentdate = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
      return currentdate;
    }
   
}
