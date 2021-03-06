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

  hayMensajes() {
    return this.db.object(`pedidos/${this.uid}/mensajes`).valueChanges();
  }

  hayPedidosNot() {
    return this.db.object(`pedidos-pendientes`);
  }

  async autoAsignaPedido(pedido) {
    await this.db.object(`pedidos-pendientes/${pedido.pedido.id}/chofer`).set(this.uid);
    await this.db.object(`pedidos/${this.uid}/cantidad`).query.ref.transaction(count => count ? count + 1 : 1);
    await this.db.object(`pedidos/${this.uid}/detalles/${pedido.pedido.id}`).set(pedido);
    await this.db.object(`pedidos-pendientes/${pedido.pedido.id}`).remove();
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
          const momento = ( hora - cliente.pedido.createdAt ) / 60000;
          const horas = momento / 60;
          cliente.horas = horas < 1 ? 0 : Math.floor(horas);
          const minutos = (horas - cliente.horas) * 60;
          cliente.minutos = Math.floor(minutos);
          this.clientes.push(cliente);
          this.setPinesPedido(cliente);
        }
        this.clientes.sort((a, b) => a.minutos - b.minutos); // de menor a mayor
        this.pedidos.next(this.clientes);
        if (this.clientes.length === 1) {
          this.salir = false;
          this.countDown();
        }
      });
    });
    this.pedidoQuitado();
    this.mensajesEntrantes();
  }

  setPinesPedido(cliente) {
    if (this.pines.length === 0) {
      const pin: Pines = {
        id: cliente.pedido.id,
        lat: cliente.pedido.direccion.lat,
        lng: cliente.pedido.direccion.lng
      };
      this.pines.push(pin);
      this.pinesObs.next(this.pines);
    } else {
      const i = this.pines.findIndex(p => p.id === cliente.pedido.id);
      if (i < 0) {
        const pin: Pines = {
          id: cliente.pedido.id,
          lat: cliente.pedido.direccion.lat,
          lng: cliente.pedido.direccion.lng
        };
        this.pines.push(pin);
        this.pinesObs.next(this.pines);
      }
    }
  }

  pedidoQuitado() {
    this.db.list(`pedidos/${this.uid}/detalles`).query.ref.on('child_removed', snapshot => {
      this.ngZone.run(() => {
        const cliente = snapshot.val();
        this.clientes = this.clientes.filter(p => p.pedido.id !== cliente.pedido.id);
        if (this.clientes.length === 0 ) { this.salir = true; }
        this.pedidos.next(this.clientes);
        this.pines = this.pines.filter(p => p.id !== cliente.pedido.id);
        this.pinesObs.next(this.pines);
      });
    });
  }

  mensajesEntrantes() {
    this.db.list(`pedidos/${this.uid}/detalles`).query.ref.on('child_changed', snapshot => {
      this.ngZone.run(() => {
        const cliente = snapshot.val();
        const index = this.clientes.findIndex(p => p.pedido.id === cliente.pedido.id);
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

  getPrecios(id) {
    return new Promise((resolve, reject) => {
      const preciosSub = this.db.object(`clientes/${id}/precio`).valueChanges().subscribe(precio => {
          preciosSub.unsubscribe();
          resolve(precio);
      });
    });
  }

  // Auxiliares

  getDate() {
    return new Promise ((resolve, reject) => {
      const date = new Date();
      this.fecha = this.datePipe.transform(date, 'yyyy-MM-dd');
      resolve();
    });
  }

  getFecha(lapso): Promise<number> {
    return new Promise ((resolve, reject) => {
      const date = new Date();
      date.setDate(date.getDate() - lapso);
      const fecha = date.getTime();
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
        if (p.minutos === 59) {
          p.horas += 1;
          p.minutos = 0;
        } else {
          p.minutos += 1;
        }
      });
      this.pedidos.next(this.clientes);
      this.countDown();
    }, 60000);
  }

}
