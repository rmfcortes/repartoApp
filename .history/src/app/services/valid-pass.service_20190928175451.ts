import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class ValidPassService {

  constructor(
    private db: AngularFireDatabase
  ) { }

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
}
