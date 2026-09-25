import React from "react";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Edit3,
  ExternalLink,
  LogOut,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  fetchMenu,
  fetchSettings,
  removeCategory,
  removeItem,
  saveCategory,
  saveItem,
  saveSettings,
  seedMenu,
  subscribeToOrders,
  updateOrderStatus,
  DEFAULT_SETTINGS,
} from "../lib/data";
import { defaultCategories, defaultItems } from "../lib/defaultMenu";
import { QRCodeSVG } from "qrcode.react";

const statuses = [
  "new",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

export default function OwnerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(undefined);
  const [isOwner, setIsOwner] = useState(false);
  const [checking, setChecking] = useState(true);

  const [tab, setTab] = useState("orders");
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [notice, setNotice] = useState("");
  const [seeding, setSeeding] = useState(false);

  /*
   * OWNER AUTH CHECK
   *
   * This version always finishes the checking state.
   * It also logs the actual Firebase error in the browser console.
   */
  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;

      setUser(currentUser);

      if (!currentUser) {
        setIsOwner(false);
        setChecking(false);
        return;
      }

      try {
        console.log("Checking owner access for UID:", currentUser.uid);

        const ownerRef = doc(db, "owners", currentUser.uid);
        const ownerSnapshot = await getDoc(ownerRef);

        if (!active) return;

        console.log("Owner document exists:", ownerSnapshot.exists());

        setIsOwner(ownerSnapshot.exists());
      } catch (error) {
        console.error("OWNER ACCESS CHECK ERROR:", error);

        if (!active) return;

        setIsOwner(false);
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  /*
   * LOAD DASHBOARD DATA AFTER OWNER ACCESS IS CONFIRMED
   */
  useEffect(() => {
    if (!isOwner) return;

    let unsubscribeOrders = null;

    async function loadDashboard() {
      try {
        await refreshMenu();

        const currentSettings = await fetchSettings();
        setSettings(currentSettings);

        unsubscribeOrders = subscribeToOrders(setOrders);
      } catch (error) {
        console.error("Dashboard loading error:", error);
        showNotice("Could not load dashboard data.");
      }
    }

    loadDashboard();

    return () => {
      if (typeof unsubscribeOrders === "function") {
        unsubscribeOrders();
      }
    };
  }, [isOwner]);

  async function refreshMenu() {
    try {
      const data = await fetchMenu();

      setCategories(data.categories || []);
      setItems(data.items || []);
    } catch (error) {
      console.error("Menu loading error:", error);
      throw error;
    }
  }

  function showNotice(message) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 4500);
  }

  async function initializeMenu() {
    const confirmed = window.confirm(
      "Load the prepared starter menu and prices? Existing items with the same IDs will be updated."
    );

    if (!confirmed) return;

    setSeeding(true);

    try {
      await seedMenu(defaultCategories, defaultItems);
      await refreshMenu();

      const currentSettings = await fetchSettings();
      setSettings(currentSettings);

      showNotice(
        "Starter menu loaded. You can now edit everything from this dashboard."
      );
    } catch (error) {
      console.error("Starter menu error:", error);
      showNotice("Could not load the starter menu.");
    } finally {
      setSeeding(false);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      navigate("/owner/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  /*
   * SHOW LOADING STATE
   */
  if (checking) {
    return (
      <div className="loading page-loading">
        Checking owner access...
      </div>
    );
  }

  /*
   * NOT LOGGED IN
   */
  if (!user) {
    return <Navigate to="/owner/login" replace />;
  }

  /*
   * LOGGED IN BUT NOT AN OWNER
   */
  if (!isOwner) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="mini-logo">OG</div>

          <p className="eyebrow">NECTAR OG R3 CAFE</p>

          <h1>Owner access not configured</h1>

          <p>
            This account is logged in, but its Firebase owner record was not
            found.
          </p>

          <p className="owner-help">
            Owner UID:
            <br />
            <code>{user.uid}</code>
          </p>

          <a className="back-link" href="/menu">
            ← Back to customer menu
          </a>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((order) =>
    ["new", "preparing", "ready"].includes(order.status)
  );

  const todayKey = new Date().toDateString();

  const todayOrders = orders.filter(
    (order) =>
      order.createdAt?.toDate &&
      order.createdAt.toDate().toDateString() === todayKey &&
      order.status !== "cancelled"
  );

  const todaySales = todayOrders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  return (
    <div className="dashboard">
      <header className="dashboard-head">
        <div>
          <p className="eyebrow">{settings.cafeName}</p>

          <h1>Owner Dashboard</h1>

          <span className="owner-subtitle">{user.email}</span>
        </div>

        <div className="dashboard-actions">
          <a
            className="secondary-btn"
            href="/menu"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={16} />
            Customer menu
          </a>

          <button className="secondary-btn" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {notice && (
        <div className="success-box dashboard-notice">
          {notice}
        </div>
      )}

      <section className="stat-grid">
        <Stat
          label="Live orders"
          value={activeOrders.length}
          icon="⚡"
        />

        <Stat
          label="Today's orders"
          value={todayOrders.length}
          icon="🧾"
        />

        <Stat
          label="Today's sales"
          value={`₹${todaySales}`}
          icon="₹"
        />

        <Stat
          label="Menu items"
          value={items.filter((item) => item.available !== false).length}
          icon="☕"
        />
      </section>

      <nav className="dashboard-tabs">
        <button
          className={tab === "orders" ? "active" : ""}
          onClick={() => setTab("orders")}
        >
          Live Orders <span>{activeOrders.length}</span>
        </button>

        <button
          className={tab === "menu" ? "active" : ""}
          onClick={() => setTab("menu")}
        >
          Menu & Prices
        </button>

        <button
          className={tab === "settings" ? "active" : ""}
          onClick={() => setTab("settings")}
        >
          <Settings size={15} />
          Cafe Settings
        </button>

        <button
          className={tab === "qr" ? "active" : ""}
          onClick={() => setTab("qr")}
        >
          <QrCode size={15} />
          Permanent QR
        </button>
      </nav>

      {tab === "orders" && (
        <OrdersPanel
          orders={orders}
          onStatus={async (id, status) => {
            try {
              await updateOrderStatus(id, status);
              showNotice("Order status updated.");
            } catch (error) {
              console.error(error);
              showNotice("Could not update order status.");
            }
          }}
        />
      )}

      {tab === "menu" && (
        <MenuAdmin
          categories={categories}
          items={items}
          onRefresh={refreshMenu}
          onEditItem={setEditingItem}
          onEditCategory={setEditingCategory}
          onDeleteItem={async (id) => {
            try {
              await removeItem(id);
              await refreshMenu();
              showNotice("Item deleted.");
            } catch (error) {
              console.error(error);
              showNotice("Could not delete item.");
            }
          }}
          onDeleteCategory={async (id) => {
            try {
              await removeCategory(id);
              await refreshMenu();
              showNotice("Category deleted.");
            } catch (error) {
              console.error(error);
              showNotice("Could not delete category.");
            }
          }}
          onInitialize={initializeMenu}
          seeding={seeding}
        />
      )}

      {tab === "settings" && (
        <SettingsPanel
          settings={settings}
          onSaved={async (newSettings) => {
            try {
              await saveSettings(newSettings);
              setSettings(newSettings);
              showNotice("Cafe settings saved.");
            } catch (error) {
              console.error(error);
              showNotice("Could not save cafe settings.");
            }
          }}
        />
      )}

      {tab === "qr" && <QrPanel />}

      {editingItem && (
        <ItemEditor
          item={editingItem}
          categories={categories}
          onClose={() => setEditingItem(null)}
          onSaved={async () => {
            setEditingItem(null);
            await refreshMenu();
            showNotice("Menu item saved.");
          }}
        />
      )}

      {editingCategory && (
        <CategoryEditor
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSaved={async () => {
            setEditingCategory(null);
            await refreshMenu();
            showNotice("Category saved.");
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="stat-card">
      <span>{icon}</span>

      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}

function OrdersPanel({ orders, onStatus }) {
  return (
    <section className="admin-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">REAL-TIME</p>

          <h2>Live Orders</h2>

          <p>
            Keep this page open on the cafe phone/tablet for incoming orders.
          </p>
        </div>

        <span className="live-dot">
          <i /> Live
        </span>
      </div>

      {!orders.length ? (
        <div className="empty-admin">
          <BarChart3 size={36} />

          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <article
              className={`order-card status-${order.status}`}
              key={order.id}
            >
              <div className="order-card-head">
                <div>
                  <strong>
                    {order.orderCode ||
                      `#${order.id.slice(-6).toUpperCase()}`}
                  </strong>

                  <span>
                    {order.customerName} · {order.phone}
                  </span>
                </div>

                <span className="status-badge">
                  {order.status}
                </span>
              </div>

              <div className="order-meta">
                <span>
                  {order.orderType}
                  {order.tableNumber
                    ? ` · Table ${order.tableNumber}`
                    : ""}
                </span>

                <span>
                  {order.createdAt?.toDate
                    ? order.createdAt.toDate().toLocaleString()
                    : "Just now"}
                </span>
              </div>

              <div className="order-lines">
                {order.items?.map((item) => (
                  <div key={item.id}>
                    <span>
                      {item.qty} × {item.name}
                    </span>

                    <strong>
                      ₹{item.qty * item.price}
                    </strong>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="order-note">
                  Note: {order.notes}
                </div>
              )}

              <div className="order-bottom">
                <strong>Total ₹{order.total}</strong>

                <select
                  value={order.status}
                  onChange={(event) =>
                    onStatus(order.id, event.target.value)
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function MenuAdmin({
  categories,
  items,
  onRefresh,
  onEditItem,
  onEditCategory,
  onDeleteItem,
  onDeleteCategory,
  onInitialize,
  seeding,
}) {
  const [filter, setFilter] = useState("all");

  const sorted = [...categories].sort(
    (a, b) => a.order - b.order
  );

  const visible =
    filter === "all"
      ? sorted
      : sorted.filter((category) => category.id === filter);

  return (
    <section className="admin-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">EDITABLE</p>

          <h2>Menu & Prices</h2>

          <p>
            Every price, item, category and availability flag can be
            changed here.
          </p>
        </div>

        <div className="panel-actions">
          <button className="secondary-btn" onClick={onRefresh}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="primary-btn"
            onClick={onInitialize}
            disabled={seeding}
          >
            <Plus size={16} />

            {seeding ? "Loading..." : "Load starter menu"}
          </button>
        </div>
      </div>

      <div className="admin-toolbar">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All categories</option>

          {sorted.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button
          className="secondary-btn"
          onClick={() =>
            onEditCategory({
              id: `category-${Date.now()}`,
              name: "New Category",
              order: categories.length + 1,
              active: true,
              isNew: true,
            })
          }
        >
          <Plus size={16} />
          Add category
        </button>
      </div>

      {!categories.length ? (
        <div className="empty-admin">
          <p>Your menu database is empty.</p>

          <button className="primary-btn" onClick={onInitialize}>
            Load starter menu
          </button>
        </div>
      ) : (
        visible.map((category) => {
          const categoryItems = items
            .filter((item) => item.categoryId === category.id)
            .sort((a, b) => a.order - b.order);

          return (
            <div
              className="admin-category"
              key={category.id}
            >
              <div className="admin-category-head">
                <div>
                  <h3>{category.name}</h3>

                  <span>
                    {categoryItems.length} items ·{" "}
                    {category.active === false
                      ? "hidden from customers"
                      : "visible"}
                  </span>
                </div>

                <div className="inline-actions">
                  <button
                    className="icon-btn"
                    title="Edit category"
                    onClick={() =>
                      onEditCategory(category)
                    }
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    className="icon-btn danger-icon"
                    title="Delete category"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Delete this category? Its items will remain but become unassigned."
                        )
                      ) {
                        onDeleteCategory(category.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="admin-items">
                {categoryItems.map((item) => (
                  <div
                    className={`admin-item ${
                      item.available === false
                        ? "disabled"
                        : ""
                    }`}
                    key={item.id}
                  >
                    <div>
                      <strong>{item.name}</strong>

                      {item.description && (
                        <span>{item.description}</span>
                      )}
                    </div>

                    <div className="admin-item-right">
                      <strong>₹{item.price}</strong>

                      {item.available === false && (
                        <em>Hidden</em>
                      )}

                      <button
                        className="icon-btn"
                        onClick={() => onEditItem(item)}
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        className="icon-btn danger-icon"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete ${item.name}?`
                            )
                          ) {
                            onDeleteItem(item.id);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  className="add-row"
                  onClick={() =>
                    onEditItem({
                      id: `item-${Date.now()}`,
                      categoryId: category.id,
                      name: "New Item",
                      price: 50,
                      order: categoryItems.length + 1,
                      available: true,
                      description: "",
                      isNew: true,
                    })
                  }
                >
                  <Plus size={16} />
                  Add item to {category.name}
                </button>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

function ItemEditor({
  item,
  categories,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);

  async function save(event) {
    event.preventDefault();

    setSaving(true);

    try {
      await saveItem(form);
      await onSaved();
    } catch (error) {
      console.error("Save item error:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">MENU ITEM</p>

            <h2>
              {item.isNew ? "Add item" : "Edit item"}
            </h2>
          </div>

          <button className="icon-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        <form className="form-grid" onSubmit={save}>
          <label>
            Item name

            <input
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Category

            <select
              value={form.categoryId}
              onChange={(event) =>
                setForm({
                  ...form,
                  categoryId: event.target.value,
                })
              }
            >
              {categories.map((category) => (
                <option
                  value={category.id}
                  key={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Price (₹)

            <input
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(event) =>
                setForm({
                  ...form,
                  price: Number(event.target.value),
                })
              }
              required
            />
          </label>

          <label>
            Sort order

            <input
              type="number"
              value={form.order}
              onChange={(event) =>
                setForm({
                  ...form,
                  order: Number(event.target.value),
                })
              }
            />
          </label>

          <label>
            Description

            <textarea
              rows="3"
              value={form.description || ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
              placeholder="Optional description shown to customers"
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.available !== false}
              onChange={(event) =>
                setForm({
                  ...form,
                  available: event.target.checked,
                })
              }
            />

            Show this item to customers
          </label>

          <button
            className="primary-btn full"
            disabled={saving}
          >
            <Save size={16} />

            {saving ? "Saving..." : "Save item"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CategoryEditor({
  category,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(category);
  const [saving, setSaving] = useState(false);

  async function save(event) {
    event.preventDefault();

    setSaving(true);

    try {
      await saveCategory(form);
      await onSaved();
    } catch (error) {
      console.error("Save category error:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal small-modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">MENU CATEGORY</p>

            <h2>
              {category.isNew
                ? "Add category"
                : "Edit category"}
            </h2>
          </div>

          <button className="icon-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        <form className="form-grid" onSubmit={save}>
          <label>
            Category name

            <input
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Sort order

            <input
              type="number"
              value={form.order}
              onChange={(event) =>
                setForm({
                  ...form,
                  order: Number(event.target.value),
                })
              }
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.active !== false}
              onChange={(event) =>
                setForm({
                  ...form,
                  active: event.target.checked,
                })
              }
            />

            Show category to customers
          </label>

          <button
            className="primary-btn full"
            disabled={saving}
          >
            <Save size={16} />

            {saving ? "Saving..." : "Save category"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onSaved }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();

    setSaving(true);

    try {
      await onSaved(form);
    } catch (error) {
      console.error("Settings save error:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">BRANDING & CONTACT</p>

          <h2>Cafe Settings</h2>

          <p>
            Change these details once and they update on the
            customer menu.
          </p>
        </div>
      </div>

      <form className="settings-grid" onSubmit={submit}>
        <label>
          Cafe name

          <input
            value={form.cafeName}
            onChange={(event) =>
              setForm({
                ...form,
                cafeName: event.target.value,
              })
            }
          />
        </label>

        <label>
          Co-brand line

          <input
            value={form.coBrand}
            onChange={(event) =>
              setForm({
                ...form,
                coBrand: event.target.value,
              })
            }
          />
        </label>

        <label>
          Menu tagline

          <input
            value={form.tagline}
            onChange={(event) =>
              setForm({
                ...form,
                tagline: event.target.value,
              })
            }
          />
        </label>

        <label>
          Address

          <input
            value={form.address}
            onChange={(event) =>
              setForm({
                ...form,
                address: event.target.value,
              })
            }
          />
        </label>

        <label>
          Instagram handle

          <input
            value={form.instagramHandle}
            onChange={(event) =>
              setForm({
                ...form,
                instagramHandle: event.target.value.replace(
                  /^@/,
                  ""
                ),
              })
            }
          />
        </label>

        <label>
          Instagram URL

          <input
            type="url"
            value={form.instagramUrl}
            onChange={(event) =>
              setForm({
                ...form,
                instagramUrl: event.target.value,
              })
            }
          />
        </label>

        <label className="wide">
          Customer order note

          <textarea
            rows="3"
            value={form.orderNote}
            onChange={(event) =>
              setForm({
                ...form,
                orderNote: event.target.value,
              })
            }
          />
        </label>

        <div className="wide">
          <button
            className="primary-btn"
            disabled={saving}
          >
            <Save size={16} />

            {saving
              ? "Saving..."
              : "Save cafe settings"}
          </button>
        </div>
      </form>
    </section>
  );
}

function QrPanel() {
  const menuUrl = `${window.location.origin}/menu`;

  return (
    <section className="admin-panel qr-panel">
      <div>
        <p className="eyebrow">
          PRINT ON TABLES & COUNTERS
        </p>

        <h2>Permanent Customer Menu QR</h2>

        <p>
          This QR opens the fixed <strong>/menu</strong> page.
          You can change prices and menu items later without
          reprinting it.
        </p>

        <div className="qr-instructions">
          <h3>For table-by-table ordering</h3>

          <ol>
            <li>
              Print a QR for your main menu.
            </li>

            <li>
              For a table-specific QR, add{" "}
              <code>?table=1</code>,{" "}
              <code>?table=2</code>, etc. to the menu URL.
            </li>

            <li>
              The customer checkout will automatically show
              their table number.
            </li>

            <li>
              Keep the same domain after printing.
            </li>
          </ol>
        </div>
      </div>

      <div className="qr-card">
        <QRCodeSVG
          value={menuUrl}
          size={260}
          includeMargin
        />

        <strong>{menuUrl}</strong>

        <button
          className="secondary-btn"
          onClick={() =>
            navigator.clipboard?.writeText(menuUrl)
          }
        >
          Copy menu link
        </button>
      </div>
    </section>
  );
}
