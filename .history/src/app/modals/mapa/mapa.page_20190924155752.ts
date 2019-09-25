import { Component, OnInit, NgZone, Input } from '@angular/core';

import { MapsAPILoader } from '@agm/core';
import { } from 'googlemaps';

import { UbicacionService } from 'src/app/services/ubicacion.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {

  @Input() isAnonimo;

  cliente =  {
    lat: 0,
    lng: 0,
    direccion: ''
  };
  clienteReady = false;
  dir: string;

  ubicacion =  {
    lat: 20.622894,
    lng: -103.415830
  };

  icon = '../../../assets/img/pin.svg';
  casa = '../../../assets/img/casa.svg';

  ubicacionReady = false;

  constructor(
    private ngZone: NgZone,
    private mapsAPILoader: MapsAPILoader,
    private modalController: ModalController,
    private ubicacionService: UbicacionService,
  ) { }

  ngOnInit() {
    this.getUbicacion();
  }

  ionViewDidEnter() {
    if (this.isAnonimo) {
      setTimeout(() => {
        this.setAutocomplete();
      }, 500);
    }
  }


  getUbicacion() {
    this.ubicacionService.ubicacion.subscribe(coords => {
      this.ubicacion.lat = coords.lat;
      this.ubicacion.lng = coords.lng;
      this.ubicacionReady = true;
    });
  }

  setAutocomplete() {
    this.mapsAPILoader.load().then(async () => {
      const nativeHomeInputBox = document.getElementById('txtHome').getElementsByTagName('input')[0];
      const autocomplete = new google.maps.places.Autocomplete(nativeHomeInputBox, {
        types: ['address']
      });
      autocomplete.addListener('place_changed', () => {
          this.ngZone.run(async () => {
              // get the place result
              const place: google.maps.places.PlaceResult = autocomplete.getPlace();

              // verify result
              if (place.geometry === undefined || place.geometry === null) {
                  return;
              }
              // set latitude, longitude and zoom
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              this.cliente.lat = lat;
              this.cliente.lng = lng;
              this.cliente.direccion = place.formatted_address;
              this.clienteReady = true;
              this.dir = '';
          });
      });
    });
  }

  guardaLoc(evento) {
    this.cliente.lat = evento.coords.lat;
    this.cliente.lng = evento.coords.lng;
  }

  regresar() {
    this.modalController.dismiss();
  }

    // Eventos Mapa

    mapaListo(event) {
      console.log(event);
      // event.get
    }


}
