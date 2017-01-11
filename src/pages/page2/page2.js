var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ConnectivityService } from '../../providers/connectivity-service';
import { Geolocation } from 'ionic-native'; /* Importamos el plugin nativo de Geolocation para obtener la posición del dispositivo */
//declare var origin;      /* Origen de la ruta que va a ser la posición del dispositivo */ 
//declare var destination; /* Destino prefijado que en este caso es el edificio de MediaLab-Prado */
//declare var travelmode;  
var Page2 = (function () {
    function Page2(navCtrl, connectivityService) {
        this.navCtrl = navCtrl;
        this.connectivityService = connectivityService;
        this.mapInitialised = false;
        //private origin: {lat: 40.4542158, lng:-3.7212351};
        //destination: {lat: 40.410560776119, lng: -3.6937931079230700};  
        //destination: 'Calle de la Alameda, 15, 28014 Madrid, Spain';
        this.TransportMode = this;
        this.loadGoogleMaps();
        this.TransportMode = "walkB"; //Para indicar la pestaña por defecto doy valor inicial al ngModel TransportMode
    }
    Page2.prototype.loadGoogleMaps = function () {
        var _this = this;
        this.addConnectivityListeners();
        if (typeof google == "undefined" || typeof google.maps == "undefined") {
            console.log("Google maps JavaScript needs to be loaded.");
            this.disableMap();
            if (this.connectivityService.isOnline()) {
                console.log("online, loading map");
                //Load the SDK
                window['mapInit'] = function () {
                    _this.initMap();
                    _this.enableMap();
                };
                var script = document.createElement("script");
                script.id = "googleMaps";
                if (this.apiKey) {
                    script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
                }
                else {
                    script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
                }
                document.body.appendChild(script);
            }
        }
        else {
            if (this.connectivityService.isOnline()) {
                console.log("showing map");
                this.initMap();
                this.enableMap();
            }
            else {
                console.log("disabling map");
                this.disableMap();
            }
        }
    };
    Page2.prototype.initMap = function () {
        var _this = this;
        this.mapInitialised = true;
        Geolocation.getCurrentPosition().then(function (position) {
            var origin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var destination = new google.maps.LatLng('40.4106118', '-3.6938643');
            var travelmode = 'WALKING';
            var directionsDisplay = new google.maps.DirectionsRenderer;
            var directionsService = new google.maps.DirectionsService;
            var mapOptions = {
                center: origin,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            _this.map = new google.maps.Map(_this.mapElement.nativeElement, mapOptions);
            /* Añadimos el transit Layer */
            //this.map = new google.maps.TransitLayer(); //NO FUNCIONA
            directionsDisplay.setMap(_this.map);
            directionsDisplay.setPanel(document.getElementById('directionsPanel'));
            //document.getElementById("MyEdit").innerHTML = 'Hora: ' + new Date(Date.now());​
            //document.getElementById("MyEdit").innerHTML = travelmode;​
            calculateAndDisplayRoute(directionsService, directionsDisplay);
            /*
            Creamos los listeners de cada botón para poder cambiar el modo de viaje (walking, transit, driving)
             */
            document.getElementById('walkB').addEventListener('click', function () {
                travelmode = 'WALKING';
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            });
            document.getElementById('transitB').addEventListener('click', function () {
                travelmode = 'TRANSIT';
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            });
            document.getElementById('drivingB').addEventListener('click', function () {
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
                        modes: ['SUBWAY', 'BUS', 'RAIL', 'TRAIN'],
                        routingPreference: 'FEWER_TRANSFERS'
                    },
                    drivingOptions: {
                        departureTime: new Date(Date.now()),
                        trafficModel: 'optimistic'
                    }
                }, function (response, status) {
                    if (status === 'OK') {
                        directionsDisplay.setDirections(response);
                    }
                    else {
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
            /*function toggleBounce(marker) {
              if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
              } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
              }
            }*/
        });
    };
    Page2.prototype.disableMap = function () {
        console.log("disable map");
    };
    Page2.prototype.enableMap = function () {
        console.log("enable map");
    };
    Page2.prototype.addConnectivityListeners = function () {
        var _this = this;
        var onOnline = function () {
            setTimeout(function () {
                if (typeof google == "undefined" || typeof google.maps == "undefined") {
                    _this.loadGoogleMaps();
                }
                else {
                    if (!_this.mapInitialised) {
                        _this.initMap();
                    }
                    _this.enableMap();
                }
            }, 2000);
        };
        var onOffline = function () {
            _this.disableMap();
        };
        document.addEventListener('online', onOnline, false);
        document.addEventListener('offline', onOffline, false);
    };
    return Page2;
}());
__decorate([
    ViewChild('map'),
    __metadata("design:type", ElementRef)
], Page2.prototype, "mapElement", void 0);
Page2 = __decorate([
    Component({
        selector: 'page-page2',
        templateUrl: 'page2.html'
    }),
    __metadata("design:paramtypes", [NavController, ConnectivityService])
], Page2);
export { Page2 };
//# sourceMappingURL=page2.js.map