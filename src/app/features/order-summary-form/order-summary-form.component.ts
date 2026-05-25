import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Customer {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

@Component({
  selector: 'app-order-summary-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-summary-form.component.html',
  styleUrls: ['./order-summary-form.component.css']
})
export class OrderSummaryFormComponent {
  @Input() isActive = false;
  @Input() customer: Customer = { name: '', phone: '', address: '', notes: '' };
  @Input() totals = { items: 0, total: 0 };
  
  @Output() screenChange = new EventEmitter<string>();
  @Output() submitOrder = new EventEmitter<void>();
  @Output() customerChange = new EventEmitter<Customer>();

  onGo(screen: string): void { this.screenChange.emit(screen); }
  onSubmitOrder(): void { this.submitOrder.emit(); }
  onCustomerChange(): void { this.customerChange.emit(this.customer); }

  money(value: number): string {
    return `RM ${Number(value || 0).toFixed(2)}`;
  }
}
