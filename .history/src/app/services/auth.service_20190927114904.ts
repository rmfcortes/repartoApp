import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { UidService } from './uid.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  uid: string;

  constructor(
    private storage: Storage,
    private platform: Platform,
    private db: AngularFireDatabase,
    public authFirebase: AngularFireAuth,
    private uidService: UidService,
  ) { }

  async loginWithEmail(email, pass) {
    return new Promise(async (resolve, reject) => {
    try {
        await this.authFirebase.auth.signInWithEmailAndPassword(email, pass);
        const user = this.authFirebase.auth.currentUser;
        const u =  {
          nombre: user.displayName,
          uid: user.uid
        };
        const resp = await this.verificarUsuario(user.uid);
        console.log(resp);
        if (resp) {
          this.guardaUsuarioStorage(u);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  verificarUsuario( id ) {
    return new Promise ( (resolve, reject) => {
      const infSub = this.db.object(`repartidores/${id}`).valueChanges().subscribe((data: any) => {
          infSub.unsubscribe();
          if (data) {
            if (data.puesto === 'Vendedor') {
              if (data.status === 'Inactivo') {
                resolve (true);
              } else {
                const error = {
                  code: 'activo'
                };
                reject(error);
              }
            } else {
                const error = {
                  code: 'no-es-vendedor'
                };
                reject(error);
            }
          } else {
            const error = {
              code: 'auth/user-not-found'
            };
            reject(error);
          }
        },
        (err) => {
          console.log(err);
          reject(err);
        });
    });
  }

  actualizarStatus(estado) {
    this.db.object(`repartidores/${this.uid}`).update({status: estado});
  }

  getStatus() {
    return new Promise((resolve, reject) => {
      const stSub = this.db.object(`repartidores/${this.uid}/status`).valueChanges().subscribe(estado => {
        stSub.unsubscribe();
        resolve(estado);
      });
    });
  }

  async revisaFireAuth() {
    return new Promise((resolve, reject) => {
      const authSub = this.authFirebase.authState.subscribe(async (user) => {
        authSub.unsubscribe();
        console.log(user);
        if (user) {
          const usuario =  {
            nombre: user.displayName,
            foto: user.photoURL,
            uid: user.uid
          };
          await this.guardaUsuarioStorage(usuario);
          resolve(usuario);
        } else {
          resolve(false);
        }
      });
    });
  }

  guardaUsuarioStorage(usuario) {
    return new Promise (async (resolve, reject) => {
      this.uid = usuario.uid;
      this.uidService.setUser(usuario);
      this.uidService.setUid(usuario.uid);
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.set('colaborador', JSON.stringify(usuario));
        resolve();
      } else {
        // Escritorio
        localStorage.setItem('colaborador', JSON.stringify(usuario));
        resolve();
      }
    });
  }

  getUsuarioStorage() {
    return new Promise ( (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(() => {
          this.storage.get('colaborador').then( val => {
            if ( val ) {
              const user = JSON.parse(val);
              this.guardaUsuarioStorage(user);
              resolve(user);
            } else {
              resolve(false);
            }
          });
        });
      } else {
        // Escritorio
        if ( localStorage.getItem('colaborador') ) {
          const user = JSON.parse(localStorage.getItem('colaborador'));
          this.guardaUsuarioStorage(user);
          resolve(user);
        } else {
          resolve(false);
        }
      }

    });

  }

  async logout() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.authFirebase.auth.signOut();
        localStorage.removeItem('colaborador');
        this.uidService.setUser(null);
        this.uidService.setUid(null);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }


}
