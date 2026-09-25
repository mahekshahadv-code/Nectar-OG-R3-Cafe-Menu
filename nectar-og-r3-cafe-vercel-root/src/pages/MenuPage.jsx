import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, Sparkles, Instagram, MapPin, UtensilsCrossed } from "lucide-react";
import BrandHeader from "../components/BrandHeader";
import CartDrawer from "../components/CartDrawer";
import CheckoutModal from "../components/CheckoutModal";
import { DEFAULT_SETTINGS, fetchMenu, fetchSettings } from "../lib/data";

const fallbackCategories = [
  { id: "hot-beverages", name: "Hot Beverages", order: 1, active: true },
  { id: "cold-coffee", name: "Cold Coffee", order: 2, active: true },
  { id: "fresh-fruit-juices", name: "Fresh Fruit Juices", order: 3, active: true },
  { id: "milk-shakes", name: "Milk Shakes", order: 4, active: true },
  { id: "smoothies", name: "Smoothies", order: 5, active: true },
  { id: "thickshakes", name: "ThickShakes", order: 6, active: true },
  { id: "bites", name: "Bites", order: 7, active: true },
  { id: "mocktails", name: "Mocktails", order: 8, active: true },
];

export default function MenuPage() {
  const [categories, setCategories] = useState([]); const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS); const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]); const [cartOpen, setCartOpen] = useState(false); const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true); const [notice, setNotice] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTableNumber((params.get("table") || "").trim());
    Promise.all([fetchMenu(), fetchSettings()]).then(([menu, site]) => {
      setCategories(menu.categories.filter((c) => c.active !== false)); setItems(menu.items); setSettings(site);
    }).catch((err) => console.error(err)).finally(() => setLoading(false));
  }, []);

  const orderedCategories = useMemo(() => (categories.length ? categories : fallbackCategories).sort((a,b) => a.order - b.order), [categories]);
  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => i.available !== false && (!q || `${i.name} ${i.description || ""}`.toLowerCase().includes(q)));
  }, [items, query]);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  function addToCart(item) { setCart((prev) => { const found = prev.find((x) => x.id === item.id); return found ? prev.map((x) => x.id === item.id ? {...x, qty: x.qty + 1} : x) : [...prev, {...item, qty: 1}]; }); }
  function removeFromCart(id) { setCart((prev) => prev.flatMap((x) => x.id === id ? (x.qty > 1 ? [{...x, qty:x.qty-1}] : []) : [x])); }
  function clearCart() { setCart([]); }
  function orderSuccess(result) { setCheckoutOpen(false); setCartOpen(false); setCart([]); setNotice(`Order ${result.orderCode} placed successfully.`); window.scrollTo({top:0,behavior:"smooth"}); setTimeout(()=>setNotice(""),6000); }

  return (
    <div className="app-shell">
      <BrandHeader settings={settings} />
      <main>
        <section className="hero-card">
          <div className="hero-copy">
            <span className="pill"><Sparkles size={15}/> Fresh start · Good vibes · Great flavours</span>
            <h2>Good coffee. Fresh fruit. Delicious bites.</h2>
            <p>Welcome to Nectar OG R3 Cafe — a co-brand of Juice Katey. Browse the menu, add your favourites and order directly from your phone.</p>
            {tableNumber && <div className="table-banner hero-table"><UtensilsCrossed size={17}/> You are ordering for <strong>Table {tableNumber}</strong></div>}
          </div>
          <div className="hero-art" aria-hidden="true"><span>☕</span><span>🍊</span><span>🥤</span></div>
        </section>
        {notice && <div className="success-box">{notice}</div>}
        <section className="menu-toolbar">
          <div><p className="eyebrow">OUR MENU</p><h2>Pick your favourites</h2></div>
          <div className="search-box"><Search size={18}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search tea, juice, sandwich..." /></div>
        </section>
        <div className="category-nav">{orderedCategories.map((cat)=><a href={`#${cat.id}`} key={cat.id}>{cat.name}</a>)}</div>
        {loading ? <div className="loading">Loading fresh menu...</div> : (
          <div className="menu-sections">
            {orderedCategories.map((cat) => {
              const categoryItems = visibleItems.filter((i)=>i.categoryId===cat.id).sort((a,b)=>(a.order??0)-(b.order??0));
              if (!categoryItems.length) return null;
              return <section className="menu-section" id={cat.id} key={cat.id}>
                <div className="section-title"><div><p className="eyebrow">FRESHLY MADE</p><h3>{cat.name}</h3></div><span>{categoryItems.length} choices</span></div>
                <div className="menu-grid">{categoryItems.map((item)=><article className="menu-card" key={item.id}><div className="menu-card-top"><div><h4>{item.name}</h4>{item.description&&<p>{item.description}</p>}</div><strong>₹{item.price}</strong></div><button className="add-btn" onClick={()=>addToCart(item)}>+ Add to order</button></article>)}</div>
              </section>;
            })}
          </div>
        )}
        <section className="visit-card">
          <div><p className="eyebrow">COME SAY HELLO</p><h2>{settings.cafeName}</h2><p><MapPin size={17}/> {settings.address}</p></div>
          <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="instagram-btn"><Instagram size={18}/> @{settings.instagramHandle}</a>
        </section>
      </main>
      <button className="floating-cart" onClick={()=>setCartOpen(true)}><ShoppingCart size={20}/><span>{count ? `${count} item${count>1?'s':''} · ₹${total}` : "View cart"}</span></button>
      <footer><div><strong>{settings.cafeName}</strong><span> · {settings.coBrand}</span></div><a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram · @{settings.instagramHandle}</a></footer>
      <CartDrawer cart={cart} open={cartOpen} onClose={()=>setCartOpen(false)} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart} total={total} onCheckout={()=>setCheckoutOpen(true)} />
      {checkoutOpen && <CheckoutModal cart={cart} total={total} tableNumber={tableNumber} onClose={()=>setCheckoutOpen(false)} onSuccess={orderSuccess} />}
    </div>
  );
}
