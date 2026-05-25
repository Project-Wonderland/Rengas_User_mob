import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../product-catalog/product-catalog.component';
import { SwipeDeleteComponent } from '../../swipe-delete.component';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, SwipeDeleteComponent],
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent {
  @Input() logo!: string;
  @Input() isActive = false;
  @Input() cartRows: { product: Product, qty: number }[] = [];
  @Input() totals = { items: 0, total: 0 };
  
  @Output() screenChange = new EventEmitter<string>();
  @Output() clearCart = new EventEmitter<void>();
  @Output() changeQty = new EventEmitter<{id: number, delta: number}>();
  @Output() removeFromCart = new EventEmitter<number>();

  cartSearch = '';

  get filteredCartRows() {
    const q = this.cartSearch.toLowerCase();
    return this.cartRows.filter(row => 
      `${row.product.name} ${row.product.code} ${row.product.uom}`.toLowerCase().includes(q)
    );
  }

  onGo(screen: string): void { this.screenChange.emit(screen); }
  onClearCart(): void { this.clearCart.emit(); }
  onChangeQty(id: number, delta: number): void { this.changeQty.emit({ id, delta }); }
  onRemoveFromCart(id: number): void { this.removeFromCart.emit(id); }

  money(value: number): string {
    return `RM ${Number(value || 0).toFixed(2)}`;
  }
}
