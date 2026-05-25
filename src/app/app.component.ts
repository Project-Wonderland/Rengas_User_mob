import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { App as CapacitorApp } from '@capacitor/app';

import { SecurityLockComponent } from './features/security-lock/security-lock.component';
import { LoginPortalComponent } from './features/login-portal/login-portal.component';
import { ProductCatalogComponent, Product } from './features/product-catalog/product-catalog.component';
import { CategoryExplorerComponent } from './features/category-explorer/category-explorer.component';
import { ShoppingCartComponent } from './features/shopping-cart/shopping-cart.component';
import { OrderSummaryFormComponent, Customer } from './features/order-summary-form/order-summary-form.component';
import { OrderHistoryComponent, Order, OrderLine } from './features/order-history/order-history.component';
import { OrderDetailsViewComponent } from './features/order-details-view/order-details-view.component';
import { OrderSuccessComponent } from './features/order-success/order-success.component';

import { DataService } from './services/data.service';

const securityKey = 'rengas_security_enabled';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    SecurityLockComponent,
    LoginPortalComponent,
    ProductCatalogComponent,
    CategoryExplorerComponent,
    ShoppingCartComponent,
    OrderSummaryFormComponent,
    OrderHistoryComponent,
    OrderDetailsViewComponent,
    OrderSuccessComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  demoCustomer!: Customer;

  logo = '/logo.png';
  orderSuccessSound = '/order-success.mp3';
  screen = localStorage.getItem(securityKey) === '1' ? 'security' : 'login';
  showSplash = true;
  products: Product[] = [];
  activeCat = 'All';
  cart: Record<string, number> = {};
  selectedUoms: Record<number, string> = {};
  search = '';
  menuOpen = false;
  orders: Order[] = [];
  customer: Customer = { name: '', phone: '', address: '', notes: '' };
  selectedOrder: Order | null = null;
  confirmLogout = false;
  securityEnabled = localStorage.getItem(securityKey) === '1';
  backButtonHandle: { remove(): void } | null = null;
  successSpans: number[] = Array.from({ length: 18 }).map((_, i) => i);

  constructor(private dataService: DataService) {
    this.demoCustomer = this.dataService.getDemoCustomer();
    this.customer = { ...this.demoCustomer };
  }

  ngOnInit(): void {
    window.setTimeout(() => this.showSplash = false, 1800);
    this.registerBackButton();
    
    // Fetch data using Observables
    this.dataService.getProducts().subscribe(products => {
      this.products = products;
    });
    
    this.dataService.getOrders().subscribe(orders => {
      this.orders = orders;
    });
  }

  ngOnDestroy(): void {
    this.backButtonHandle?.remove();
  }

  get cats(): string[] {
    return ['All', ...new Set(this.products.map(p => p.cat || 'All'))];
  }

  get filteredProducts(): Product[] {
    const q = this.search.toLowerCase();
    return this.products.filter(p => {
      const inCat = this.activeCat === 'All' || p.cat === this.activeCat;
      const text = `${p.name} ${p.code} ${p.uom} ${p.price} ${p.cat}`.toLowerCase();
      return inCat && text.includes(q);
    });
  }

  get totals() {
    const entries = Object.entries(this.cart);
    return {
      items: entries.reduce((sum, [, qty]) => sum + qty, 0),
      total: entries.reduce((sum, [id, qty]) => {
        const product = this.products.find(p => String(p.id) === String(id));
        return sum + (product?.price || 0) * qty;
      }, 0)
    };
  }

  get cartRows(): Array<{ product: Product; qty: number }> {
    return Object.entries(this.cart)
      .map(([id, qty]) => ({ product: this.products.find(p => String(p.id) === String(id)), qty }))
      .filter((row): row is { product: Product; qty: number } => Boolean(row.product));
  }

  go(name: string): void {
    if (name === 'summary' && !this.totals.items) {
      alert('Please add products first.');
      this.screen = 'products';
      return;
    }
    if (name === 'summary') {
      this.customer = {
        name: this.customer.name || this.demoCustomer.name,
        phone: this.customer.phone || this.demoCustomer.phone,
        address: this.customer.address || this.demoCustomer.address,
        notes: this.customer.notes || this.demoCustomer.notes
      };
    }
    this.menuOpen = false;
    this.screen = name;
  }

  logout(): void {
    this.confirmLogout = false;
    this.menuOpen = false;
    this.cart = {};
    CapacitorApp.exitApp().catch(() => {
      this.screen = this.securityEnabled ? 'security' : 'login';
    });
  }

  onLogin(credentials: {user: string, pass: string}): void {
    const user = credentials.user.trim();
    const pass = credentials.pass;
    if (user !== 'customer01' || pass !== '123456') {
      alert('Invalid username or password.');
      return;
    }
    if (this.securityEnabled) {
      this.screen = 'security';
      return;
    }
    this.go('products');
  }

  unlockSecurity(): void {
    this.go('products');
  }

  toggleSecurity(checked: boolean): void {
    this.securityEnabled = checked;
    localStorage.setItem(securityKey, checked ? '1' : '0');
  }

  setCat(cat: string): void {
    this.activeCat = cat;
    this.search = '';
    this.go('products');
  }

  setSearch(value: string): void {
    this.search = value;
    if (value.trim()) {
      this.activeCat = 'All';
    }
  }

  changeQty(data: {id: number, delta: number}): void {
    const {id, delta} = data;
    const nextQty = Math.max(0, (this.cart[id] || 0) + delta);
    const next = { ...this.cart };
    if (nextQty) {
      next[id] = nextQty;
    } else {
      delete next[id];
    }
    this.cart = next;
  }

  setUom(data: {id: number, uom: string}): void {
    this.selectedUoms[data.id] = data.uom;
  }

  incrementQty(product: Product): void {
    this.changeQty({id: product.id, delta: 1});
  }

  decrementQty(product: Product): void {
    this.changeQty({id: product.id, delta: -1});
  }

  clearCart(): void {
    this.cart = {};
  }

  removeFromCart(id: number): void {
    const next = { ...this.cart };
    delete next[id];
    this.cart = next;
  }

  deleteOrder(orderNo: string): void {
    const nextOrders = this.orders.filter(order => order.no !== orderNo);
    this.dataService.saveOrders(nextOrders).subscribe(success => {
      if (success) {
        this.orders = nextOrders;
      }
    });
  }

  submitOrder(): void {
    if (!this.totals.items) {
      alert('Please add products first.');
      this.go('products');
      return;
    }
    if (!this.customer.name.trim() || !this.customer.phone.trim() || !this.customer.address.trim()) {
      alert('Please fill customer name, phone and address.');
      return;
    }
    const nextOrders: Order[] = [
      {
        no: `RO-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-GB'),
        items: this.totals.items,
        total: this.totals.total,
        status: 'Submitted',
        lines: Object.entries(this.cart).map(([id, qty]) => {
          const product = this.products.find(p => String(p.id) === String(id));
          return {
            id,
            qty,
            name: product?.name || 'Product',
            code: product?.code || '-',
            uom: product?.uom || '-',
            price: product?.price || 0
          };
        }),
        ...this.customer
      },
      ...this.orders
    ];
    
    this.dataService.saveOrders(nextOrders).subscribe(success => {
      if (success) {
        this.playSuccessSound();
        this.orders = nextOrders;
        this.cart = {};
        this.customer = { ...this.demoCustomer };
        this.go('success');
      }
    });
  }

  money(value: number): string {
    return `RM ${Number(value || 0).toFixed(2)}`;
  }

  private playSuccessSound(): void {
    try {
      const audio = new Audio(this.orderSuccessSound);
      audio.volume = 0.9;
      audio.play().catch(() => {});
    } catch {
      // Audio is a progressive enhancement.
    }
  }

  private async registerBackButton(): Promise<void> {
    this.backButtonHandle = await CapacitorApp.addListener('backButton', () => {
      if (this.confirmLogout) {
        this.confirmLogout = false;
        return;
      }
      if (this.menuOpen) {
        this.menuOpen = false;
        return;
      }
      if (['products', 'login', 'security'].includes(this.screen)) {
        this.confirmLogout = true;
        return;
      }
      if (this.screen === 'summary') {
        this.screen = 'cart';
        return;
      }
      if (this.screen === 'orderDetails') {
        this.screen = 'orders';
        return;
      }
      this.screen = 'products';
    });
  }
}
