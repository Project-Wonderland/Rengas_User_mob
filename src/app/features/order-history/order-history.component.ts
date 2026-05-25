import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwipeDeleteComponent } from '../../swipe-delete.component';

export interface OrderLine {
  id: string;
  qty: number;
  name: string;
  code: string;
  uom: string;
  price: number;
}

export interface Order {
  no: string;
  date: string;
  items: number;
  total: number;
  status: string;
  lines: OrderLine[];
  name: string;
  phone: string;
  address: string;
  notes: string;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, SwipeDeleteComponent],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent {
  @Input() isActive = false;
  @Input() orders: Order[] = [];
  
  @Output() screenChange = new EventEmitter<string>();
  @Output() deleteOrder = new EventEmitter<string>();
  @Output() selectOrder = new EventEmitter<Order>();

  onGo(screen: string): void { this.screenChange.emit(screen); }
  onDeleteOrder(no: string): void { this.deleteOrder.emit(no); }
  onSelectOrder(order: Order): void { this.selectOrder.emit(order); }

  money(value: number): string {
    return `RM ${Number(value || 0).toFixed(2)}`;
  }
}
