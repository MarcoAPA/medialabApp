# Medialab APP

The objetive of this work is the realization of a mobile application where users can view Medialab-Prado upcoming events and filter them by date, type and price. We also provide the location of Medialab-Prado and how to get there from the device current position on walk, by car and by public transport. 

El objetivo de este trabajo es la realización de una aplicación móvil donde el usuario pueda visionar los eventos próximos del Medialab-Prado (hasta 90 días) con la posibilidad de filtrarlos por fecha, tipo y precio. Mostraremos también la ubicación del centro y como llegar hasta él desde la posición donde se encuentre el dispositivo móvil.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You need to have node.js installed. You can download node.js from [here](https://nodejs.org/en/) and follow the installation steps.

### Installing

A step by step series of examples that tell you how to get a development env running

First you need to Install ionic 2 and Cordova vian npm

```
$ npm install -g cordova
```
```
$ npm install -g ionic
```

You can use [Sublime Text 3](https://www.sublimetext.com/3) as IDE with some plugins listed here:
* AngularJS
* TypeScript
* Git
* HTML5

You can also install TypeScript

```
$ npm install -g typescript
```

With Ionic and Cordova installed you have to clone the proyect into the desired folder and test it in the browser via shell

```
cd MedialabApp
$ ionic serve
```

If you`re getting errors you can create a blank Ionic 2 proyect 

```
ionic start MedialabAPP blank --v2
```
Overwrite the src folder with our repository src folder and include xlsx and jzip folders in node modules from our repository node modules folder
```
cd MedialabApp
$ ionic serve
```
## Deployment

You can deploy the app on your Android phone installing the Android SDK,  Android SDK Plataform-tools (Android Debug Bridge) that can be downloaded via SDK Manager or Android Studio and the ADB/USB drivers from your Android Mobile phone provider website.
Your device has to have the Developer Settings enabled and USB Debugging option enabled.
Once installed you can deploy the app via shell

```
$ ionic run android --device
```
You can check first that Windows recognize your phone with the command

```
$ adb devices
```

## Built With

* [Ionic 2](http://ionicframework.com/docs/) - The framework used
* [js-xlsx](https://github.com/SheetJS/js-xlsx) - Parser and writer for various spreadsheet formats

## Authors

* **Marco Antonio Palacios Arauzo** - *Initial work* - [MarcoAPA](https://github.com/MarcoAPA)
* **Henar Martín Dominguez** - *Initial work* - [HenarMD](https://github.com/HenarMD)
* **Enrique García Ortiz** - *Initial work* - [elpolilla](https://github.com/elpolilla)
* **Miguel Ángel García Solano** - *Initial work* - [miggar](https://github.com/miggar)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE Version 3 - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [Josh Morony html5 mobile tutorials](https://www.joshmorony.com/)
* [Thepolyglotdeveloper website](https://www.thepolyglotdeveloper.com/2016/06/working-shared-providers-ionic-2-mobile-app/)
* [Exploringjs website for info about js Promises and asynchronous programming](http://exploringjs.com/es6/ch_promises.html)
* [Ionic 2 forum](https://forum.ionicframework.com/?utm_source=framework&utm_medium=navbar&utm_campaign=forum%20CTA)