import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../order-history/order-history.component';
import { Customer } from '../order-summary-form/order-summary-form.component';

@Component({
  selector: 'app-order-details-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-details-view.component.html',
  styleUrls: ['./order-details-view.component.css']
})
export class OrderDetailsViewComponent {
  @Input() isActive = false;
  @Input() order: Order | null = null;
  @Input() demoCustomer!: Customer;
  
  @Output() screenChange = new EventEmitter<string>();

  onGo(screen: string): void { this.screenChange.emit(screen); }

  money(value: number): string {
    return `RM ${Number(value || 0).toFixed(2)}`;
  }
}
