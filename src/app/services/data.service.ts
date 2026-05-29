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
        // Fallback for old data if needed, or just return it if it matches the new format.
        // Assuming parsed is the new format or we just overwrite it with default.
        return of(parsed as Product[]);
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
  {
    "productId": 1,
    "productName": "TEPUNG KENTUCKY HOT & SPICY",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TEP021", "uomLabel": "1KG", "unitSizeText": "1 PKT", "sellingPrice": 7.20, "isActive": true },
      { "sku": "TKE SPICY", "uomLabel": "6'S * 200GM", "unitSizeText": "1 X6", "sellingPrice": 10.60, "isActive": true },
      { "sku": "TEP022", "uomLabel": "10'S * 200GM", "unitSizeText": "1 PKT", "sellingPrice": 17.20, "isActive": true },
      { "sku": "TKE SPICY_20", "uomLabel": "20'S * 200GM", "unitSizeText": "1 X6", "sellingPrice": 33.60, "isActive": true },
      { "sku": "TEP023", "uomLabel": "4KG", "unitSizeText": "1 PKT", "sellingPrice": 27.20, "isActive": true },
      { "sku": "TKE SPICY_40", "uomLabel": "40'S * 200GM", "unitSizeText": "1 X6", "sellingPrice": 65.60, "isActive": true }
    ]
  },
  {
    "productId": 2,
    "productName": "RENGA'S TEPUNG SUJI",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TEP024", "uomLabel": "25KG", "unitSizeText": "1 GUNI", "sellingPrice": 98.00, "isActive": true }
    ]
  },
  {
    "productId": 3,
    "productName": "TEPUNG GANDUM CAP ROS",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TEPROS1", "uomLabel": "850GM", "unitSizeText": "1 PKT", "sellingPrice": 2.60, "isActive": true }
    ]
  },
  {
    "productId": 4,
    "productName": "TEPUNG GANDUM BLUE KEY",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TGRC", "uomLabel": "25KG", "unitSizeText": "1 GUNI", "sellingPrice": 67.50, "isActive": true }
    ]
  },
  {
    "productId": 5,
    "productName": "THAI AIR LIMAU",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TH500", "uomLabel": "500ML", "unitSizeText": "1 BTL", "sellingPrice": 2.20, "isActive": true },
      { "sku": "TH500M", "uomLabel": "24'S * 500ML", "unitSizeText": "1 BOX", "sellingPrice": 38.00, "isActive": true }
    ]
  },
  {
    "productId": 6,
    "productName": "TEPUNG JAGUNG STAR",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TJP001", "uomLabel": "400GM", "unitSizeText": "1 PKT", "sellingPrice": 1.90, "isActive": true },
      { "sku": "TJ", "uomLabel": "20'S * 400GM", "unitSizeText": "1 BOX", "sellingPrice": 33.00, "isActive": true }
    ]
  },
  {
    "productId": 7,
    "productName": "TEPUNG JAGUNG PIN XIANG",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TJP", "uomLabel": "400GM", "unitSizeText": "1 PKT", "sellingPrice": 1.90, "isActive": true },
      { "sku": "TJPI", "uomLabel": "20'S * 400GM", "unitSizeText": "1 BOX", "sellingPrice": 34.70, "isActive": true }
    ]
  },
  {
    "productId": 8,
    "productName": "TEPUNG JAGUNG CAP 3 KAMBING",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TJS25", "uomLabel": "25KG", "unitSizeText": "1 BAG", "sellingPrice": 52.90, "isActive": true }
    ]
  },
  {
    "productId": 9,
    "productName": "TEPUNG KASTARD SANG KANCIL",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TKASP", "uomLabel": "250GM", "unitSizeText": "1 PKT", "sellingPrice": 1.80, "isActive": true }
    ]
  },
  {
    "productId": 10,
    "productName": "TEPUNG KENTUCKY ORIGINAL",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TKE", "uomLabel": "6'S * 200GM", "unitSizeText": "1 X6", "sellingPrice": 9.90, "isActive": true },
      { "sku": "TKE004", "uomLabel": "1KG", "unitSizeText": "1 PKT", "sellingPrice": 6.60, "isActive": true }
    ]
  },
  {
    "productId": 11,
    "productName": "TEPUNG PULUT HITAM",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TKE002", "uomLabel": "200GM", "unitSizeText": "1 PKT", "sellingPrice": 3.20, "isActive": true }
    ]
  },
  {
    "productId": 12,
    "productName": "TEPUNG KEK BLUE KEY",
    "categoryName": "FLOUR & SUGAR",
    "variants": [
      { "sku": "TKEK", "uomLabel": "1KG", "unitSizeText": "1 PKT", "sellingPrice": 5.00, "isActive": true }
    ]
  }
];
  }
}
