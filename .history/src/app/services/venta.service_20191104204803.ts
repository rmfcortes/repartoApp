import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { Producto, ProductoCarga, ResumenViaje } from '../interfaces/producto.interface';
import { UidService } from './uid.service';
import { DatosVenta } from '../interfaces/venta.interface';
import { Punto } from '../interfaces/recorrido.interface';


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
    private uidService: UidService,
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
              this.viaje = '0';
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
      this.guardaCargaForNot(carga),
      this.guardaCargaEnStorage(carga)
    ]);
  }

  setViajeDB( pass ) {
    return new Promise (async (resolve, reject) => {
      try {
        this.db.object(`carga/${this.uid}/sumario/viajes`).set(this.viaje);
        await this.db.object(`/ventas/${this.fecha}/${this.uid}/detalles/${this.viaje}`)
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

  guardaCargaForNot(prods: Producto[]) {
    return new Promise(async (resolve, reject) => {
      const carga: any = {};
      prods.forEach(p => {
        carga[p.id] = p.cantidad;
      });
      await this.db.object(`carga/${this.uid}/productos`).set(carga);
      resolve();
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
        await this.db.object(`/ventas/${this.fecha}/${this.uid}/carga/${this.viaje}`).set(carga);
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

  // Modal Productos

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
          await this.db.object(`ventas/${this.fecha}/${this.uid}/carga/${this.viaje}/${p.id}`).update({actual : p.actual - p.cantidad});
          await this.db.object(`carga/${this.uid}/productos/${p.id}`).set(p.actual - p.cantidad);
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
        prods[p.id] = p.cantidad;
    });
    vendidos[nomProds] = prods;
    const nomId = 'id';
    const id = this.db.createPushId();
    vendidos[nomId] = id;
    this.db.object(`ventas/${this.fecha}/${this.uid}/venta/${this.viaje}/${id}`).set(vendidos);
    this.db.object(`ventas/${this.fecha}/${this.uid}/detalles/${this.viaje}/venta`).query.ref
      .transaction( count => count ? parseInt(count, 10) + parseInt(cuenta, 10) : parseInt(cuenta, 10));
    this.db.object(`carga/${this.uid}/sumario/venta`).query.ref
      .transaction( count => count ? parseInt(count, 10) + parseInt(cuenta, 10) : parseInt(cuenta, 10));
  }

  async deletePedido(pedido) {
    return new Promise(async (resolve, reject) => {
      await this.db.object(`pedidos/${this.uid}/detalles/${pedido}`).remove();
      await this.db.object(`pedidos/${this.uid}/cantidad`).query.ref.transaction( count => count ? parseInt(count, 10) - 1 : 0);
      resolve();
    });
  }

  // Fin de Viaje

  getResumen(): Promise<ResumenViaje> {
    return new Promise(async (resolve, reject) => {
      await this.getFecha();
      console.log(this.fecha);
      console.log(this.uid);
      this.viaje = await this.getViaje();
      console.log(this.viaje);
      const resSub = this.db.object(`ventas/${this.fecha}/${this.uid}/detalles/${this.viaje}`).valueChanges()
        .subscribe((resumen: ResumenViaje) => {
          resSub.unsubscribe();
          resolve(resumen);
        });
    });
  }

  updateBDFinViaje(pass) {
    return new Promise(async (resolve, reject) => {
      await this.getFecha();
      const recSub = this.db.list(`recorridos/${this.uid}/${this.fecha}/${this.viaje}`).valueChanges()
        .subscribe(async (puntos: Punto[]) => {
          recSub.unsubscribe();
          let kmRecorridos = 0;
          if (puntos.length > 1) {
            for (let i = 0; i < puntos.length - 1; i++) {
              const d = await this.calculaDistancia(puntos[i].lat, puntos[i].lng, puntos[i + 1].lat, puntos[i + 1].lng);
              kmRecorridos += d;
            }
          }
          await this.db.object(`ventas/${this.fecha}/${this.uid}/detalles/${this.viaje}`).update({
            validaFin: pass,
            fin: this.hora,
            recorrido: kmRecorridos
          });
          await this.db.object(`repartidores/${this.uid}`).update({status: 'Activo'});
          resolve();
        });
    });
  }

  async resetCarga() {
    await this.db.object(`carga/${this.uid}/productos`).remove();
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
        const venSub = this.db.list(`ventas/${this.fecha}/${this.uid}/venta/${this.viaje}`, data =>
          data.orderByKey().limitToFirst(batch).startAt(lastkey)).valueChanges()
            .subscribe(ventas => {
              venSub.unsubscribe();
              resolve(ventas);
            });
      } else {
        const venSub = this.db.list(`ventas/${this.fecha}/${this.uid}/venta/${this.viaje}`, data =>
          data.orderByKey().limitToFirst(batch)).valueChanges()
          .subscribe(ventas => {
            venSub.unsubscribe();
            resolve(ventas);
          });
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

  getFecha() {
    return new Promise ((resolve, reject) => {
      const date = new Date();
      this.hora = this.datePipe.transform(date, 'h:mm a');
      this.fecha = this.datePipe.transform(date, 'yyyy-MM-dd');
      resolve();
    });
  }

  getCalificacion() {
      this.uid = this.uidService.getUid();
      return this.db.object(`rating/resumen/${this.uid}/`).valueChanges();
  }

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

  calculaDistancia( lat1, lng1, lat2, lng2 ): Promise<number> {
    return new Promise ((resolve, reject) => {
      const R = 6371; // Radius of the earth in km
      const dLat = this.deg2rad(lat2 - lat1);  // this.deg2rad below
      const dLon = this.deg2rad(lng2 - lng1);
      const a =
         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
         Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
         Math.sin(dLon / 2) * Math.sin(dLon / 2)
         ;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km
      resolve(d);
    });
  }

  deg2rad( deg ) {
    return deg * (Math.PI / 180);
  }

}
