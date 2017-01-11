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
import { Network } from 'ionic-native';
import { Platform } from 'ionic-angular';
var ConnectivityService = (function () {
    function ConnectivityService(platform) {
        this.platform = platform;
        this.onDevice = this.platform.is('cordova');
    }
    /* Comprobamos si el dispositivo tiene conexión connavigator.connection.type para dispositivo, navigator.onLine para navegador */
    ConnectivityService.prototype.isOnline = function () {
        if (this.onDevice && Network.connection) {
            return Network.connection !== Connection.NONE;
        }
        else {
            return navigator.onLine;
        }
    };
    ConnectivityService.prototype.isOffline = function () {
        if (this.onDevice && Network.connection) {
            return Network.connection === Connection.NONE;
        }
        else {
            return !navigator.onLine;
        }
    };
    return ConnectivityService;
}());
ConnectivityService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Platform])
], ConnectivityService);
export { ConnectivityService };
//# sourceMappingURL=connectivity-service.js.map