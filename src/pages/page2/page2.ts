import { Component, ElementRef, ViewChild } from '@angular/core';

import { NavController } from 'ionic-angular';

import { ConnectivityService } from '../../providers/connectivity-service';
import { Geolocation } from 'ionic-native'; /* Importamos el plugin nativo de Geolocation para obtener la posición del dispositivo */

declare var google;
//declare var origin;      /* Origen de la ruta que va a ser la posición del dispositivo */ 
//declare var destination; /* Destino prefijado que en este caso es el edificio de MediaLab-Prado */
//declare var travelmode;  

@Component({
  selector: 'page-page2',
  templateUrl: 'page2.html'
})

export class Page2 {
  
  @ViewChild('map') mapElement: ElementRef; /* Añadimos la referencia al elemento mapa que añadiremos luego a nuestro html con #map */

  map: any;
  mapInitialised: boolean = false;
  apiKey: 'AIzaSyBlrDUzc42lKRhjbVc_zD0sM1sJgyLEqjE'; /* API key de Google Maps*/
  origin: {lat: 40.4542158, lng:-3.7212351};
  //destination: {lat: 40.410560776119, lng: -3.6937931079230700};  
  //destination: 'Calle de la Alameda, 15, 28014 Madrid, Spain';

  constructor(public navCtrl: NavController, public connectivityService: ConnectivityService) {
    this.loadGoogleMaps();
    //let lat = '40.4105';
    //let lng = '-3.6937';
    //let myLatLng = {lat: 40.410560776119, lng: -3.6937931079230700};
    //destination = new google.maps.LatLng({lat: 40.410560776119, lng: -3.6937931079230700});
    //destination = new google.maps.LatLng('40.410560776119', '-3.6937931079230700');
  }

  loadGoogleMaps(){
 
    this.addConnectivityListeners();
 
    if(typeof google == "undefined" || typeof google.maps == "undefined"){
   
      console.log("Google maps JavaScript needs to be loaded.");
      this.disableMap();
   
      if(this.connectivityService.isOnline()){
        console.log("online, loading map");
   
        //Load the SDK
        window['mapInit'] = () => {
          this.initMap();
          this.enableMap();
        }
   
        let script = document.createElement("script");
        script.id = "googleMaps";
   
        if(this.apiKey){
          script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
        } else {
          script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';       
        }
   
        document.body.appendChild(script);  
   
      } 
    }
    else {
   
      if(this.connectivityService.isOnline()){
        console.log("showing map");
        this.initMap();
        this.enableMap();
      }
      else {
        console.log("disabling map");
        this.disableMap();
      }
   
    }
   
  }
 
  initMap(){
 
    this.mapInitialised = true;
     
    Geolocation.getCurrentPosition().then((position) => {
 
      var origin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      var destination = new google.maps.LatLng('40.4106118', '-3.6938643');
      var travelmode = 'WALKING';

      var directionsDisplay = new google.maps.DirectionsRenderer;
      var directionsService = new google.maps.DirectionsService;

      let mapOptions = {
        center: origin,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      /* Añadimos el transit Layer */
      //this.map = new google.maps.TransitLayer(); //NO FUNCIONA

      directionsDisplay.setMap(this.map);
      directionsDisplay.setPanel(document.getElementById('directionsPanel'));

      //document.getElementById("MyEdit").innerHTML = 'Hora: ' + new Date(Date.now());​
      //document.getElementById("MyEdit").innerHTML = travelmode;​
      calculateAndDisplayRoute(directionsService, directionsDisplay);

      /*
      Creamos los listeners de cada botón para poder cambiar el modo de viaje (walking, transit, driving)
       */
      document.getElementById('walkB').addEventListener('click', function() {
        travelmode = 'WALKING';
        calculateAndDisplayRoute(directionsService, directionsDisplay);
      });
      document.getElementById('transitB').addEventListener('click', function() {
        travelmode = 'TRANSIT';
        calculateAndDisplayRoute(directionsService, directionsDisplay);
      });
      document.getElementById('drivingB').addEventListener('click', function() {
        travelmode = 'DRIVING';
        calculateAndDisplayRoute(directionsService, directionsDisplay);
      });

            /*
      Función que calcula la ruta y la muestra
      */
      function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        directionsService.route({
          origin: origin,
          destination: destination,
          provideRouteAlternatives: true,
          travelMode: google.maps.TravelMode[travelmode],
          transitOptions: {
            departureTime: new Date(Date.now()),
            modes: ['SUBWAY','BUS','RAIL','TRAIN'],
            routingPreference: 'FEWER_TRANSFERS'
          },
          drivingOptions: {
            departureTime: new Date(Date.now()),  
            trafficModel: 'optimistic'
          }
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }

      /* Añadimos una marca para la posición donde nos encontramos */
      /* Aqui tenemos que poner var y no let porque let solo tiene visibilidad dentro de un bloque y marker lo usamos en la función toggleBounce */ 
      /*var marker = new google.maps.Marker({
        map: this.map,
        position: latLng,  
        draggable: true,
        animation: google.maps.Animation.DROP  
      });
      //marker.setMap(this.map); es igual que map: this.map
      marker.addListener('click', toggleBounce);*/

      /*
      Función para que se mueva el marker
       */
      function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
      }

    });
  }
 
  disableMap(){
    console.log("disable map");
  }
 
  enableMap(){
    console.log("enable map");
  }
 
  addConnectivityListeners(){
 
    let onOnline = () => {
 
      setTimeout(() => {
        if(typeof google == "undefined" || typeof google.maps == "undefined"){
 
          this.loadGoogleMaps();
 
        } else {
 
          if(!this.mapInitialised){
            this.initMap();
          }
 
          this.enableMap();
        }
      }, 2000);
 
    };
 
    let onOffline = () => {
      this.disableMap();
    };
 
    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
 
  }

  /*
  Función que nos permite obtener la posición del dispositivo actualizando la variable origin
   */
  /*getDevicePosition(){
    Geolocation.getCurrentPosition().then((position) => {
      origin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    });
  };*/

}
