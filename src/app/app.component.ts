import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { App as CapacitorApp } from '@capacitor/app';
import { SwipeDeleteComponent } from './swipe-delete.component';

const storageKey = 'renga_mobile_orders_v1';
const securityKey = 'rengas_security_enabled';

interface Product {
  id: number;
  cat: string;
  name: string;
  code: string;
  uom: string;
  price: number;
}

interface Customer {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

interface OrderLine {
  id: string;
  qty: number;
  name: string;
  code: string;
  uom: string;
  price: number;
}

interface Order {
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
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, SwipeDeleteComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  readonly demoCustomer: Customer = {
    name: 'Demo Customer',
    phone: '0123456789',
    address: 'No. 12, Jalan Demo, Kuala Lumpur',
    notes: 'Demo order'
  };

  logo = '/logo.png';
  orderSuccessSound = '/order-success.mp3';
  screen = localStorage.getItem(securityKey) === '1' ? 'security' : 'login';
  showSplash = true;
  products: Product[] = this.readProducts();
  activeCat = 'All';
  cart: Record<string, number> = {};
  selectedUoms: Record<number, string> = {};
  search = '';
  catSearch = '';
  menuOpen = false;
  orders: Order[] = this.readOrders();
  customer: Customer = { ...this.demoCustomer };
  cartSearch = '';
  selectedOrder: Order | null = null;
  confirmLogout = false;
  securityEnabled = localStorage.getItem(securityKey) === '1';
  loginUser = 'customer01';
  loginPass = '123456';
  backButtonHandle: { remove(): void } | null = null;
  successSpans = Array.from({ length: 18 });

  ngOnInit(): void {
    window.setTimeout(() => this.showSplash = false, 1800);
    this.registerBackButton();
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

  get visibleCats(): string[] {
    return this.cats.filter(cat => cat !== 'All' && cat.toLowerCase().includes(this.catSearch.toLowerCase()));
  }

  get cartRows(): Array<{ product: Product; qty: number }> {
    const q = this.cartSearch.toLowerCase();
    return Object.entries(this.cart)
      .map(([id, qty]) => ({ product: this.products.find(p => String(p.id) === String(id)), qty }))
      .filter((row): row is { product: Product; qty: number } => Boolean(row.product))
      .filter(row => `${row.product.name} ${row.product.code} ${row.product.uom}`.toLowerCase().includes(q));
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

  login(): void {
    const user = this.loginUser.trim();
    const pass = this.loginPass;
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

  changeQty(id: number, delta: number): void {
    const nextQty = Math.max(0, (this.cart[id] || 0) + delta);
    const next = { ...this.cart };
    if (nextQty) {
      next[id] = nextQty;
    } else {
      delete next[id];
    }
    this.cart = next;
  }

  getUom(productId: number, defaultUom: string): string {
    return this.selectedUoms[productId] || defaultUom;
  }

  setUom(productId: number, uom: string): void {
    this.selectedUoms[productId] = uom;
  }

  incrementQty(product: Product): void {
    this.changeQty(product.id, 1);
  }

  decrementQty(product: Product): void {
    this.changeQty(product.id, -1);
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
    localStorage.setItem(storageKey, JSON.stringify(nextOrders));
    this.orders = nextOrders;
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
    localStorage.setItem(storageKey, JSON.stringify(nextOrders));
    this.playSuccessSound();
    this.orders = nextOrders;
    this.cart = {};
    this.customer = { ...this.demoCustomer };
    this.go('success');
  }

  money(value: number): string {
    return `RM ${Number(value || 0).toFixed(2)}`;
  }

  private readProducts(): Product[] {
    try {
      const sync = localStorage.getItem('rengaCatalogueProducts');
      const parsed = sync ? JSON.parse(sync) : null;
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((p: any, index: number) => ({
          id: index + 1,
          cat: p.cat || p.category || 'All',
          name: p.name || p.product_name || 'Product',
          code: p.code || p.item_code || '-',
          uom: p.uom || p.UOM || '-',
          price: Number(p.price || p.rate || 0)
        }));
      }
    } catch {
      return this.defaultProducts();
    }
    return this.defaultProducts();
  }

  private readOrders(): Order[] {
    try {
      const orders = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(orders) ? orders : [];
    } catch {
      return [];
    }
  }

  private defaultProducts(): Product[] {
    return [
      { id: 1, cat: 'Vilaku', name: "AGAL VILAKU WHITE (S) 500'S", code: 'AGW5444444444444443', uom: 'BOX', price: 50 },
      { id: 2, cat: 'Vilaku', name: "AGAL VILAKU WITH WAX 4'S", code: 'AGW5444444444444444', uom: 'BOX', price: 45 },
      { id: 3, cat: 'Vilaku', name: "POT VILAKKU 7'S MIX", code: 'PVKM544444444444445', uom: 'PACK', price: 60 },
      { id: 4, cat: 'Camphor', name: 'CAMPHOR (100 GMS)', code: 'CAM1005444444444446', uom: 'BOX', price: 15 },
      { id: 5, cat: 'Incense', name: 'INCENSE STICKS (CYCLE)', code: 'INCYC5444444444447', uom: 'BOX', price: 8.5 },
      { id: 6, cat: 'Oil', name: 'POOJA OIL 1 LTR', code: 'OIL1L5444444444448', uom: 'BOTTLE', price: 12 },
      { id: 7, cat: 'Deepam', name: 'KUBERA DEEPAM', code: 'KUB5444444444449', uom: 'PCS', price: 18 },
      { id: 8, cat: 'Brass', name: 'BRASS VILAKU BIG', code: 'BRV5444444444450', uom: 'PCS', price: 85 },
      { id: 9, cat: 'Grocery', name: 'ISPAHANI PORI 400GM', code: 'ISP4005444444444451', uom: 'PKT', price: 6.8 },
      { id: 10, cat: 'Grocery', name: 'ROSE WATER 300ML', code: 'RW3005444444444452', uom: 'BOTTLE', price: 5.2 }
    ];
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
