import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.css']
})
export class OrderSuccessComponent {
  @Input() isActive = false;
  @Input() successSpans: number[] = Array.from({ length: 18 });
  
  @Output() screenChange = new EventEmitter<string>();

  onGo(screen: string): void { this.screenChange.emit(screen); }
}
