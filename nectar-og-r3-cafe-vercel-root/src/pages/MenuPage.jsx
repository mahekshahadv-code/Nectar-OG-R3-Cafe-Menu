import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Sparkles,
  Instagram,
  MapPin,
  UtensilsCrossed,
  Phone,
} from "lucide-react";
import BrandHeader from "../components/BrandHeader";
import CartDrawer from "../components/CartDrawer";
import CheckoutModal from "../components/CheckoutModal";
import { DEFAULT_SETTINGS, fetchMenu, fetchSettings } from "../lib/data";

const GOOGLE_MAPS_URL =
  "https://maps.app.goo.gl/fbE83vvPFJr9XkKb7";

const PHONE_NUMBER_1 = "7698937179";
const PHONE_NUMBER_2 = "7670941997";

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
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTableNumber((params.get("table") || "").trim());

    Promise.all([fetchMenu(), fetchSettings()])
      .then(([menu, site]) => {
        setCategories(
          (menu.categories || []).filter(
            (category) => category.active !== false
          )
        );
        setItems(menu.items || []);
        setSettings(site || DEFAULT_SETTINGS);
      })
      .catch((err) => {
        console.error("Failed to load menu or cafe settings:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const orderedCategories = useMemo(
    () =>
      [...(categories.length ? categories : fallbackCategories)].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    [categories]
  );

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter(
      (item) =>
        item.available !== false &&
        (!q ||
          `${item.name} ${item.description || ""}`
            .toLowerCase()
            .includes(q))
    );
  }, [items, query]);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.qty,
    0
  );

  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  function addToCart(item) {
    setCart((prev) => {
      const found = prev.find((x) => x.id === item.id);

      return found
        ? prev.map((x) =>
            x.id === item.id ? { ...x, qty: x.qty + 1 } : x
          )
        : [...prev, { ...item, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((prev) =>
      prev.flatMap((item) =>
        item.id === id
          ? item.qty > 1
            ? [{ ...item, qty: item.qty - 1 }]
            : []
          : [item]
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  function orderSuccess(result) {
    setCheckoutOpen(false);
    setCartOpen(false);
    setCart([]);
    setNotice(
      `Order ${result?.orderCode || ""} placed successfully.`
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setNotice(""), 6000);
  }

  return (
    <div className="app-shell">
      <BrandHeader settings={settings} />

      {/* TOP CONTACT BAR: PHONE NUMBERS ONLY */}
      <nav className="top-contact-bar" aria-label="Cafe contact details">
        <a
          href={`tel:${PHONE_NUMBER_1}`}
          className="top-contact-link"
        >
          <Phone size={17} />
          <span>{PHONE_NUMBER_1}</span>
        </a>

        <a
          href={`tel:${PHONE_NUMBER_2}`}
          className="top-contact-link"
        >
          <Phone size={17} />
          <span>{PHONE_NUMBER_2}</span>
        </a>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className="hero-card">
          <div className="hero-copy">
            <span className="pill">
              <Sparkles size={15} />
              Fresh start · Good vibes · Great flavours
            </span>

            <h2>Good coffee. Fresh fruit. Delicious bites.</h2>

            <p>
              Welcome to Nectar OG R3 Cafe — a co-brand of Juice Katey.
              Browse the menu, add your favourites and order directly
              from your phone.
            </p>

            {tableNumber && (
              <div className="table-banner hero-table">
                <UtensilsCrossed size={17} />
                You are ordering for{" "}
                <strong>Table {tableNumber}</strong>
              </div>
            )}
          </div>

          <div className="hero-art" aria-hidden="true">
            <span>☕</span>
            <span>🍊</span>
            <span>🥤</span>
          </div>
        </section>

        {/* ORDER SUCCESS MESSAGE */}
        {notice && <div className="success-box">{notice}</div>}

        {/* MENU SEARCH */}
        <section className="menu-toolbar">
          <div>
            <p className="eyebrow">OUR MENU</p>
            <h2>Pick your favourites</h2>
          </div>

          <div className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tea, juice, sandwich..."
            />
          </div>
        </section>

        {/* CATEGORY NAVIGATION */}
        <div className="category-nav">
          {orderedCategories.map((cat) => (
            <a href={`#${cat.id}`} key={cat.id}>
              {cat.name}
            </a>
          ))}
        </div>

        {/* MENU ITEMS */}
        {loading ? (
          <div className="loading">Loading fresh menu...</div>
        ) : (
          <div className="menu-sections">
            {orderedCategories.map((cat) => {
              const categoryItems = visibleItems
                .filter((item) => item.categoryId === cat.id)
                .sort(
                  (a, b) => (a.order ?? 0) - (b.order ?? 0)
                );

              if (!categoryItems.length) return null;

              return (
                <section
                  className="menu-section"
                  id={cat.id}
                  key={cat.id}
                >
                  <div className="section-title">
                    <div>
                      <p className="eyebrow">FRESHLY MADE</p>
                      <h3>{cat.name}</h3>
                    </div>

                    <span>{categoryItems.length} choices</span>
                  </div>

                  <div className="menu-grid">
                    {categoryItems.map((item) => (
                      <article className="menu-card" key={item.id}>
                        <div className="menu-card-top">
                          <div>
                            <h4>{item.name}</h4>
                            {item.description && (
                              <p>{item.description}</p>
                            )}
                          </div>

                          <strong>₹{item.price}</strong>
                        </div>

                        <button
                          type="button"
                          className="add-btn"
                          onClick={() => addToCart(item)}
                        >
                          + Add to order
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}

            {!visibleItems.length && (
              <p className="loading">
                {query
                  ? "No menu items match your search."
                  : "Menu items are currently unavailable."}
              </p>
            )}
          </div>
        )}

        {/* CLICKABLE ROAD ADDRESS AND CONTACT DETAILS */}
        <section className="visit-card contact-card">
          <div className="visit-details">
            <p className="eyebrow">COME SAY HELLO</p>
            <h2>{settings.cafeName || "Nectar OG R3 Cafe"}</h2>

            <p className="contact-subtitle">
              A co-brand of {settings.coBrand || "Juice Katey"}
            </p>

            <p className="contact-detail">
              <MapPin size={18} />
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Road No. 6 cafe location in Google Maps"
              >
                {settings.address || "Road No. 6"}
              </a>
            </p>

            <p className="contact-detail">
              <Phone size={18} />
              <a href={`tel:${PHONE_NUMBER_1}`}>
                {PHONE_NUMBER_1}
              </a>
            </p>

            <p className="contact-detail">
              <Phone size={18} />
              <a href={`tel:${PHONE_NUMBER_2}`}>
                {PHONE_NUMBER_2}
              </a>
            </p>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-btn"
            >
              <MapPin size={18} />
              Get Directions
            </a>
          </div>

          {settings.instagramUrl && (
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-btn"
            >
              <Instagram size={18} />
              @{settings.instagramHandle || "Instagram"}
            </a>
          )}
        </section>
      </main>

      {/* FLOATING CART BUTTON */}
      <button
        type="button"
        className="floating-cart"
        onClick={() => setCartOpen(true)}
      >
        <ShoppingCart size={20} />
        <span>
          {count
            ? `${count} item${count > 1 ? "s" : ""} · ₹${total}`
            : "View cart"}
        </span>
      </button>

      {/* BOTTOM CONTACT FOOTER */}
      <footer className="cafe-footer">
        <div className="footer-brand">
          <strong>{settings.cafeName || "Nectar OG R3 Cafe"}</strong>
          <span> · {settings.coBrand || "Juice Katey"}</span>
        </div>

        <div className="footer-contact-links">
          <a href={`tel:${PHONE_NUMBER_1}`}>
            <Phone size={15} />
            {PHONE_NUMBER_1}
          </a>

          <a href={`tel:${PHONE_NUMBER_2}`}>
            <Phone size={15} />
            {PHONE_NUMBER_2}
          </a>

          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin size={15} />
            Get Directions
          </a>

          {settings.instagramUrl && (
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={15} />
              Instagram · @{settings.instagramHandle || "Instagram"}
            </a>
          )}
        </div>
      </footer>

      {/* CART DRAWER */}
      <CartDrawer
        cart={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onClear={clearCart}
        total={total}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* CHECKOUT */}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          total={total}
          tableNumber={tableNumber}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={orderSuccess}
        />
      )}
    </div>
  );
}
