import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
	templateUrl: '../details/details.html',
	//providers: [GitHubService]
})
export class DetailsPage {
	//public readme = '';
	public event;

	constructor(
			private navCtrl: NavController,
			private navParams: NavParams) {
		
		this.event = navParams.get('event');
	}
}