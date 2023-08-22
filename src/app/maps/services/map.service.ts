import { Injectable } from '@angular/core';
import { AnySourceData, LngLatBounds, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import { Feature } from '../interfaces/places';
import { DirectionsApiClient } from '../api';
import { DirectionsResponse, Route } from '../interfaces/directions';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private map?: Map;
  private markers: Marker[] = [];

  get isMapReady() {
    return !!this.map;
  }

  constructor(private directionsApi: DirectionsApiClient) { }

  setMap(map: Map) {
    this.map = map;
  }

  flyTo(coords: LngLatLike ) {
    if (!this.isMapReady) {
      throw Error('El mapa no está inicializado');
    }
    
    this.map?.flyTo({
      zoom: 14,
      center: coords,
    });
  }

  createMarkersFromResults(places: Feature[], location: [number, number]) {
    if (!this.map) {
      throw Error('Mapa no inicializado');
    }

    this.markers.forEach(marker => marker.remove());
    const newMarkers = [];

    for (const place of places) {
      const [ lng, lat ] = place.center;
      const popup = new Popup()
        .setHTML(`
          <h6>${place.text}</h6>        
          <span>${place.place_name}</span>
        `);

      const marker = new Marker()
        .setLngLat([ lng, lat ])
        .setPopup(popup)
        .addTo(this.map);

      newMarkers.push(marker);
    }

    this.markers = newMarkers;

    if (places.length === 0) return;

    const bounds = new LngLatBounds();

    newMarkers.forEach(marker => {
      bounds.extend(marker.getLngLat());
    });

    bounds.extend(location);
    
    this.map.fitBounds(bounds, { padding: 100 });
  }

  getRouteBetweenPoints(start: [number, number], end: [number, number]) {
    this.directionsApi.get<DirectionsResponse>(`/${start.join(',')};${end.join(',')}`)
      .subscribe(resp => {
        this.drawPolyline(resp.routes[0]);
      });
  }

  private drawPolyline(route: Route) {
    console.log({
      kms: route.distance / 1000,
      duration: route.duration / 60,
    });

    if (!this.map) throw Error('Mapa no inicializado');

    const coords = route.geometry.coordinates;

    const bounds = new LngLatBounds();
    coords.forEach(coord => {
      bounds.extend(coord);
    });

    this.map?.fitBounds(bounds, {
      padding: 100
    });

    // Polyline
    const sourceData: AnySourceData = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords,
            }
          }
        ]
      }
    }

    // Todo: Limpiar ruta previa
    if (this.map.getLayer('routeString')) {
      this.map.removeLayer('routeString');
      this.map.removeSource('routeString');
    }

    this.map.addSource('routeString', sourceData);
    this.map.addLayer({
      id: 'routeString',
      type: 'line',
      source: 'routeString',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': 'lime',
        'line-width': 5
      }
    });
  }

}
