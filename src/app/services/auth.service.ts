import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUserSubject: BehaviorSubject<UserModel>;

  get currentUserValue(): UserModel {
    return this.currentUserSubject?.value || null;
  }

  set currentUserValue(user: UserModel) {
    this.currentUserSubject.next(user);
  }

  constructor() {
    this.currentUserSubject = new BehaviorSubject<UserModel>(undefined!);
  }

  setUserDetails(cognitoUser: any) {
    this.currentUserSubject.next(cognitoUser);
  }
}
