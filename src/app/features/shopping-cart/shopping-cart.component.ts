import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, Variant } from '../product-catalog/product-catalog.component';
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
  @Input() cartRows: { product: Product, variant: Variant, qty: number }[] = [];
  @Input() totals = { items: 0, total: 0 };
  
  @Output() screenChange = new EventEmitter<string>();
  @Output() clearCart = new EventEmitter<void>();
  @Output() changeQty = new EventEmitter<{sku: string, delta: number}>();
  @Output() removeFromCart = new EventEmitter<string>();

  cartSearch = '';

  get filteredCartRows() {
    const q = this.cartSearch.toLowerCase();
    return this.cartRows.filter(row => 
      `${row.product.productName} ${row.variant.sku} ${row.variant.uomLabel}`.toLowerCase().includes(q)
    );
  }

  onGo(screen: string): void { this.screenChange.emit(screen); }
  onClearCart(): void { this.clearCart.emit(); }
  onChangeQty(sku: string, delta: number): void { this.changeQty.emit({ sku, delta }); }
  onRemoveFromCart(sku: string): void { this.removeFromCart.emit(sku); }

  money(value: number): string {
    return `RM ${Number(value || 0).toFixed(2)}`;
  }
}
