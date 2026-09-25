import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { BarChart3, Check, Edit3, ExternalLink, LogOut, Plus, QrCode, RefreshCw, Save, Settings, Trash2, X } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { fetchMenu, fetchSettings, removeCategory, removeItem, saveCategory, saveItem, saveSettings, seedMenu, subscribeToOrders, updateOrderStatus, DEFAULT_SETTINGS } from "../lib/data";
import { defaultCategories, defaultItems } from "../lib/defaultMenu";
import { QRCodeSVG } from "qrcode.react";

const statuses = ["new", "preparing", "ready", "completed", "cancelled"];

export default function OwnerDashboard() {
  const navigate = useNavigate(); const [user,setUser]=useState(undefined); const [isOwner,setIsOwner]=useState(false); const [checking,setChecking]=useState(true);
  const [tab,setTab]=useState("orders"); const [categories,setCategories]=useState([]); const [items,setItems]=useState([]); const [orders,setOrders]=useState([]); const [settings,setSettings]=useState(DEFAULT_SETTINGS);
  const [editingItem,setEditingItem]=useState(null); const [editingCategory,setEditingCategory]=useState(null); const [notice,setNotice]=useState(""); const [seeding,setSeeding]=useState(false);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (u) => {
    setUser(u);

    if (!u) {
      setChecking(false);
      return;
    }

    try {
      const owner = await getDoc(doc(db, "owners", u.uid));
      setIsOwner(owner.exists());
    } catch (error) {
      console.error("Owner access check failed:", error);
      setIsOwner(false);
    } finally {
      setChecking(false);
    }
  });

  return unsubscribe;
}, []);
}, []);  useEffect(()=>{if(!isOwner)return; refreshMenu(); fetchSettings().then(setSettings); return subscribeToOrders(setOrders);},[isOwner]);
  async function refreshMenu(){const d=await fetchMenu();setCategories(d.categories);setItems(d.items);}
  function showNotice(m){setNotice(m);setTimeout(()=>setNotice(""),4500)}
  async function initializeMenu(){if(!window.confirm("Load the prepared starter menu and prices? Existing items with the same IDs will be updated."))return;setSeeding(true);try{await seedMenu(defaultCategories,defaultItems);await refreshMenu();setSettings(await fetchSettings());showNotice("Starter menu loaded. You can now edit everything.")}catch(e){console.error(e);showNotice("Could not load the starter menu.")}finally{setSeeding(false)}}
  async function logout(){await signOut(auth);navigate("/owner/login")}

  if(checking)return <div className="loading page-loading">Checking owner access...</div>;
  if(!user)return <Navigate to="/owner/login" replace/>;
  if(!isOwner)return <div className="auth-page"><div className="auth-card"><h1>Owner access not configured</h1><p>This account is not registered in the owners collection.</p><a className="back-link" href="/menu">Back to customer menu</a></div></div>;
  const activeOrders=orders.filter(o=>["new","preparing","ready"].includes(o.status));
  const todayKey=new Date().toDateString(); const todayOrders=orders.filter(o=>o.createdAt?.toDate && o.createdAt.toDate().toDateString()===todayKey && o.status!=="cancelled");
  const todaySales=todayOrders.reduce((s,o)=>s+(Number(o.total)||0),0);

  return <div className="dashboard">
    <header className="dashboard-head"><div><p className="eyebrow">{settings.cafeName}</p><h1>Owner Dashboard</h1><span className="owner-subtitle">{user.email}</span></div><div className="dashboard-actions"><a className="secondary-btn" href="/menu" target="_blank" rel="noreferrer"><ExternalLink size={16}/> Customer menu</a><button className="secondary-btn" onClick={logout}><LogOut size={16}/> Logout</button></div></header>
    {notice&&<div className="success-box dashboard-notice">{notice}</div>}
    <section className="stat-grid"><Stat label="Live orders" value={activeOrders.length} icon="⚡"/><Stat label="Today's orders" value={todayOrders.length} icon="🧾"/><Stat label="Today's sales" value={`₹${todaySales}`} icon="₹"/><Stat label="Menu items" value={items.filter(i=>i.available!==false).length} icon="☕"/></section>
    <nav className="dashboard-tabs"><button className={tab==="orders"?"active":""} onClick={()=>setTab("orders")}>Live Orders <span>{activeOrders.length}</span></button><button className={tab==="menu"?"active":""} onClick={()=>setTab("menu")}>Menu & Prices</button><button className={tab==="settings"?"active":""} onClick={()=>setTab("settings")}><Settings size={15}/> Cafe Settings</button><button className={tab==="qr"?"active":""} onClick={()=>setTab("qr")}><QrCode size={15}/> Permanent QR</button></nav>
    {tab==="orders"&&<OrdersPanel orders={orders} onStatus={async(id,s)=>{await updateOrderStatus(id,s);showNotice("Order status updated.")}}/>}
    {tab==="menu"&&<MenuAdmin categories={categories} items={items} onRefresh={refreshMenu} onEditItem={setEditingItem} onEditCategory={setEditingCategory} onDeleteItem={async(id)=>{await removeItem(id);await refreshMenu();showNotice("Item deleted.")}} onDeleteCategory={async(id)=>{await removeCategory(id);await refreshMenu();showNotice("Category deleted.")}} onInitialize={initializeMenu} seeding={seeding}/>} 
    {tab==="settings"&&<SettingsPanel settings={settings} onSaved={async(s)=>{await saveSettings(s);setSettings(s);showNotice("Cafe settings saved.")}}/>}
    {tab==="qr"&&<QrPanel/>}
    {editingItem&&<ItemEditor item={editingItem} categories={categories} onClose={()=>setEditingItem(null)} onSaved={async()=>{setEditingItem(null);await refreshMenu();showNotice("Menu item saved.")}}/>}
    {editingCategory&&<CategoryEditor category={editingCategory} onClose={()=>setEditingCategory(null)} onSaved={async()=>{setEditingCategory(null);await refreshMenu();showNotice("Category saved.")}}/>}
  </div>;
}

function Stat({label,value,icon}){return <div className="stat-card"><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></div>}

function OrdersPanel({orders,onStatus}){return <section className="admin-panel"><div className="panel-head"><div><p className="eyebrow">REAL-TIME</p><h2>Live Orders</h2><p>Keep this page open on the cafe phone/tablet for incoming orders.</p></div><span className="live-dot"><i/> Live</span></div>{!orders.length?<div className="empty-admin"><BarChart3 size={36}/><p>No orders yet.</p></div>:<div className="orders-grid">{orders.map(o=><article className={`order-card status-${o.status}`} key={o.id}><div className="order-card-head"><div><strong>{o.orderCode||`#${o.id.slice(-6).toUpperCase()}`}</strong><span>{o.customerName} · {o.phone}</span></div><span className="status-badge">{o.status}</span></div><div className="order-meta"><span>{o.orderType}{o.tableNumber?` · Table ${o.tableNumber}`:""}</span><span>{o.createdAt?.toDate?o.createdAt.toDate().toLocaleString():"Just now"}</span></div><div className="order-lines">{o.items?.map(i=><div key={i.id}><span>{i.qty} × {i.name}</span><strong>₹{i.qty*i.price}</strong></div>)}</div>{o.notes&&<div className="order-note">Note: {o.notes}</div>}<div className="order-bottom"><strong>Total ₹{o.total}</strong><select value={o.status} onChange={e=>onStatus(o.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div></article>)}</div>}</section>}

function MenuAdmin({categories,items,onRefresh,onEditItem,onEditCategory,onDeleteItem,onDeleteCategory,onInitialize,seeding}){const[filter,setFilter]=useState("all");const sorted=[...categories].sort((a,b)=>a.order-b.order);const visible=filter==="all"?sorted:sorted.filter(c=>c.id===filter);return <section className="admin-panel"><div className="panel-head"><div><p className="eyebrow">EDITABLE</p><h2>Menu & Prices</h2><p>Every price, item, category and availability flag can be changed here.</p></div><div className="panel-actions"><button className="secondary-btn" onClick={onRefresh}><RefreshCw size={16}/> Refresh</button><button className="primary-btn" onClick={onInitialize} disabled={seeding}><Plus size={16}/>{seeding?"Loading...":"Load starter menu"}</button></div></div><div className="admin-toolbar"><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All categories</option>{sorted.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select><button className="secondary-btn" onClick={()=>onEditCategory({id:`category-${Date.now()}`,name:"New Category",order:categories.length+1,active:true,isNew:true})}><Plus size={16}/> Add category</button></div>{!categories.length?<div className="empty-admin"><p>Your menu database is empty.</p><button className="primary-btn" onClick={onInitialize}>Load starter menu</button></div>:visible.map(cat=>{const catItems=items.filter(i=>i.categoryId===cat.id).sort((a,b)=>a.order-b.order);return <div className="admin-category" key={cat.id}><div className="admin-category-head"><div><h3>{cat.name}</h3><span>{catItems.length} items · {cat.active===false?"hidden from customers":"visible"}</span></div><div className="inline-actions"><button className="icon-btn" title="Edit category" onClick={()=>onEditCategory(cat)}><Edit3 size={16}/></button><button className="icon-btn danger-icon" title="Delete category" onClick={()=>{if(window.confirm("Delete this category? Its items will remain but become unassigned."))onDeleteCategory(cat.id)}}><Trash2 size={16}/></button></div></div><div className="admin-items">{catItems.map(i=><div className={`admin-item ${i.available===false?"disabled":""}`} key={i.id}><div><strong>{i.name}</strong>{i.description&&<span>{i.description}</span>}</div><div className="admin-item-right"><strong>₹{i.price}</strong>{i.available===false&&<em>Hidden</em>}<button className="icon-btn" onClick={()=>onEditItem(i)}><Edit3 size={16}/></button><button className="icon-btn danger-icon" onClick={()=>{if(window.confirm(`Delete ${i.name}?`))onDeleteItem(i.id)}}><Trash2 size={16}/></button></div></div>)}<button className="add-row" onClick={()=>onEditItem({id:`item-${Date.now()}`,categoryId:cat.id,name:"New Item",price:50,order:catItems.length+1,available:true,description:"",isNew:true})}><Plus size={16}/> Add item to {cat.name}</button></div></div>})}</section>}

function ItemEditor({item,categories,onClose,onSaved}){const[form,setForm]=useState(item);const[saving,setSaving]=useState(false);async function save(e){e.preventDefault();setSaving(true);try{await saveItem(form);await onSaved()}finally{setSaving(false)}}return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><p className="eyebrow">MENU ITEM</p><h2>{item.isNew?"Add item":"Edit item"}</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div><form className="form-grid" onSubmit={save}><label>Item name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Category<select value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>Price (₹)<input type="number" min="0" step="1" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} required/></label><label>Sort order<input type="number" value={form.order} onChange={e=>setForm({...form,order:Number(e.target.value)})}/></label><label>Description<textarea rows="3" value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Optional description shown to customers"/></label><label className="checkbox-label"><input type="checkbox" checked={form.available!==false} onChange={e=>setForm({...form,available:e.target.checked})}/> Show this item to customers</label><button className="primary-btn full" disabled={saving}><Save size={16}/>{saving?"Saving...":"Save item"}</button></form></div></div>}

function CategoryEditor({category,onClose,onSaved}){const[form,setForm]=useState(category);const[saving,setSaving]=useState(false);async function save(e){e.preventDefault();setSaving(true);try{await saveCategory(form);await onSaved()}finally{setSaving(false)}}return <div className="modal-backdrop"><div className="modal small-modal"><div className="modal-head"><div><p className="eyebrow">MENU CATEGORY</p><h2>{category.isNew?"Add category":"Edit category"}</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div><form className="form-grid" onSubmit={save}><label>Category name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Sort order<input type="number" value={form.order} onChange={e=>setForm({...form,order:Number(e.target.value)})}/></label><label className="checkbox-label"><input type="checkbox" checked={form.active!==false} onChange={e=>setForm({...form,active:e.target.checked})}/> Show category to customers</label><button className="primary-btn full" disabled={saving}><Save size={16}/>{saving?"Saving...":"Save category"}</button></form></div></div>}

function SettingsPanel({settings,onSaved}){const[form,setForm]=useState(settings);const[saving,setSaving]=useState(false);async function submit(e){e.preventDefault();setSaving(true);try{await onSaved(form)}finally{setSaving(false)}}return <section className="admin-panel"><div className="panel-head"><div><p className="eyebrow">BRANDING & CONTACT</p><h2>Cafe Settings</h2><p>Change these details once and they update on the customer menu.</p></div></div><form className="settings-grid" onSubmit={submit}><label>Cafe name<input value={form.cafeName} onChange={e=>setForm({...form,cafeName:e.target.value})}/></label><label>Co-brand line<input value={form.coBrand} onChange={e=>setForm({...form,coBrand:e.target.value})}/></label><label>Menu tagline<input value={form.tagline} onChange={e=>setForm({...form,tagline:e.target.value})}/></label><label>Address<input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label><label>Instagram handle<input value={form.instagramHandle} onChange={e=>setForm({...form,instagramHandle:e.target.value.replace(/^@/,"")})}/></label><label>Instagram URL<input type="url" value={form.instagramUrl} onChange={e=>setForm({...form,instagramUrl:e.target.value})}/></label><label className="wide">Customer order note<textarea rows="3" value={form.orderNote} onChange={e=>setForm({...form,orderNote:e.target.value})}/></label><div className="wide"><button className="primary-btn" disabled={saving}><Save size={16}/>{saving?"Saving...":"Save cafe settings"}</button></div></form></section>}

function QrPanel(){const menuUrl=`${window.location.origin}/menu`;return <section className="admin-panel qr-panel"><div><p className="eyebrow">PRINT ON TABLES & COUNTERS</p><h2>Permanent Customer Menu QR</h2><p>This QR opens the fixed <strong>/menu</strong> page. You can change prices and menu items later without reprinting it.</p><div className="qr-instructions"><h3>For table-by-table ordering</h3><ol><li>Print a QR for your main menu.</li><li>For a table-specific QR, add <code>?table=1</code>, <code>?table=2</code>, etc. to the menu URL.</li><li>The customer checkout will automatically show their table number.</li><li>Keep the same domain after printing.</li></ol></div></div><div className="qr-card"><QRCodeSVG value={menuUrl} size={260} includeMargin/><strong>{menuUrl}</strong><button className="secondary-btn" onClick={()=>navigator.clipboard?.writeText(menuUrl)}>Copy menu link</button></div></section>}
