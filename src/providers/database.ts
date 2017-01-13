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

                //this.initializeDB();

                this.dropE().then((result) => {
                    //alert("events borrada");   
                }, (error) => {
                    alert("ERROR load :" +  JSON.stringify(error));
                    console.log("ERROR: ", error);
                });

                this.dropAPPI().then((result) => {
                    //alert("appinfo borrada");   
                }, (error) => {
                    alert("ERROR load :" +  JSON.stringify(error));
                    console.log("ERROR: ", error);
                });

                this.createEventTable().then((result) => {
                    //alert("events creada bd events");   
                }, (error) => {
                    alert("ERROR load :" +  JSON.stringify(error));
                    console.log("ERROR: ", error);
                });

                this.createAppInfoTable().then((result) => {
                    //alert("events creada bd appinfo");    
                }, (error) => {
                    alert("ERROR load :" +  JSON.stringify(error));
                    console.log("ERROR: ", error);
                });

                /*this.checklastUpdate().then((result) => {
                    alert("comprobar lastupdate :" + JSON.stringify(result));   
                }, (error) => {
                    alert("ERROR load :" +  JSON.stringify(error));
                    console.log("ERROR: ", error);
                });*/

                this.getXLSRequest();/*.then((result) => {
                    alert("cargados eventos");   
                }, (error) => {
                    alert("ERROR load :" +  JSON.stringify(error));
                    console.log("ERROR: ", error);
                });*/

              }, (error) => {
                console.error('Unable to open database: ', error);
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
    Inicializa la base de datos
     */
    /*public initializeDB(){
      Promise.all([
         this.dropE(),
         this.dropAPPI(),
         this.createEventTable(),
         this.createAppInfoTable(),
         //this.checklastUpdate(),
         this.getXLSRequest()
      ]).then((result) => {
          alert("Inicialización terminada");
      }, (error) => {
          alert("ERROR inicializando :" +  JSON.stringify(error));
          console.log("ERROR: ", error);
      });
    }*/

    /*
    Método para borrar la tabla events
     */
    public dropE(){
      return new Promise((resolve, reject) => {
        this.storage.executeSql("DROP TABLE events", []).then((data) => {
            resolve(data);
        }, (error) => {
            reject(error);
            console.error('Unable to drop Evets table: ', error);
            //alert('Unable to execute sql: '+ JSON.stringify(err));
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
            console.error('Unable to drop appinfo table ', error);
            //alert('Unable to execute sql: '+ JSON.stringify(err));
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
            //alert('Tabla creada events: ' + JSON.stringify(data));
            resolve(data);
        }, (error) => {
            reject(error);
            console.error('Unable to execute sql EVT: ', error);
            //alert('Unable to execute sql: '+ JSON.stringify(err));
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
            let currentDate = this.getCurrentDate();
            this.insertInfo(currentDate.year, + currentDate.month, currentDate.day);
            console.log("Table created: ", data);
            //alert('Tabla creada appInfo: ' + JSON.stringify(data));
            resolve(data);
        }, (error) => {
            reject(error);
            console.error('Unable to execute sql: ', error);
            alert('Unable to execute sql APPIT: '+ JSON.stringify(error));
        });
      });
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
            let lastupdate = result[0];
            if (currentDate.year >= lastupdate.year){
              if (currentDate.month >= lastupdate.month){
                if ( currentDate.day > lastupdate.day){
                  this.getXLSRequest();
                }
              }
            } 
            resolve(lastupdate.year +"-"+lastupdate.month +"-"+lastupdate.day);
        }, (error) => {
            console.log("ERROR: ", error);
            reject(error);
        });
      });
    }

    /*
    Función que carga el xls de la url, lo parsea e inserta los datos en la base de datos
     */
    public getXLSRequest(){
      alert("Accedo a getxlsxrequest");
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
                      alert("Error al insertar xlsx: " + JSON.stringify(error));
                  });
              }
          }
      }
      oReq.send();
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
    Métodos que devuelve las últimas fechas de acceso al xls
     */
    public getInfo() {
      return new Promise((resolve, reject) => {
          this.storage.executeSql("SELECT year, month, day FROM appinfo", []).then((data) => {
              let lup = {
                year: data.rows.item(0).year,
                month: data.rows.item(0).month,
                day: data.rows.item(0).day
              };
              alert("lastupdate: " + JSON.stringify(lup));
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
                console.error('Unable to insert into the database: ', error);
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
        month: date.getMonth() + 1,
        day: date.getDate()
     };
     return currentdate;
    }
   
}
