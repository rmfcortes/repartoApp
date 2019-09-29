import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-cierre',
  templateUrl: './cierre.page.html',
  styleUrls: ['./cierre.page.scss'],
})
export class CierrePage implements OnInit {

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  regresar() {
    this.modalController.dismiss();
  }

}
