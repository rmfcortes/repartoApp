import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VentaService } from 'src/app/services/venta.service';

@Component({
  selector: 'app-cierre',
  templateUrl: './cierre.page.html',
  styleUrls: ['./cierre.page.scss'],
})
export class CierrePage implements OnInit {

  validando = false;


  constructor(
    private modalController: ModalController,
    private ventaService: VentaService,
  ) { }

  ngOnInit() {
  }

  regresar() {
    this.modalController.dismiss();
  }

  // Auxiliares

  async validaPass() {
    this.validando = true;
    try {
      const resp = await this.ventaService.getValidPass(this.pass);
      if (resp) {
        if (this.inicioPage) {
          this.aVender();
        } else {
          this.cierreTurno();
        }
      } else {
        this.validando = false;
        this.presentAlert('Error', `Contraseña incorrecta. O no tienes permisos suficientes para validar
                              la carga. Intenta con otra contraseña o ponte en contacto con el administrador`);
      }
    } catch (error) {
      this.validando = false;
      this.presentAlert('Error', `Contraseña incorrecta. O no tienes permisos suficientes para validar
                              la carga. Intenta con otra contraseña o ponte en contacto con el administrador`);
    }
  }

}
