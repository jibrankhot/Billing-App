import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private readonly defaultState: ModalState = {
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  };

  private readonly modalSubject =
    new BehaviorSubject<ModalState>(this.defaultState);

  readonly modal$ =
    this.modalSubject.asObservable();

  open(
    title: string,
    message: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ): void {
    this.modalSubject.next({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText
    });
  }

  close(): void {
    this.modalSubject.next({
      ...this.defaultState
    });
  }

  getState(): ModalState {
    return this.modalSubject.value;
  }
}