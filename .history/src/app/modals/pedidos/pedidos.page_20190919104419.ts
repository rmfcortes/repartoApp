import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {

  minutos = 5;
  segundos = 45;

  constructor() { }

  ngOnInit() {
    this.countDown();
  }
  
  countDown() {
    setTimeout(() => {
      if (this.segundos === 0) {
        this.minutos -= 1;
        this.segundos = 60;
      } else {
        this.segundos -= 1;
      }
    }, 1000);
  }


}
