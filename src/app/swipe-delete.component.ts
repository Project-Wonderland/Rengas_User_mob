import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-swipe-delete',
  standalone: true,
  template: `
    <div
      class="swipe-wrap {{ className }}"
      [class.disabled]="disabled"
      (mousedown)="begin($event.clientX)"
      (mousemove)="move($event.clientX)"
      (mouseup)="end()"
      (mouseleave)="end()"
      (touchstart)="begin($any($event.touches)[0].clientX)"
      (touchmove)="move($any($event.touches)[0].clientX)"
      (touchend)="end()"
    > 
      <button class="swipe-delete" type="button" (click)="delete.emit()">Delete</button>
      <div class="swipe-content" [style.transform]="transform"> <ng-content></ng-content> </div>
    </div>
  `
})
export class SwipeDeleteComponent {
  @Input() className = '';
  @Input() disabled = false;
  @Output() delete = new EventEmitter<void>();

  dragX = 0;
  startX: number | null = null;

  get transform(): string {
    const offset = Math.min(0, Math.max(-96, this.dragX));
    return `translateX(${offset}px)`;
  }

  begin(x: number): void {
    if (!this.disabled) {
      this.startX = x;
    }
  }

  move(x: number): void {
    if (this.disabled || this.startX === null) {
      return;
    }
    this.dragX = Math.min(0, x - this.startX);
  }

  end(): void {
    if (!this.disabled && this.dragX < -58) {
      this.delete.emit();
    }
    this.dragX = 0;
    this.startX = null;
  }
}
