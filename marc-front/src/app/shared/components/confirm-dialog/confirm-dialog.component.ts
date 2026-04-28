import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() confirmText = 'Eliminar';
  @Input() cancelText = 'Cancelar';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    event.preventDefault();
    this.cancel.emit();
  }

  onBackdropClick(): void {
    this.cancel.emit();
  }

  onDialogClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onCancelClick(): void {
    this.cancel.emit();
  }

  onConfirmClick(): void {
    this.confirm.emit();
  }
}
