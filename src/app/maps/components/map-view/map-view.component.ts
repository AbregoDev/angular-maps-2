import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Map, Popup, Marker } from 'mapbox-gl';
import { PlacesService, MapService } from '../../services';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements AfterViewInit {

  @ViewChild('mapDiv')
  mapDivElement!: ElementRef;

  constructor(
    private placesService: PlacesService,
    private mapService: MapService,
  ) { }

  ngAfterViewInit(): void {
    if (!this.placesService.userLocation) {
      throw Error('No se puede obtener ubicación')
    }

    const map = new Map({
      container: this.mapDivElement.nativeElement,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: this.placesService.userLocation,
      zoom: 13,
    });

    const popUp = new Popup()
      .setHTML(`
        <h6>Hola</h6>
        <span>Aki ando jeje</span>
      `);

    new Marker({ color: 'purple' })
      .setLngLat(this.placesService.userLocation)
      .setPopup(popUp)
      .addTo(map);

    this.mapService.setMap(map);
  }

}
