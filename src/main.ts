import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import Mapboxgl from 'mapbox-gl';

Mapboxgl.accessToken = 'pk.eyJ1IjoiYWJyZWdvZGV2IiwiYSI6ImNsNDF4cTZybjAwbm0zb24ydHp2M3M3a3UifQ.GOB5KTQwURhrVgnOBmSxfw';

if (!navigator.geolocation) {
  alert('El navegador no soporta la geolocalización');
  throw new Error('Geoloc not supported');
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
