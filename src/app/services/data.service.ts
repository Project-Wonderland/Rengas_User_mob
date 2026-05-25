import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../features/product-catalog/product-catalog.component';
import { Order, OrderLine } from '../features/order-history/order-history.component';
import { Customer } from '../features/order-summary-form/order-summary-form.component';

const storageKey = 'renga_mobile_orders_v1';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  getDemoCustomer(): Customer {
    return {
      name: 'Demo Customer',
      phone: '0123456789',
      address: 'No. 12, Jalan Demo, Kuala Lumpur',
      notes: 'Demo order'
    };
  }

  getProducts(): Observable<Product[]> {
    try {
      const sync = localStorage.getItem('rengaCatalogueProducts');
      const parsed = sync ? JSON.parse(sync) : null;
      if (Array.isArray(parsed) && parsed.length) {
        return of(parsed.map((p: any, index: number) => ({
          id: index + 1,
          cat: p.cat || p.category || 'All',
          name: p.name || p.product_name || 'Product',
          code: p.code || p.item_code || '-',
          uom: p.uom || p.UOM || '-',
          price: Number(p.price || p.rate || 0)
        })));
      }
    } catch {
      return of(this.getDefaultProducts());
    }
    return of(this.getDefaultProducts());
  }

  getOrders(): Observable<Order[]> {
    try {
      const orders = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return of(Array.isArray(orders) ? orders : []);
    } catch {
      return of([]);
    }
  }

  saveOrders(orders: Order[]): Observable<boolean> {
    localStorage.setItem(storageKey, JSON.stringify(orders));
    return of(true);
  }

  private getDefaultProducts(): Product[] {
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
}
