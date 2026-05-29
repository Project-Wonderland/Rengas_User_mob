import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Variant {
  sku: string;
  uomLabel: string;
  unitSizeText: string;
  sellingPrice: number;
  isActive: boolean;
}

export interface Product {
  productId: number;
  productName: string;
  categoryName: string;
  variants: Variant[];
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
  @Input() selectedVariants: Record<number, string> = {}; // productId -> sku mapping

  @Output() menuOpen = new EventEmitter<void>();
  @Output() screenChange = new EventEmitter<string>();
  @Output() setCat = new EventEmitter<string>();
  @Output() setSearch = new EventEmitter<string>();
  @Output() selectVariant = new EventEmitter<{productId: number, sku: string}>();
  @Output() incrementQty = new EventEmitter<string>(); // emit sku
  @Output() decrementQty = new EventEmitter<string>(); // emit sku

  onMenuOpen(): void { this.menuOpen.emit(); }
  onGo(screen: string): void { this.screenChange.emit(screen); }
  onSetCat(cat: string): void { this.setCat.emit(cat); }
  onSetSearch(val: string): void { this.setSearch.emit(val); }
  onSetVariant(productId: number, sku: string): void { this.selectVariant.emit({ productId, sku }); }
  onIncrementQty(sku: string): void { this.incrementQty.emit(sku); }
  onDecrementQty(sku: string): void { this.decrementQty.emit(sku); }

  getSelectedVariant(product: Product): Variant {
    const selectedSku = this.selectedVariants[product.productId];
    if (selectedSku) {
      const found = product.variants.find(v => v.sku === selectedSku);
      if (found) return found;
    }
    return product.variants[0]; // fallback to first variant
  }

  money(value: number): string {
    return `RM ${Number(value || 0).toFixed(2)}`;
  }
}
