import { Injectable, NgZone } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';
import { UidService } from './uid.service';
import { BehaviorSubject } from 'rxjs';
import { Pedido } from 'src/app/interfaces/venta.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  pedidos = new BehaviorSubject([]);
  clientes: Pedido[] = [];
  salir = false;
  uid: string;

  fecha: string;

  constructor(
    private ngZone: NgZone,
    private storage: Storage,
    private platform: Platform,
    private datePipe: DatePipe,
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  // Firebase Database

  actualizaListaClientes() {
    return new Promise (async (resolve, reject) => {
      const lapsosSub = this.db.object(`solo-lectura/lapso`).valueChanges()
        .subscribe(async (lapso) => {
          lapsosSub.unsubscribe();
          const fecha = await this.getFecha(lapso);
          await this.getClientesDesatendidos(fecha);
          resolve();
        });
    });
  }

  getClientesDesatendidos(fecha) {
    return new Promise((resolve, reject) => {
      const clSub = this.db.list(`clientes`, data => data
        .orderByChild('ultimaCompra').endAt(fecha))
        .valueChanges().subscribe(clientes => {
          clSub.unsubscribe();
          if (clientes.length > 0 && clientes) {
            this.guardaClientesStorage(clientes);
          }
          resolve();
        });
    });
  }

  listenPedidos() {
    this.uid = this.uidService.getUid();
    this.db.list(`pedidos/${this.uid}/detalles`).query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        const cliente = snapshot.val();
        this.salir = false;
        const hora = Date.now();
        const momento = ( cliente.pedido.createdAt + 1800000 - hora ) / 1000;
        const tiempo = momento / 60;
        cliente.minutos = Math.floor(tiempo);
        cliente.segundos = Math.floor((tiempo - cliente.minutos) * 60);
        this.clientes.push(cliente);
        this.clientes.sort((a, b) => a.minutos - b.minutos); // de menor a mayor
        this.countDown();
        console.log(this.clientes);
      });
    });
    this.pedidoQuitado();
    this.mensajesEntrantes();
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

  actualizaClientesDesatendidos(cliente) {
    const clientes: any = JSON.parse(localStorage.getItem('clientes'));
    const index = clientes.findIndex(c => c.cliente === cliente.cliente);
    if (index >= 0) {
      clientes.splice(index, 1);
      if (clientes.length === 0) {
        localStorage.removeItem('clientes');
      } else {
        localStorage.setItem('clientes', JSON.stringify(clientes));
      }
    }
  }

  async updateLastCompra(id) {
    await this.getDate();
    this.db.object(`clientes/${id}`).update({ultimaCompra: this.fecha});
  }

  // Guarda en el Storage

  guardaClientesStorage(clientes) {
    return new Promise ((resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(() => {
          this.storage.set('clientes', JSON.stringify(clientes));
          resolve();
        });
      } else {
          // Escritorio
          localStorage.setItem('clientes', JSON.stringify(clientes));
          resolve();
      }
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

  getFecha(lapso) {
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
