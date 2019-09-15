import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { UidService } from './uid.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private storage: Storage,
    private platform: Platform,
    public authFirebase: AngularFireAuth,
    private uidService: UidService,
  ) { }

  async loginWithEmail(email, pass) {
    await this.authFirebase.auth.signInWithEmailAndPassword(email, pass);
    const user = this.authFirebase.auth.currentUser;
    const u =  {
      nombre: user.displayName,
      uid: user.uid
    };
    this.guardaUsuarioStorage(u);
  }

  async revisaFireAuth() {
    return new Promise((resolve, reject) => {
      const authSub = this.authFirebase.authState.subscribe(user => {
        authSub.unsubscribe();
        console.log(user);
        if (user) {
          const usuario =  {
            nombre: user.displayName,
            foto: user.photoURL,
            uid: user.uid
          };
          this.guardaUsuarioStorage(usuario);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  guardaUsuarioStorage(usuario) {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        await this.storage.ready();
        this.storage.set('usuario', JSON.stringify(usuario));
        this.uidService.setUser(usuario);
        this.uidService.setUid(usuario.uid);
        resolve();
      } else {
        // Escritorio
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.uidService.setUser(usuario);
        this.uidService.setUid(usuario.uid);
        resolve();
      }
    });
  }

  revisa() {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        await this.storage.ready();
        const usuario = await this.storage.get('usuario');
        if ( usuario ) {
          this.uidService.setUser(JSON.parse(usuario));
          this.uidService.setUid(usuario.uid);
          resolve();
        } else {
          resolve(false);
        }
      } else {
        // Escritorio
        if ( localStorage.getItem('usuario') ) {
          const usuario = await JSON.parse(localStorage.getItem('usuario'));
          this.uidService.setUser(usuario);
          this.uidService.setUid(usuario.uid);
          resolve();
        } else {
          resolve(false);
        }
      }
    });
  }

  logout() {
    this.authFirebase.auth.signOut();
    if ( this.platform.is('cordova') ) {
      this.storage.remove('usuario');
      this.uidService.setUser('inactivo');
      this.uidService.setUid(null);
    } else {
      localStorage.removeItem('usuario');
      this.uidService.setUser('inactivo');
      this.uidService.setUid(null);
    }
  }


}
