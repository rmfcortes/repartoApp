import { Component, OnInit, NgZone } from '@angular/core';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ModalController } from '@ionic/angular';
import { Compra } from 'src/app/interfaces/compra.interface';
import { CompraService } from 'src/app/services/compra.service';


@Component({
  selector: 'app-gasto-modal',
  templateUrl: './gasto-modal.page.html',
  styleUrls: ['./gasto-modal.page.scss'],
})
export class GastoModalPage implements OnInit {

  imagenPreview: string;
  imagen64: string;

  guardando = false;
  fotoLista = false;

  compra: Compra = {
    nombre: '',
    descripcion: '',
    costo: null,
    cantidad: null,
    total: null,
    tipo: '',
    proveedor: '',
    fecha: null,
    viaje: null,
  };

  costoTotal = 0;

  constructor(
    private camera: Camera,
    private ngZone: NgZone,
    private modalCtrl: ModalController,
    private compraService: CompraService
  ) { }

  ngOnInit() {
  }

  async activaCamara() {
    const options: CameraOptions = {
      quality: 50,
      targetWidth: 600,
      targetHeight: 600,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };
    try {
      const imageData = await this.camera.getPicture(options);
      this.ngZone.run(() => {
        this.imagenPreview = 'data:image/jpeg;base64,' + imageData;
        this.imagen64 = imageData;
        this.fotoLista = true;
      });
    } catch (err) {
      console.log('Error en camara', JSON.stringify(err));
    }
  }

  async guardarGasto() {
    this.guardando = true;
    this.compra.total = this.compra.cantidad * this.compra.costo;
    await this.compraService.guardaFotoCompra(this.compra, this.imagen64);
    this.guardando = false;
    this.modalCtrl.dismiss(true);
  }

  regresar() {
    this.modalCtrl.dismiss(null);
  }

  resetForm() {
    this.compra = {
      nombre: '',
      descripcion: '',
      costo: null,
      cantidad: null,
      total: null,
      tipo: '',
      proveedor: '',
      viaje: null,
    };
    this.fotoLista = false;
    this.imagenPreview = null;
    this.imagen64 = null;
  }

}
