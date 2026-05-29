import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-explorer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-explorer.component.html',
  styleUrls: ['./category-explorer.component.css']
})
export class CategoryExplorerComponent {
  @Input() logo!: string;
  @Input() isActive = false;
  @Input() products: any[] = [];
  @Input() cats: string[] = [];
  @Input() totals = { items: 0, total: 0 };
  
  @Output() menuOpen = new EventEmitter<void>();
  @Output() screenChange = new EventEmitter<string>();
  @Output() setCat = new EventEmitter<string>();

  catSearch = '';

  get visibleCats(): string[] {
    return this.cats.filter(cat => cat !== 'All' && cat.toLowerCase().includes(this.catSearch.toLowerCase()));
  }

  getProductCount(cat: string): number {
    return this.products.filter(p => p.categoryName === cat).length;
  }

  onMenuOpen(): void { this.menuOpen.emit(); }
  onGo(screen: string): void { this.screenChange.emit(screen); }
  onSetCat(cat: string): void { this.setCat.emit(cat); }
}
