import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Product {
  id: number;
  cat: string;
  name: string;
  code: string;
  uom: string;
  price: number;
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.css']
})
export class ProductCatalogComponent {
  @Input() logo!: string;
  @Input() isActive = false;
  @Input() cats: string[] = [];
  @Input() activeCat = 'All';
  @Input() filteredProducts: Product[] = [];
  @Input() cart: Record<string, number> = {};
  @Input() search = '';
  @Input() totals = { items: 0, total: 0 };
  @Input() selectedUoms: Record<number, string> = {};

  @Output() menuOpen = new EventEmitter<void>();
  @Output() screenChange = new EventEmitter<string>();
  @Output() setCat = new EventEmitter<string>();
  @Output() setSearch = new EventEmitter<string>();
  @Output() setUom = new EventEmitter<{id: number, uom: string}>();
  @Output() incrementQty = new EventEmitter<Product>();
  @Output() decrementQty = new EventEmitter<Product>();

  onMenuOpen(): void { this.menuOpen.emit(); }
  onGo(screen: string): void { this.screenChange.emit(screen); }
  onSetCat(cat: string): void { this.setCat.emit(cat); }
  onSetSearch(val: string): void { this.setSearch.emit(val); }
  onSetUom(id: number, uom: string): void { this.setUom.emit({ id, uom }); }
  onIncrementQty(product: Product): void { this.incrementQty.emit(product); }
  onDecrementQty(product: Product): void { this.decrementQty.emit(product); }

  getUom(productId: number, defaultUom: string): string {
    return this.selectedUoms[productId] || defaultUom;
  }

  money(value: number): string {
    return `RM ${Number(value || 0).toFixed(2)}`;
  }
}
