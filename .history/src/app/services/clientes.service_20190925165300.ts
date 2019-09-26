import { Injectable, NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Pedido, ClienteDesatendido, Pines } from 'src/app/interfaces/venta.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  pedidos = new BehaviorSubject([]);
  pinesObs = new BehaviorSubject([]);
  pines: Pines[] = [];

  clientes: Pedido[] = [];
  salir = false;
  uid: string;

  fecha: string;

  constructor(
    private ngZone: NgZone,
    private datePipe: DatePipe,
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  // Firebase Database

  async getClientesDesatendidos(lapso): Promise<ClienteDesatendido[]> {
    return new Promise(async (resolve, reject) => {
      const fecha = await this.getFecha(lapso);
      const clSub = this.db.list(`clientes`, data => data
        .orderByChild('ultimaCompra').endAt(fecha))
        .valueChanges().subscribe((clientes: ClienteDesatendido[]) => {
          clSub.unsubscribe();
          resolve(clientes);
        });
    });
  }

  hayPedidos() {
    this.uid = this.uidService.getUid();
    return this.db.object(`pedidos/${this.uid}/cantidad`).valueChanges();
  }

  resetClientes() {
    this.clientes = [];
  }

  listenPedidos() {
    this.db.list(`pedidos/${this.uid}/detalles`).query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        const cliente = snapshot.val();
        console.log(cliente);
        if (cliente) {
          this.salir = false;
          const hora = Date.now();
          const momento = ( cliente.pedido.createdAt + 1800000 - hora ) / 1000;
          const tiempo = momento / 60;
          cliente.minutos = Math.floor(tiempo);
          cliente.segundos = Math.floor((tiempo - cliente.minutos) * 60);
          this.clientes.push(cliente);
        }
        this.clientes.sort((a, b) => a.minutos - b.minutos); // de menor a mayor
        this.countDown();
        console.log(this.clientes);
        this.setPinesPedido();
      });
    });
    this.pedidoQuitado();
    this.mensajesEntrantes();
  }

  setPinesPedido() {
    this.clientes.forEach(c => {
      if (this.pines.length === 0) {
        const pin: Pines = {
          id: c.cliente,
          lat: c.pedido.direccion.lat,
          lng: c.pedido.direccion.lng
        };
        this.pines.push(pin);
        this.pinesObs.next(this.pines);
      } else {
        const i = this.pines.findIndex(p => p.id === c.cliente);
        if (i < 0) {
          const pin: Pines = {
            id: c.cliente,
            lat: c.pedido.direccion.lat,
            lng: c.pedido.direccion.lng
          };
          this.pines.push(pin);
          this.pinesObs.next(this.pines);
        }
      }
    });
  }

  pedidoQuitado() {
    this.db.list(`pedidos/${this.uid}/detalles`).query.ref.on('child_removed', snapshot => {
      this.ngZone.run(() => {
        const cliente = snapshot.val();
        console.log('Pedido quitado');
        console.log(cliente);
        const index = this.clientes.findIndex(p => p.pedido.id === cliente.pedido.id);
        console.log(index);
        if (index >= 0) {
          this.clientes.splice(index, 1);
          this.pedidos.next(this.clientes);
        }
      });
    });
  }

  mensajesEntrantes() {
    this.db.list(`pedidos/${this.uid}/detalles`).query.ref.on('child_changed', snapshot => {
      this.ngZone.run(() => {
        const cliente = snapshot.val();
        console.log('Mensaje entrante');
        console.log(cliente);
        const index = this.clientes.findIndex(p => p.pedido.id === cliente.pedido.id);
        console.log(index);
        if (index >= 0) {
          if (cliente.msgPend) {
            this.clientes[index].msgPend = true;
          } else {
            this.clientes[index].msgPend = false;
          }
          this.pedidos.next(this.clientes);
        }
      });
    });
  }

  // Modal Productos

  getCliente(id) {
    return new Promise((resolve, reject) => {
      const clienteSub = this.db.object(`clientes/${id}`).valueChanges().subscribe(cliente => {
          clienteSub.unsubscribe();
          resolve(cliente);
      });
    });
  }

  async updateLastCompra(id) {
    await this.getDate();
    this.db.object(`clientes/${id}`).update({ultimaCompra: this.fecha});
  }

  // Auxiliares

  getDate() {
    return new Promise ((resolve, reject) => {
      const date = new Date();
      this.fecha = this.datePipe.transform(date, 'yyyy-MM-dd');
      resolve();
    });
  }

  getFecha(lapso): Promise<string> {
    return new Promise ((resolve, reject) => {
      const date = new Date();
      date.setDate(date.getDate() - lapso);
      const fecha = this.datePipe.transform(date, 'yyyy-MM-dd');
      resolve(fecha);
    });
  }

  stopCount() {
    this.db.list(`pedidos/${this.uid}`).query.ref.off('child_changed');
    this.db.list(`pedidos/${this.uid}`).query.ref.off('child_added');
    this.db.list(`pedidos/${this.uid}`).query.ref.off('child_removed');
    this.salir = true;
  }

  countDown() {
    setTimeout(() => {
      if (this.salir) {
        return;
      }
      this.clientes.forEach(p => {
        if (p.segundos === 0) {
          p.minutos -= 1;
          p.segundos = 59;
        } else {
          p.segundos -= 1;
        }
      });
      this.pedidos.next(this.clientes);
      this.countDown();
    }, 1000);
  }

}
