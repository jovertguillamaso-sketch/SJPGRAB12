import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const PRODUCTS = [
  { id: 1, name: "Chicken Meal", category: "Meals", price: 89, image: "/products/chicken-meal.jpg", emoji: "🍗", description: "Crispy chicken with rice" },
  { id: 2, name: "Burger", category: "Snacks", price: 65, image: "/products/burger.jpg", emoji: "🍔", description: "Juicy burger with fresh toppings" },
  { id: 3, name: "French Fries", category: "Snacks", price: 45, image: "/products/fries.jpg", emoji: "🍟", description: "Golden and crispy fries" },
  { id: 4, name: "Spaghetti", category: "Meals", price: 75, image: "/products/spaghetti.jpg", emoji: "🍝", description: "Sweet-style spaghetti" },
  { id: 5, name: "Iced Coffee", category: "Drinks", price: 55, image: "/products/iced-coffee.jpg", emoji: "🧋", description: "Cold and refreshing coffee" },
  { id: 6, name: "Pizza Slice", category: "Snacks", price: 60, image: "/products/pizza.jpg", emoji: "🍕", description: "Cheesy pizza slice" },
  { id: 7, name: "Fried Rice Meal", category: "Meals", price: 80, image: "/products/fried-rice.jpg", emoji: "🍱", description: "Fried rice with a tasty side" },
  { id: 8, name: "Fruit Juice", category: "Drinks", price: 35, image: "/products/juice.jpg", emoji: "🧃", description: "Chilled fruit juice" },
];

const money = (amount) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(amount) || 0);

const ICONS = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  menu: "M4 4v7a3 3 0 0 0 3 3v6M10 4v7M7 4v6M17 4c-2 2-2 6 0 8v8",
  bag: "M5 8h14l-1 12H6L5 8zM9 8a3 3 0 0 1 6 0",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 1-2-1V5h-4v2l-2 1-2-1-2 4 2 1v2l-2 1 2 4 2-1 2 1v2h4v-2l2-1 2 1 2-4-2-1v-2z",
  out: "M9 4H5v16h4M16 8l4 4-4 4M20 12H9",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
};

function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);
  return failed || !product.image ? (
    <div className="product-fallback">{product.emoji}</div>
  ) : (
    <img className="product-image" src={product.image} alt={product.name} onError={() => setFailed(true)} />
  );
}

function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <ProductImage product={product} />
        <span className="product-category">{product.category}</span>
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card-bottom">
          <strong>{money(product.price)}</strong>
          <button className="add-button" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to cart`}>
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

function NavButton({ icon, label, page, activePage, onClick, badge }) {
  return (
    <button className={`nav-button ${activePage === page ? "active" : ""}`} onClick={() => onClick(page)}>
      <Icon name={icon} />
      <span>{label}</span>
      {badge ? <b className="nav-badge">{badge}</b> : null}
    </button>
  );
}

export default function App() {
  const [users, setUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("canteen_users") || "[]"); } catch { return []; }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("canteen_current_user") || "null"); } catch { return null; }
  });

  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [activePage, setActivePage] = useState("dashboard");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cashReceived, setCashReceived] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("canteen_orders") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("canteen_users", JSON.stringify(users)); }, [users]);
  useEffect(() => {
    if (currentUser) localStorage.setItem("canteen_current_user", JSON.stringify(currentUser));
    else localStorage.removeItem("canteen_current_user");
  }, [currentUser]);
  useEffect(() => { localStorage.setItem("canteen_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { if (currentUser) setCustomerName(currentUser.name || ""); }, [currentUser]);

  const categories = ["All", "Meals", "Snacks", "Drinks"];

  const filteredProducts = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (category === "All" || p.category === category) &&
          p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [category, search]
  );

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal;
  const change = Number(cashReceived || 0) - total;
  const myOrders = orders.filter((o) => o.email === currentUser?.email);

  function handleAuth(event) {
    event.preventDefault();
    setAuthError("");
    const email = authEmail.trim().toLowerCase();
    if (!email || !authPassword) return setAuthError("Enter your email and password.");

    if (authMode === "signup") {
      if (!authName.trim()) return setAuthError("Enter your full name.");
      if (authPassword.length < 6) return setAuthError("Password must have at least 6 characters.");
      if (users.some((u) => u.email === email)) return setAuthError("An account with this email already exists.");
      const newUser = { id: Date.now(), name: authName.trim(), email, password: authPassword };
      setUsers((p) => [...p, newUser]);
      setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
      setActivePage("dashboard");
      return;
    }

    const found = users.find((u) => u.email === email && u.password === authPassword);
    if (!found) return setAuthError("Incorrect email or password. Try again.");
    setCurrentUser({ id: found.id, name: found.name, email: found.email });
    setActivePage("dashboard");
  }

  function logout() {
    setCurrentUser(null);
    setCart([]);
    setReceipt(null);
    setAuthMode("login");
    setAuthEmail("");
    setAuthPassword("");
    setActivePage("dashboard");
  }

  function addToCart(product) {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(id, amount) {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + amount } : i)).filter((i) => i.quantity > 0)
    );
  }

  function placeOrder(event) {
    event.preventDefault();
    setCheckoutError("");
    if (!currentUser) return setCheckoutError("Log in before placing an order.");
    if (!cart.length) return setCheckoutError("Add at least one item to your cart.");
    if (!customerName.trim() || !deliveryLocation.trim())
      return setCheckoutError("Enter the customer name and delivery location.");
    if (paymentMethod === "Cash" && Number(cashReceived) < total)
      return setCheckoutError("Cash received must be at least the total.");

    const newOrder = {
      id: Date.now(),
      customerName: customerName.trim(),
      email: currentUser.email,
      deliveryLocation: deliveryLocation.trim(),
      items: cart.map((i) => ({ ...i })),
      subtotal,
      total,
      paymentMethod,
      cashReceived: paymentMethod === "Cash" ? Number(cashReceived) : total,
      change: paymentMethod === "Cash" ? Number(cashReceived) - total : 0,
      status: "Received",
      createdAt: new Date().toISOString(),
    };
    setOrders((p) => [newOrder, ...p]);
    setReceipt(newOrder);
    setCart([]);
    setCashReceived("");
    setActivePage("orders");
  }

  const printReceipt = () => window.print();

  function renderDashboard() {
    return (
      <>
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-kicker">Hi {currentUser.name.split(" ")[0]}, hungry?</p>
            <h1>Order lunch before the bell rings.</h1>
            <p>Pick from today's menu, pay with cash or GCash, and we'll bring it to your room.</p>
            <button className="primary-button" onClick={() => setActivePage("menu")}>Browse the menu</button>
          </div>
          <div className="hero-photos">
            {PRODUCTS.slice(0, 3).map((p) => (
              <div className="hero-photo" key={p.id}>
                <ProductImage product={p} />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="stats-grid">
          <div className="stat-card"><span>Your orders</span><strong>{myOrders.length}</strong></div>
          <div className="stat-card"><span>Items on menu</span><strong>{PRODUCTS.length}</strong></div>
          <div className="stat-card"><span>In your cart</span><strong>{cartCount}</strong></div>
        </div>

        <section className="section-block">
          <div className="section-heading">
            <h2>Popular today</h2>
            <button className="text-button" onClick={() => setActivePage("menu")}>See full menu</button>
          </div>
          <div className="product-grid">
            {PRODUCTS.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderMenu() {
    return (
      <section className="section-block">
        <div className="page-heading">
          <h1>Menu</h1>
          <p>Pick your favorites and add them to your order.</p>
        </div>
        <div className="menu-tools">
          <div className="search-box">
            <Icon name="search" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search food and drinks" />
          </div>
          <div className="category-tabs">
            {categories.map((c) => (
              <button key={c} className={category === c ? "category-tab active" : "category-tab"} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="product-grid">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))}
        </div>
        {!filteredProducts.length && (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try a different search or category.</p>
          </div>
        )}
      </section>
    );
  }

  function renderOrders() {
    return (
      <section className="section-block">
        <div className="page-heading">
          <h1>Recent orders</h1>
          <p>Your previous orders, totals, and payment details.</p>
        </div>
        <div className="orders-toolbar">
          <strong>{myOrders.length} {myOrders.length === 1 ? "order" : "orders"}</strong>
          <button className="secondary-button" onClick={() => setActivePage("menu")}>New order</button>
        </div>
        {myOrders.length ? (
          <div className="orders-table">
            <div className="orders-head">
              <span>Order</span><span>Items</span><span>Payment</span><span>Status</span><span />
            </div>
            {myOrders.map((order) => (
              <article className="order-row" key={order.id}>
                <div className="order-description">
                  <strong>#{String(order.id).slice(-6)}</strong>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <span className="order-items">{order.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}</span>
                <div className="order-payment">
                  <strong>{money(order.total)}</strong>
                  <span>{order.paymentMethod}</span>
                </div>
                <span className="order-status">{order.status}</span>
                <button className="small-button" onClick={() => setSelectedOrder(order)}>View receipt</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Orders you place will show up here.</p>
            <button className="primary-button" onClick={() => setActivePage("menu")}>Start an order</button>
          </div>
        )}
      </section>
    );
  }

  function renderSettings() {
    return (
      <section className="section-block">
        <div className="page-heading">
          <h1>Settings</h1>
          <p>System information and account details.</p>
        </div>
        <div className="settings-grid">
          <article className="settings-card creator-card">
            <div className="creator-avatar">JG</div>
            <h2>JOVERT JOHN GUILLAMASO</h2>
            <p>Creator and developer of the Canteen Grab ordering system.</p>
          </article>
          <article className="settings-card">
            <h3>Application details</h3>
            <div className="setting-row"><span>Application</span><strong>Canteen Grab</strong></div>
            <div className="setting-row"><span>Frontend</span><strong>React</strong></div>
            <div className="setting-row"><span>Currency</span><strong>PHP (₱)</strong></div>
            <div className="setting-row"><span>Signed in as</span><strong>{currentUser?.email}</strong></div>
          </article>
          <article className="settings-card account-card">
            <h3>Account</h3>
            <p>Signed in as {currentUser?.name}.</p>
            <button className="secondary-button" onClick={logout}>Log out</button>
          </article>
        </div>
      </section>
    );
  }

  function renderCart() {
    return (
      <section className="section-block">
        <div className="page-heading">
          <h1>Checkout</h1>
          <p>Review your items and confirm your order.</p>
        </div>
        <div className="checkout-layout">
          <div className="checkout-items panel">
            <h2>Your cart ({cartCount})</h2>
            {cart.length ? (
              cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-thumb"><ProductImage product={item} /></div>
                  <div className="cart-item-info">
                    <strong>{item.name}</strong>
                    <span>{money(item.price)} each</span>
                    <div className="quantity-controls">
                      <button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease">−</button>
                      <strong>{item.quantity}</strong>
                      <button onClick={() => changeQuantity(item.id, 1)} aria-label="Increase">+</button>
                    </div>
                  </div>
                  <strong>{money(item.price * item.quantity)}</strong>
                </div>
              ))
            ) : (
              <div className="empty-cart">
                <p>Your cart is empty.</p>
                <button className="secondary-button" onClick={() => setActivePage("menu")}>Browse menu</button>
              </div>
            )}
            <div className="checkout-total"><span>Total</span><strong>{money(total)}</strong></div>
          </div>

          <form className="checkout-form panel" onSubmit={placeOrder}>
            <h2>Customer details</h2>
            <label htmlFor="customerName">Customer name</label>
            <input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" required />
            <label htmlFor="deliveryLocation">Delivery location</label>
            <input id="deliveryLocation" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} placeholder="Building, room, or pickup point" required />
            <label htmlFor="paymentMethod">Payment method</label>
            <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
            </select>
            {paymentMethod === "Cash" && (
              <>
                <label htmlFor="cashReceived">Cash received (₱)</label>
                <input id="cashReceived" type="number" min={total} step="0.01" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} placeholder={`At least ${total.toFixed(2)}`} required />
                <div className="change-preview"><span>Change</span><strong>{money(Math.max(0, change))}</strong></div>
              </>
            )}
            {paymentMethod === "GCash" && (
              <p className="payment-note">GCash is recorded as the payment method. This demo doesn't process a real GCash transaction.</p>
            )}
            {checkoutError && <div className="error-message" role="alert">{checkoutError}</div>}
            <button className="primary-button place-order-button" type="submit">Place order · {money(total)}</button>
          </form>
        </div>
      </section>
    );
  }

  /* ---------- Auth screen ---------- */
  if (!currentUser) {
    return (
      <main className="auth-screen">
        <section className="auth-brand">
          <div className="brand-lockup static">
            <span className="brand-mark">CG</span>
            <span className="brand-name">Canteen Grab</span>
          </div>
          <div className="auth-photos">
            {PRODUCTS.slice(0, 4).map((p) => (
              <div className="auth-photo" key={p.id}><ProductImage product={p} /></div>
            ))}
          </div>
          <h2>Fresh meals, ordered in under a minute.</h2>
          <p>Browse the daily menu, pay your way, and skip the line.</p>
        </section>

        <section className="auth-panel">
          <h1>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="auth-subtitle">
            {authMode === "login" ? "Log in to order your food." : "Sign up to start ordering with Canteen Grab."}
          </p>
          <form className="auth-form" onSubmit={handleAuth}>
            {authMode === "signup" && (
              <>
                <label htmlFor="authName">Full name</label>
                <input id="authName" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Your full name" required />
              </>
            )}
            <label htmlFor="authEmail">Email address</label>
            <input id="authEmail" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com" required />
            <label htmlFor="authPassword">Password</label>
            <input id="authPassword" type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Enter your password" required />
            {authError && <div className="error-message" role="alert">{authError}</div>}
            <button className="primary-button auth-submit" type="submit">
              {authMode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
          <p className="auth-switch">
            {authMode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>
              {authMode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
        </section>
      </main>
    );
  }

  /* ---------- Main app ---------- */
  const showOrderPanel = activePage === "dashboard" || activePage === "menu";
  const data = receipt || selectedOrder;
  const closeReceipt = () => { setReceipt(null); setSelectedOrder(null); };

  return (
    <div className={`app-shell ${showOrderPanel ? "with-panel" : ""}`}>
      <aside className="sidebar">
        <button className="brand-lockup" onClick={() => setActivePage("dashboard")} aria-label="Go to dashboard">
          <span className="brand-mark">CG</span>
          <span className="brand-name">Canteen Grab</span>
        </button>

        <nav className="sidebar-nav">
          <NavButton icon="home" label="Dashboard" page="dashboard" activePage={activePage} onClick={setActivePage} />
          <NavButton icon="menu" label="Menu" page="menu" activePage={activePage} onClick={setActivePage} />
          <NavButton icon="bag" label="Checkout" page="cart" activePage={activePage} onClick={setActivePage} badge={cartCount} />
          <NavButton icon="list" label="Recent orders" page="orders" activePage={activePage} onClick={setActivePage} />
          <NavButton icon="gear" label="Settings" page="settings" activePage={activePage} onClick={setActivePage} />
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-user">
          <div className="user-avatar">{(currentUser.name || "U").slice(0, 1).toUpperCase()}</div>
          <div className="sidebar-user-info">
            <strong>{currentUser.name}</strong>
            <span>{currentUser.email}</span>
          </div>
          <button className="logout-icon" onClick={logout} title="Log out" aria-label="Log out"><Icon name="out" /></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-title"><span className="online-dot" />Kitchen open · Campus Food Service</div>
          <button className="topbar-cart" onClick={() => setActivePage("cart")}>
            <Icon name="bag" /> Cart <b>{cartCount}</b>
          </button>
        </header>

        <div className="main-content" key={activePage}>
          {activePage === "dashboard" && renderDashboard()}
          {activePage === "menu" && renderMenu()}
          {activePage === "orders" && renderOrders()}
          {activePage === "settings" && renderSettings()}
          {activePage === "cart" && renderCart()}
        </div>

        <footer className="app-footer">
          <span>© {new Date().getFullYear()} Canteen Grab</span>
          <span>Created by JOVERT JOHN GUILLAMASO</span>
        </footer>
      </main>

      {showOrderPanel && (
        <aside className="order-panel">
          <h2>Your order</h2>
          <div className="order-panel-items">
            {cart.length ? (
              cart.map((item) => (
                <div className="mini-item" key={item.id}>
                  <div className="cart-thumb small"><ProductImage product={item} /></div>
                  <div className="mini-info">
                    <strong>{item.name}</strong>
                    <span>{money(item.price * item.quantity)}</span>
                  </div>
                  <div className="quantity-controls">
                    <button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease">−</button>
                    <strong>{item.quantity}</strong>
                    <button onClick={() => changeQuantity(item.id, 1)} aria-label="Increase">+</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="panel-empty">Nothing here yet. Add items from the menu.</p>
            )}
          </div>
          <div className="order-panel-foot">
            <div className="checkout-total"><span>Total</span><strong>{money(total)}</strong></div>
            <button className="primary-button" disabled={!cart.length} onClick={() => setActivePage("cart")}>
              Go to checkout
            </button>
          </div>
        </aside>
      )}

      {data && (
        <div className="modal-backdrop" onClick={closeReceipt}>
          <section className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-print-area">
              <div className="receipt-heading">
                <h2>CANTEEN GRAB</h2>
                <p>Order receipt</p>
                <div className="receipt-divider" />
              </div>
              <div className="receipt-meta">
                <div><span>Receipt no.</span><strong>#{String(data.id).slice(-6)}</strong></div>
                <div><span>Date</span><strong>{new Date(data.createdAt).toLocaleString()}</strong></div>
                <div><span>Customer</span><strong>{data.customerName}</strong></div>
                <div><span>Location</span><strong>{data.deliveryLocation}</strong></div>
                <div><span>Payment</span><strong>{data.paymentMethod}</strong></div>
              </div>
              <div className="receipt-items">
                <div className="receipt-table-heading"><span>Item</span><span>Qty</span><span>Amount</span></div>
                {data.items.map((item, i) => (
                  <div className="receipt-line" key={`${item.id}-${i}`}>
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                    <span>{money(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="receipt-summary">
                <div><span>Subtotal</span><strong>{money(data.subtotal)}</strong></div>
                <div className="receipt-grand-total"><span>Total</span><strong>{money(data.total)}</strong></div>
                <div><span>Cash received</span><strong>{money(data.cashReceived)}</strong></div>
                <div><span>Change</span><strong>{money(data.change)}</strong></div>
              </div>
              <p className="receipt-thanks">Thank you for your order!</p>
              <p className="receipt-creator">Created by JOVERT JOHN GUILLAMASO</p>
            </div>
            <div className="receipt-actions no-print">
              <button className="secondary-button" onClick={closeReceipt}>Close</button>
              <button className="primary-button" onClick={printReceipt}>Print receipt</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
