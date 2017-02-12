import { NgZone, Component, Input,Output, OnInit, OnDestroy,ViewChild,EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { PaginationService } from 'ng2-pagination';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { InjectUser } from "angular2-meteor-accounts-ui";
import { AgmCoreModule, MapsAPILoader } from 'angular2-google-maps/core';


import { Meteor } from 'meteor/meteor';

import 'rxjs/add/operator/combineLatest';

import { Stores } from '../../../../both/collections/stores.collection';
import { Store } from '../../../../both/models/store.model';
import { YssiLocation } from '../../../../both/models/store.model';

import template from './stores-map.component.html';
import style from './stores-map.component.scss';

@Component({
  selector: 'store-map',
  providers: [Location],
  template,
  styles : [ style ]
})

@InjectUser('user')
export class StoresMapComponent  implements OnInit, OnDestroy {
  
  @Input() stores: Store[];
  @Input() zoom: number;
  @Input() lat: number;
  @Input() lng: number;
  @Input() withSearch:boolean;
  @Output() onSelectLocation: EventEmitter<YssiLocation> = new EventEmitter<YssiLocation>();
  selectLocation : YssiLocation = {name: "", address:"", lat: 0, lng: 0};
  user: Meteor.User;
  location: Location;
  geocoder: any;
  clickLat:number;
  clickLng:number;
  markerIcon:string = "images/marker.png";


  constructor(private mapsAPILoader: MapsAPILoader,private ngZone: NgZone,location: Location) {this.location = location; }
  
  ngOnInit() {

  this.mapsAPILoader.load().then(() => {
            let autocomplete = new google.maps.places.Autocomplete(document.getElementById('your-search-bar'), {});
            this.geocoder = new google.maps.Geocoder();
            
            google.maps.event.addListener(autocomplete, 'place_changed', () => {
                this.ngZone.run(() => {
                    let place = autocomplete.getPlace();
                    if (place.geometry.location) {
                        this.lat = place.geometry.location.lat();
                        this.lng = place.geometry.location.lng();
                        this.zoom = 16;
                    }
                });
            });
        });
  }

  ngOnDestroy() {
    
  }
  isOwner(store : Store){
    return this.user && this.user._id === store.owner;
  }
  mapClicked($event: MouseEvent){
    if(!this.isAddAndHasMarker()){
      return;
    }
    this.mapClickedSetPlace($event.coords.lat, $event.coords.lng);
    
  }
  
  mapClickedSetPlace(lat: number, lng:number){
  
    this.clickLat = lat;
    this.clickLng = lng;

    let place = {'location' :{lat:this.clickLat , lng: this.clickLng }};
    this.geocoder.geocode(place, (results, status) => {  
      
      let selectLocation : YssiLocation = {name: "", address:"", lat: 0, lng: 0};
      let adress: any;
      let name : any;

      this.selectLocation.lat = place.location.lat;
      this.selectLocation.lng = place.location.lng;
      
      if(!(results === undefined) && !(results == null)&& results.length>0){
        
        this.selectLocation.address = results[0] === undefined ? "" :results[0].formatted_address;
        this.selectLocation.name = results[0] === undefined ? "" :results[1].formatted_address;
        this.onSelectLocation.emit(this.selectLocation);
      }
    });
  }
  mapUpdate(lat: number, lng:number){
    this.zoom = 16;
    this.lat =lat;
    this.clickLat = lat;
    this.lng = lng;
    this.clickLng = lng;
  }

  isAddAndHasMarker(){
    var path = this.location.path().split("/");
    return path[1] == 'add' || path[1]=='update';
  }

  clearSearch(){

  }

  reset(){
    this.stores = [];
    this.clickLat =  undefined;
    this.clickLng = undefined;
    this.ngOnInit();
    console.log("LAT and LONG");
    console.log(this.clickLat );
    console.log(this.clickLng );
  }

  clickedMarker(name:string, index: number) {
    console.log(`clicked the marker: ${name || index}`)
  }
}