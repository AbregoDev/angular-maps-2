import { Injectable } from '@angular/core';
import { Feature, PlacesResponse } from '../interfaces/places';
import { PlacesApiClient } from '../api/placesApiClient';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  public userLocation?: [number, number];
  public isLoadingResults: boolean = false;
  public places: Feature[] = [];
  
  get isUserLocationReady(): boolean {
    return !!this.userLocation;
  }

  constructor(
    private placesApi: PlacesApiClient,
    private mapService: MapService,
  ) {
    this.getUserLocation();
  }

  public async getUserLocation(): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        this.userLocation = [coords.longitude, coords.latitude];
        resolve(this.userLocation);
      }, err => {
        alert('No se pudo obtener la geolocalización');
        console.error(err);
        reject();
      });
    });
  }

  getPlacesByQuery(query: string = '') {
    if (!query) {
      this.places = [];
      return;
    }

    if (!this.userLocation) {
      throw Error('No hay localización');
    }

    this.isLoadingResults = true;

    this.placesApi.get<PlacesResponse>(`/${query}.json`, {
      params: {
        proximity: this.userLocation.join(',')
      }
    })
      .subscribe(resp => {
        this.places = resp.features;
        this.isLoadingResults = false;

        this.mapService.createMarkersFromResults(this.places, this.userLocation!);
      });
  }

  deletePlaces() {
    this.places = [];
  }
}
