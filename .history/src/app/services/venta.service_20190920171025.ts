import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { Producto, ProductoCarga, ResumenViaje } from '../interfaces/producto.interface';
import { UidService } from './uid.service';
import { Pedido, DatosVenta } from '../interfaces/venta.interface';


@Injectable({
  providedIn: 'root'
})
export class VentaService {

  viaje = '1';
  uid: string;
  hora: string;

  fecha = '';

  carga: ProductoCarga[];

  constructor(
    private db: AngularFireDatabase,
    private platform: Platform,
    private storage: Storage,
    private datePipe: DatePipe,
    private uidService: UidService
  ) {
    this.uid = this.uidService.getUid();
  }

  // Inicio

  getProductos(): Promise<Producto[]> {
    return new Promise((resolve, reject) => {
      const prodSub = this.db.list(`solo-lectura/productos`).valueChanges().subscribe((productos: Producto[]) => {
        prodSub.unsubscribe();
        resolve(productos);
      }, (err) => {
        reject(err);
      });
    });
  }

  getViaje(): Promise <string> { // getViaje en el Storage
    return new Promise ( (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(() => {
          this.storage.get('viaje').then( val => {
            if ( val ) {
              this.viaje = val;
              resolve(this.viaje);
            } else {
              this.viaje = '1';
              resolve(this.viaje);
            }
            this.storage.set('viaje', this.viaje);
          });
        });
      } else {
        // Escritorio
        if ( localStorage.getItem('viaje') ) {
          this.viaje = localStorage.getItem('viaje');
          resolve(this.viaje);
        } else {
          this.viaje = '0';
          resolve('0');
        }
        localStorage.setItem('viaje', this.viaje);
      }
    });
  }

  updateViaje(viaje) {
    return new Promise ( (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
          // Celular
          this.storage.ready().then(() => {
            this.storage.set('viaje', viaje);
            this.viaje = viaje;
            resolve();
          });
      } else {
          // Escritorio
          localStorage.setItem('viaje', viaje);
          this.viaje = viaje;
          resolve();
      }
    });
  }

  // Comenzar viaje

  async setCarga(carga: Producto[]) { // guarda carga en el Storage y BD. SALIDA es el viaje
    await this.getFecha();
    return Promise.all([
      this.guardaCargaEnBD(carga),
      this.guardaCargaEnStorage(carga)
    ]);
  }

  setViajeDB( pass ) {
    return new Promise (async (resolve, reject) => {
      try {
        await this.db.object(`/ventas/${this.uid}/${this.fecha}/detalles/${this.viaje}`)
          .update({
            viaje: this.viaje,
            inicio: this.hora,
            validaInicio: pass,
          });
        resolve();
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  guardaCargaEnBD(prods: Producto[] ) {
    return new Promise (async (resolve, reject) => {
      const carga = {};
      prods.forEach(p => {
        const item = {
            actual: p.cantidad,
            inicial: p.cantidad,
            nombre: p.nombre
        };
        carga[p.id] = item;
      });
      try {
        await this.db.object(`/ventas/${this.uid}/${this.fecha}/carga/${this.viaje}`).set(carga);
        resolve();
      } catch (error) {
        reject();
      }
    });
  }

  guardaCargaEnStorage(prods: Producto[]) {
    return new Promise ( (resolve, reject) => {
      this.carga = [];
      prods.forEach(p => {
        const item: ProductoCarga = {
          actual: p.cantidad,
          inicial: p.cantidad,
          nombre: p.nombre,
          precio: p.precio,
          id: p.id,
        };
        this.carga.push(item);
      });
      if ( this.platform.is('cordova') ) {
          // Celular
          this.storage.ready().then(() => {
            this.storage.set('carga', JSON.stringify(this.carga));
            resolve();
          });
      } else {
          // Escritorio
          localStorage.setItem('carga', JSON.stringify(this.carga));
          resolve();
      }
    });
  }

  revisaPedidos(): Promise<Pedido[]> {
    this.uid = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      const pedSub = this.db.list(`pedidos/${this.uid}`).valueChanges().subscribe((pedidos: Pedido[]) => {
          pedSub.unsubscribe();
          resolve(pedidos);
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

  guardaSoloCargaEnStorage(prods: ProductoCarga[]) {
    return new Promise ( (resolve, reject) => {
      this.carga = [];
      prods.forEach(p => {
        if (!p.cantidad) {
          p.cantidad = 0;
        }
        const item: ProductoCarga = {
          actual: p.actual - p.cantidad,
          inicial: p.inicial,
          nombre: p.nombre,
          precio: p.precio,
          id: p.id
        };
        this.carga.push(item);
      });
      if ( this.platform.is('cordova') ) {
          // Celular
          this.storage.ready().then(() => {
            this.storage.set('carga', JSON.stringify(this.carga));
            resolve();
          });
      } else {
          // Escritorio
          localStorage.setItem('carga', JSON.stringify(this.carga));
          resolve();
      }
    });
  }

  async updateCargaDB(prods: ProductoCarga[]) {
    await this.getFecha();
    await this.getViaje();
    return new Promise(async (resolve, reject) => {
      for (const p of prods) {
        if (p.cantidad) {
          await this.db.object(`ventas/${this.uid}/${this.fecha}/carga/${this.viaje}/${p.nombre}`).update({actual : p.actual - p.cantidad});
        }
      }
      resolve();
    });
  }

  pushVenta(productos: ProductoCarga[], datos: DatosVenta, cuenta) {
    const vendidos = {};
    const nombre = 'Datos';
    datos.hora = Date.now();
    datos.total = cuenta;
    vendidos[nombre] = datos;
    const prods = {};
    const nomProds = 'Productos';
    productos.forEach(p => {
        prods[p.nombre] = p.cantidad;
    });
    vendidos[nomProds] = prods;
    const nomId = 'id';
    const id = this.db.createPushId();
    vendidos[nomId] = id;
    this.db.object(`ventas/${this.uid}/${this.fecha}/venta/${this.viaje}/${id}`).set(vendidos);
    this.db.object(`ventas/${this.uid}/${this.fecha}/detalles/venta`).query.ref.transaction( count => count ? count += cuenta : cuenta);
  }

  async deletePedido(pedido) {
    return new Promise(async (resolve, reject) => {
      await this.db.object(`pedidos/${this.uid}/${pedido}`).remove();
      resolve();
    });
  }

  async updateLastCompra(id) {
    await this.getFecha();
    this.db.object(`clientes/${id}`).update({ultimaCompra: this.fecha});
  }

  // Fin de Viaje

  getResumen(): Promise<ResumenViaje> {
    return new Promise(async (resolve, reject) => {
      await this.getFecha();
      console.log(this.fecha);
      console.log(this.uid);
      console.log(this.viaje);
      this.uid = this.uidService.getUid();
      this.viaje = await this.getViaje();
      const resSub = this.db.object(`ventas/${this.uid}/${this.fecha}/detalles/${this.viaje}`).valueChanges()
        .subscribe((resumen: ResumenViaje) => {
          resSub.unsubscribe();
          resolve(resumen);
        });
    });
  }

  updateBDFinViaje(pass) {
    return new Promise(async (resolve, reject) => {
      await this.getFecha();
      await this.db.object(`ventas/${this.uid}/${this.fecha}/detalles/${this.viaje}`).update({
        validaFin: pass,
        fin: this.hora
      });
      await this.db.object(`repartidores/${this.uid}`).update({status: 'Activo'});
      resolve();
    });
  }

  resetCarga() {
    if ( this.platform.is('cordova') ) {
      this.storage.remove('carga');
    } else {
      localStorage.removeItem('carga');
    }
  }

  // Resumen ventas

  getVentas(batch, lastkey) {
    return new Promise((resolve, reject) => {
      if (lastkey) {
        const venSub = this.db.list(`ventas/${this.uid}/${this.fecha}/venta/${this.viaje}`, data =>
          data.orderByKey().limitToFirst(batch).startAt(lastkey)).valueChanges()
            .subscribe(ventas => {
              venSub.unsubscribe();
              resolve(ventas);
            });
      } else {
        return this.db.list(`ventas/${this.uid}/${this.fecha}/venta/${this.viaje}`, data =>
          data.orderByKey().limitToFirst(batch));
      }
    });
  }

  // Cierre de turno

  getResumenGeneral() {
    return new Promise(async (resolve, reject) => {
      await this.getFecha();
      this.uid = this.uidService.getUid();
      const resSub = this.db.list(`ventas/${this.uid}/${this.fecha}/detalles`).valueChanges()
        .subscribe(resumen => {
          resSub.unsubscribe();
          resolve(resumen);
        });
    });
  }

  guardaBalance(cierre) {
    return new Promise(async (resolve, reject) => {
      await this.db.object(`balance/${this.fecha}/${this.uid}`).set(cierre);
      resolve();
    });
  }

  async borraViaje() {
    return new Promise(async (resolve, reject) => {
      try {
        if ( this.platform.is('cordova') ) {
          this.storage.remove('viaje');
        } else {
          localStorage.removeItem('viaje');
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Load from storage

  getCargaStorage(): Promise<ProductoCarga[]> { // getCarga en el Storage
    return new Promise ( (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(() => {
          this.storage.get('carga').then( val => {
            if ( val ) {
              this.carga = JSON.parse(val);
              resolve(this.carga);
            } else {
              resolve(null);
            }
          });
        });
      } else {
        // Escritorio
        if ( localStorage.getItem('carga') ) {
          this.carga = JSON.parse(localStorage.getItem('carga'));
          resolve(this.carga);
        } else {
          resolve(null);
        }
      }
    });
  }

  // Auxiliares

  getValidPass(pass) {
    return new Promise ((resolve, reject) => {
      console.log(pass);
      const passSub = this.db.object(`solo-lectura/pass-supervisores/${pass}`).valueChanges()
        .subscribe (data => {
          console.log(data);
          passSub.unsubscribe();
          if (data) {
            resolve(true);
          } else {
            reject();
          }
        }, () => {
          reject();
        });
    });
  }

  getFecha() {
    return new Promise ((resolve, reject) => {
      const date = new Date();
      this.hora = this.datePipe.transform(date, 'h:mm a');
      this.fecha = this.datePipe.transform(date, 'yyyy-MM-dd');
      resolve();
    });
  }
}
