import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import logo from './assets/logo.png';
import orderSuccessSound from './assets/order-success.mp3';

const storageKey = 'renga_mobile_orders_v1';
const securityKey = 'rengas_security_enabled';

type Product = {
  id: number;
  cat: string;
  name: string;
  code: string;
  uom: string;
  price: number;
};

type Customer = {
  name: string;
  phone: string;
  address: string;
  notes: string;
};

type OrderLine = {
  id: string;
  qty: number;
  name: string;
  code: string;
  uom: string;
  price: number;
};

type Order = {
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
};

const demoCustomer: Customer = {
  name: 'Demo Customer',
  phone: '0123456789',
  address: 'No. 12, Jalan Demo, Kuala Lumpur',
  notes: 'Demo order'
};

const money = (value: number) => `RM ${Number(value || 0).toFixed(2)}`;

function readProducts(): Product[] {
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
    return defaultProducts;
  }
  return defaultProducts;
}

const defaultProducts: Product[] = [
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

function readOrders(): Order[] {
  try {
    const orders = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

function App() {
  const [screen, setScreen] = useState(localStorage.getItem(securityKey) === '1' ? 'security' : 'login');
  const [showSplash, setShowSplash] = useState(true);
  const [products] = useState<Product[]>(readProducts);
  const [activeCat, setActiveCat] = useState('All');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(readOrders);
  const [customer, setCustomer] = useState<Customer>(demoCustomer);
  const [cartSearch, setCartSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [securityEnabled, setSecurityEnabled] = useState(localStorage.getItem(securityKey) === '1');

  const cats = useMemo(() => ['All', ...new Set(products.map(p => p.cat || 'All'))], [products]);
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      const inCat = activeCat === 'All' || p.cat === activeCat;
      const text = `${p.name} ${p.code} ${p.uom} ${p.price} ${p.cat}`.toLowerCase();
      return inCat && text.includes(q);
    });
  }, [activeCat, products, search]);
  const totals = useMemo(() => {
    const entries = Object.entries(cart);
    return {
      items: entries.reduce((sum, [, qty]) => sum + qty, 0),
      total: entries.reduce((sum, [id, qty]) => {
        const product = products.find(p => String(p.id) === String(id));
        return sum + (product?.price || 0) * qty;
      }, 0)
    };
  }, [cart, products]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let handle: { remove(): void } | undefined;
    CapacitorApp.addListener('backButton', () => {
      if (confirmLogout) {
        setConfirmLogout(false);
        return;
      }
      if (menuOpen) {
        setMenuOpen(false);
        return;
      }
      if (screen === 'products' || screen === 'login' || screen === 'security') {
        setConfirmLogout(true);
        return;
      }
      if (screen === 'summary') {
        setScreen('cart');
        return;
      }
      if (screen === 'orderDetails') {
        setScreen('orders');
        return;
      }
      setScreen('products');
    }).then(listener => {
      handle = listener;
    });
    return () => handle?.remove();
  }, [confirmLogout, menuOpen, screen]);

  const go = (name: string) => {
    if (name === 'summary' && !totals.items) {
      alert('Please add products first.');
      setScreen('products');
      return;
    }
    if (name === 'summary') {
      setCustomer(current => ({
        name: current.name || demoCustomer.name,
        phone: current.phone || demoCustomer.phone,
        address: current.address || demoCustomer.address,
        notes: current.notes || demoCustomer.notes
      }));
    }
    setMenuOpen(false);
    setScreen(name);
  };

  const logout = () => {
    setConfirmLogout(false);
    setMenuOpen(false);
    setCart({});
    CapacitorApp.exitApp().catch(() => {
      setScreen(securityEnabled ? 'security' : 'login');
    });
  };

  const login = () => {
    if (loginUser.trim() !== 'customer01' || loginPass !== '123456') {
      alert('Invalid username or password.');
      return;
    }
    if (securityEnabled) {
      setScreen('security');
      return;
    }
    go('products');
  };

  const unlockSecurity = () => go('products');

  const toggleSecurity = (checked: boolean) => {
    setSecurityEnabled(checked);
    localStorage.setItem(securityKey, checked ? '1' : '0');
  };

  const setCat = (cat: string) => {
    setActiveCat(cat);
    setSearch('');
    go('products');
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    if (value.trim()) setActiveCat('All');
  };

  const changeQty = (id: number, delta: number) => {
    setCart(current => {
      const nextQty = Math.max(0, (current[id] || 0) + delta);
      const next = { ...current };
      if (nextQty) next[id] = nextQty;
      else delete next[id];
      return next;
    });
  };

  const clearCart = () => setCart({});
  const removeFromCart = (id: number) => {
    setCart(current => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const deleteOrder = (orderNo: string) => {
    const nextOrders = orders.filter(order => order.no !== orderNo);
    localStorage.setItem(storageKey, JSON.stringify(nextOrders));
    setOrders(nextOrders);
  };

  const submitOrder = () => {
    if (!totals.items) {
      alert('Please add products first.');
      go('products');
      return;
    }
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      alert('Please fill customer name, phone and address.');
      return;
    }
    const nextOrders: Order[] = [
      {
        no: `RO-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-GB'),
        items: totals.items,
        total: totals.total,
        status: 'Submitted',
        lines: Object.entries(cart).map(([id, qty]) => {
          const product = products.find(p => String(p.id) === String(id));
          return {
            id,
            qty,
            name: product?.name || 'Product',
            code: product?.code || '-',
            uom: product?.uom || '-',
            price: product?.price || 0
          };
        }),
        ...customer
      },
      ...orders
    ];
    localStorage.setItem(storageKey, JSON.stringify(nextOrders));
    playSuccessSound();
    setOrders(nextOrders);
    setCart({});
    setCustomer(demoCustomer);
    go('success');
  };

  return (
    <div className="app-shell">
      <main className="app" id="app">
        {showSplash && <AppSplash />}
        <SecurityScreen active={screen === 'security'} unlock={unlockSecurity} />
        <LoginScreen active={screen === 'login'} login={login} />
        <ProductsScreen
          active={screen === 'products'}
          activeCat={activeCat}
          cart={cart}
          cats={cats}
          changeQty={changeQty}
          filteredProducts={filteredProducts}
          go={go}
          search={search}
          setCat={setCat}
          setMenuOpen={setMenuOpen}
          setSearch={updateSearch}
          totals={totals}
        />
        <CategoriesScreen
          active={screen === 'categories'}
          catSearch={catSearch}
          cats={cats}
          products={products}
          setCat={setCat}
          setCatSearch={setCatSearch}
          setMenuOpen={setMenuOpen}
          totals={totals}
          go={go}
        />
        <CartScreen
          active={screen === 'cart'}
          cart={cart}
          changeQty={changeQty}
          clearCart={clearCart}
          cartSearch={cartSearch}
          go={go}
          products={products}
          removeFromCart={removeFromCart}
          setCartSearch={setCartSearch}
          totals={totals}
        />
        <SummaryScreen
          active={screen === 'summary'}
          customer={customer}
          go={go}
          setCustomer={setCustomer}
          submitOrder={submitOrder}
          totals={totals}
        />
        <OrdersScreen active={screen === 'orders'} deleteOrder={deleteOrder} go={go} orders={orders} setSelectedOrder={setSelectedOrder} />
        <OrderDetailsScreen active={screen === 'orderDetails'} go={go} order={selectedOrder} />
        <SuccessScreen active={screen === 'success'} go={go} />
        <Drawer menuOpen={menuOpen} close={() => setMenuOpen(false)} go={go} logout={() => setConfirmLogout(true)} securityEnabled={securityEnabled} toggleSecurity={toggleSecurity} />
        <GlobalStickyCart active={screen === 'products'} go={go} totals={totals} />
        <CartProceed active={screen === 'cart'} go={go} totals={totals} />
        <BottomNav active={screen} go={go} totals={totals} />
        <LogoutConfirm open={confirmLogout} cancel={() => setConfirmLogout(false)} confirm={logout} />
      </main>
    </div>
  );
}

function playSuccessSound() {
  try {
    const audio = new Audio(orderSuccessSound);
    audio.volume = 0.9;
    audio.play().catch(() => {});
  } catch {
    // Audio is a progressive enhancement.
  }
}

function AppSplash() {
  return (
    <div className="app-splash">
      <div className="splash-logo-wrap">
        <img src={logo} alt="RENGAS Logo" />
      </div>
      <div className="splash-loader"><i /></div>
    </div>
  );
}

function SecurityScreen({ active, unlock }: { active: boolean; unlock: () => void }) {
  return (
    <Screen active={active} className="security no-nav">
      <div className="login-card security-card">
        <img src={logo} className="login-logo" alt="RENGAS Logo" />
        <h1>RENGAS</h1>
        <p>Secure unlock</p>
        <label>Password</label>
        <input type="password" defaultValue="123456" autoComplete="current-password" />
        <button className="primary-btn" onClick={unlock}>UNLOCK</button>
        <button className="finger-btn" onClick={unlock}>⌾ Use Fingerprint</button>
      </div>
    </Screen>
  );
}

function Screen({ active, className = '', children }: { active: boolean; className?: string; children: ReactNode }) {
  return <section className={`screen ${className} ${active ? 'active' : ''}`}>{children}</section>;
}

function LoginScreen({ active, login }: { active: boolean; login: () => void }) {
  return (
    <Screen active={active} className="login no-nav">
      <div className="login-card">
        <img src={logo} className="login-logo" alt="RENGAS Logo" />
        <h1>RENGAS</h1>
        <p>Customer order portal</p>
        <label>Username</label>
        <input id="loginUser" defaultValue="customer01" autoComplete="username" />
        <label>Password</label>
        <input id="loginPass" type="password" defaultValue="123456" autoComplete="current-password" />
        <button className="primary-btn" onClick={login}>LOGIN</button>
        <small className="hint">Demo: customer01 / 123456</small>
      </div>
    </Screen>
  );
}

function Appbar({ title, left, right }: { title: string; left: ReactNode; right?: ReactNode }) {
  return (
    <header className="appbar">
      {left}
      <strong>{title}</strong>
      {right || <span />}
    </header>
  );
}

function CartButton({ go, totals, id = 'cartBadgeTop' }: { go: (name: string) => void; totals: { items: number }; id?: string }) {
  return (
    <button className="icon-btn cart-top" onClick={() => go('cart')} aria-label="Open cart">
      🛒<em id={id}>{totals.items}</em>
    </button>
  );
}

function ProductsScreen(props: any) {
  const { active, activeCat, cart, cats, changeQty, filteredProducts, go, search, setCat, setMenuOpen, setSearch, totals } = props;
  return (
    <Screen active={active} className="products">
      <Appbar
        title="RENGAS"
        left={<button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">☰</button>}
        right={<CartButton go={go} totals={totals} />}
      />
      <div className="content-pad">
        <div className="search"><span>🔍</span><input type="search" placeholder="Search name / code / UOM / price..." value={search} onInput={e => setSearch((e.target as HTMLInputElement).value)} onChange={e => setSearch((e.target as HTMLInputElement).value)} /></div>
        <div className="chips">
          {cats.map((cat: string) => <button key={cat} onClick={() => setCat(cat)} className={activeCat === cat ? 'active' : ''}>{cat}</button>)}
        </div>
        <div className="count-row"><b id="activeLabel">{activeCat === 'All' ? 'All Products' : `${activeCat} Products`}</b><small>{filteredProducts.length} items</small></div>
        <div className="list">
          {filteredProducts.length ? filteredProducts.map((product: Product, index: number) => (
            <ProductRow key={product.id} product={product} qty={cart[product.id] || 0} index={index} changeQty={changeQty} />
          )) : <div className="empty">No products found.</div>}
        </div>
      </div>
    </Screen>
  );
}

function ProductRow({ product, qty, index, changeQty }: { product: Product; qty: number; index: number; changeQty: (id: number, delta: number) => void }) {
  return (
    <div className="product" style={{ animationDelay: `${index * 0.025}s` }}>
      <img className="pimg" src={logo} alt="" />
      <div className="pmeta">
        <h3>{product.name}</h3>
        <p>Code: {product.code}</p>
        <p>UOM: {product.uom} &nbsp; | &nbsp; Price: {money(product.price)}</p>
      </div>
      <div className="actions">
        {qty ? (
          <div className="stepper product-stepper">
            <button onClick={() => changeQty(product.id, -1)}>−</button>
            <b>{qty}</b>
            <button onClick={() => changeQty(product.id, 1)}>+</button>
          </div>
        ) : (
          <button className="add simple-add" onClick={() => changeQty(product.id, 1)}>ADD</button>
        )}
      </div>
    </div>
  );
}

function CategoriesScreen(props: any) {
  const { active, catSearch, cats, products, setCat, setCatSearch, setMenuOpen, totals, go } = props;
  const visibleCats = cats.filter((cat: string) => cat !== 'All' && cat.toLowerCase().includes(catSearch.toLowerCase()));
  return (
    <Screen active={active} className="categories">
      <Appbar
        title="Categories"
        left={<button className="icon-btn" onClick={() => setMenuOpen(true)}>☰</button>}
        right={<CartButton go={go} totals={totals} id="cartBadgeCat" />}
      />
      <div className="content-pad">
        <div className="search"><span>🔍</span><input placeholder="Search categories..." value={catSearch} onChange={e => setCatSearch((e.target as HTMLInputElement).value)} /></div>
        <div className="category-list">
          {visibleCats.length ? visibleCats.map((cat: string) => (
            <button type="button" className="category-row" key={cat} onClick={() => setCat(cat)}>
              <img src={logo} alt="" />
              <span><b>{cat} Products</b><small>{products.filter((p: Product) => p.cat === cat).length} Products</small></span>
              <strong>›</strong>
            </button>
          )) : <div className="empty">No categories found.</div>}
        </div>
      </div>
    </Screen>
  );
}

function CartScreen(props: any) {
  const { active, cart, cartSearch, changeQty, clearCart, go, products, removeFromCart, setCartSearch, totals } = props;
  const q = cartSearch.toLowerCase();
  const rows = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p: Product) => String(p.id) === String(id)), qty }))
    .filter((row: any) => row.product)
    .filter((row: any) => `${row.product.name} ${row.product.code} ${row.product.uom}`.toLowerCase().includes(q));
  return (
    <Screen active={active} className="cart">
      <Appbar
        title="Your Cart"
        left={<button className="icon-btn" onClick={() => go('products')}>‹</button>}
        right={<button className="icon-btn" onClick={clearCart} aria-label="Clear cart">⌫</button>}
      />
      <div className="content-pad cart-content">
        <div className="search cart-search"><span>🔍</span><input type="search" placeholder="Search cart items..." value={cartSearch} onChange={e => setCartSearch((e.target as HTMLInputElement).value)} /></div>
        <div className="cart-list">
          {rows.map(({ product, qty }: any) => (
            <SwipeDelete className="cart-swipe" onDelete={() => removeFromCart(product.id)}>
              <div className="cart-item">
                <img src={logo} alt="" />
                <div className="pmeta">
                  <h3>{product.name}</h3>
                  <p>{product.code}</p>
                  <p>{product.uom} | {money(product.price)}</p>
                  <div className="stepper">
                    <button onClick={() => changeQty(product.id, -1)}>−</button>
                    <b>{qty}</b>
                    <button onClick={() => changeQty(product.id, 1)}>+</button>
                  </div>
                </div>
                <span className="cart-price">{money(product.price * qty)}</span>
                <button className="delete" onClick={() => removeFromCart(product.id)} aria-label="Remove item">⌫</button>
              </div>
            </SwipeDelete>
          ))}
        </div>
        {!totals.items && <div className="empty">Cart empty. Add products first.</div>}
        {totals.items > 0 && !rows.length && <div className="empty">No cart items found.</div>}
        <div className="total"><p><span>Total Items</span><b>{totals.items}</b></p><p><span>Total Amount</span><b>{money(totals.total)}</b></p></div>
      </div>
    </Screen>
  );
}

function SummaryScreen({ active, customer, go, setCustomer, submitOrder, totals }: any) {
  const setField = (field: keyof Customer) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCustomer((current: Customer) => ({ ...current, [field]: event.target.value }));
  return (
    <Screen active={active} className="summary">
      <Appbar title="Order Summary" left={<button className="icon-btn" onClick={() => go('cart')}>‹</button>} />
      <div className="content-pad form-content">
        <label>Customer Name *</label><input value={customer.name} onChange={setField('name')} placeholder="Enter name" />
        <label>Phone Number *</label><input value={customer.phone} onChange={setField('phone')} placeholder="Enter phone" />
        <label>Address *</label><textarea value={customer.address} onChange={setField('address')} placeholder="Enter delivery address" />
        <label>Order Notes</label><textarea value={customer.notes} onChange={setField('notes')} placeholder="Write your notes here..." />
        <div className="summary-card"><p>Total Items <b>{totals.items}</b></p><p>Total Amount <b>{money(totals.total)}</b></p><h2>Grand Total <span>{money(totals.total)}</span></h2></div>
        <button className="primary-btn bottom-action" onClick={submitOrder}>SUBMIT ORDER</button>
      </div>
    </Screen>
  );
}

function OrdersScreen({ active, deleteOrder, go, orders, setSelectedOrder }: any) {
  const list = orders.length ? orders : [{ no: 'RO-1007', date: '03/05/2026', items: 7, total: 302, status: 'Submitted' }];
  return (
    <Screen active={active} className="orders">
      <Appbar title="Order History" left={<button className="icon-btn" onClick={() => go('products')}>‹</button>} />
      <div className="content-pad">
        <div className="order-history">
          {list.map((order: Order) => (
            <SwipeDelete key={order.no} className="order-swipe" disabled={!orders.length} onDelete={() => deleteOrder(order.no)}>
              <div className="order-card compact-order" onClick={() => { setSelectedOrder(order); go('orderDetails'); }}>
                <div>
                  <h3>{order.no}</h3>
                  <p>{order.date} • {Number(order.items) || 0} items</p>
                </div>
                <div>
                  <b>{money(order.total)}</b>
                  <span className="status">{order.status}</span>
                </div>
              </div>
            </SwipeDelete>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function OrderDetailsScreen({ active, go, order }: any) {
  const lines = order?.lines?.length ? order.lines : [{ name: 'Demo order items', code: order?.no || '-', uom: '-', qty: order?.items || 0, price: order?.total || 0 }];
  return (
    <Screen active={active} className="order-details">
      <Appbar title="Order Details" left={<button className="icon-btn" onClick={() => go('orders')}>‹</button>} />
      <div className="content-pad">
        <div className="order-detail-head">
          <h2>{order?.no || 'Order'}</h2>
          <span className="status">{order?.status || 'Submitted'}</span>
          <p>{order?.date}</p>
          <p>{order?.name || demoCustomer.name} • {order?.phone || demoCustomer.phone}</p>
        </div>
        <div className="detail-lines">
          {lines.map((line, index) => (
            <div className="detail-line" key={`${line.code}-${index}`}>
              <div><b>{line.name}</b><small>{line.code} • {line.uom}</small></div>
              <span>{line.qty} x {money(line.price)}</span>
            </div>
          ))}
        </div>
        <div className="summary-card"><p>Total Items <b>{order?.items || 0}</b></p><h2>Grand Total <span>{money(order?.total || 0)}</span></h2></div>
      </div>
    </Screen>
  );
}

function SuccessScreen({ active, go }: { active: boolean; go: (name: string) => void }) {
  if (!active) return <Screen active={false} className="success no-nav" />;
  return (
    <Screen active={active} className="success no-nav">
      <div className="success-box">
        <div className="success-burst">
          {Array.from({ length: 18 }, (_, index) => <span key={index} />)}
        </div>
        <div className="success-icon">✓</div>
        <h2>Order Submitted Successfully</h2>
        <p>Your order has been saved in order history.</p>
        <button className="primary-btn" onClick={() => go('products')}>Back to Products</button>
      </div>
    </Screen>
  );
}

function SwipeDelete({ children, className = '', disabled = false, onDelete }: { children: ReactNode; className?: string; disabled?: boolean; onDelete: () => void }) {
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const offset = Math.min(0, Math.max(-96, dragX));
  const begin = (x: number) => {
    if (!disabled) setStartX(x);
  };
  const move = (x: number) => {
    if (disabled || startX === null) return;
    setDragX(Math.min(0, x - startX));
  };
  const end = () => {
    if (!disabled && dragX < -58) onDelete();
    setDragX(0);
    setStartX(null);
  };
  return (
    <div
      className={`swipe-wrap ${className} ${disabled ? 'disabled' : ''}`}
      onMouseDown={event => begin(event.clientX)}
      onMouseMove={event => move(event.clientX)}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={event => begin(event.touches[0].clientX)}
      onTouchMove={event => move(event.touches[0].clientX)}
      onTouchEnd={end}
    >
      <button className="swipe-delete" type="button" onClick={onDelete}>Delete</button>
      <div className="swipe-content" style={{ transform: `translateX(${offset}px)` }}>{children}</div>
    </div>
  );
}

function GlobalStickyCart({ active, go, totals }: { active: boolean; go: (name: string) => void; totals: { items: number } }) {
  return (
    <button className={`sticky-cart global-sticky ${active && totals.items ? '' : 'hidden'}`} type="button" onClick={() => go('cart')}>
      <div><b>{totals.items} Items Selected</b><small>View Cart</small></div><span>Proceed</span>
    </button>
  );
}

function CartProceed({ active, go, totals }: { active: boolean; go: (name: string) => void; totals: { total: number; items: number } }) {
  return (
    <button className={`cart-proceed ${active && totals.items ? '' : 'hidden'}`} type="button" onClick={() => go('summary')}>
      <span>{totals.items} items</span>
      <b>Proceed Order</b>
      <em>{money(totals.total)}</em>
    </button>
  );
}

function LogoutConfirm({ open, cancel, confirm }: { open: boolean; cancel: () => void; confirm: () => void }) {
  if (!open) return null;
  return (
    <div className="confirm-backdrop">
      <div className="confirm-box">
        <h3>Sure want to log out?</h3>
        <p>Your cart will stay saved until app closes.</p>
        <div>
          <button onClick={cancel}>No</button>
          <button className="danger" onClick={confirm}>Yes</button>
        </div>
      </div>
    </div>
  );
}

function Drawer({ menuOpen, close, go, logout, securityEnabled, toggleSecurity }: { menuOpen: boolean; close: () => void; go: (name: string) => void; logout: () => void; securityEnabled: boolean; toggleSecurity: (checked: boolean) => void }) {
  return (
    <>
      <div className={`drawer-backdrop ${menuOpen ? 'show' : ''}`} onClick={close} />
      <aside className={`side-menu ${menuOpen ? 'show' : ''}`}>
        <div className="menu-head"><button onClick={close} className="menu-close">×</button><img src={logo} alt="Logo" /><h3>RENGAS Customer</h3><p>Wholesale Buyer Account</p></div>
        <button className="menu-link" onClick={() => go('products')}>⌂ <span>Products</span></button>
        <button className="menu-link" onClick={() => go('categories')}>▦ <span>Categories</span></button>
        <button className="menu-link" onClick={() => go('cart')}>🛒 <span>Cart</span></button>
        <button className="menu-link" onClick={() => go('orders')}>☷ <span>Order History</span></button>
        <label className="menu-link security-toggle">🔒 <span>Password / Fingerprint</span><input type="checkbox" checked={securityEnabled} onChange={e => toggleSecurity((e.target as HTMLInputElement).checked)} /></label>
        <button className="menu-link" onClick={logout}>↩ <span>Logout</span></button>
      </aside>
    </>
  );
}

function BottomNav({ active, go, totals }: { active: string; go: (name: string) => void; totals: { items: number } }) {
  return (
    <nav className={`bottom-nav ${['login', 'security', 'success'].includes(active) ? 'hidden' : ''}`}>
      <button data-nav="products" onClick={() => go('products')} className={active === 'products' ? 'active' : ''}><i>⌂</i><span>Home</span></button>
      <button data-nav="categories" onClick={() => go('categories')} className={active === 'categories' ? 'active' : ''}><i>▦</i><span>Category</span></button>
      <button data-nav="cart" onClick={() => go('cart')} className={active === 'cart' ? 'active' : ''}><i>🛒</i><em className="navBadge">{totals.items}</em><span>Cart</span></button>
      <button data-nav="orders" onClick={() => go('orders')} className={active === 'orders' ? 'active' : ''}><i>☷</i><span>Order</span></button>
    </nav>
  );
}

export default App;
