import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { placeOrder } from "../lib/data";

export default function CheckoutModal({ cart, total, tableNumber, onClose, onSuccess }) {
  const [form, setForm] = useState({ customerName: "", phone: "", orderType: tableNumber ? "dine-in" : "takeaway", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!form.customerName.trim() || !/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
      setError("Please enter your name and a valid 10-digit mobile number.");
      return;
    }
    setSaving(true); setError("");
    try {
      const response = await placeOrder({
        customerName: form.customerName.trim(),
        phone: form.phone.replace(/\D/g, ""),
        orderType: form.orderType,
        tableNumber: tableNumber || "",
        notes: form.notes.trim(),
        items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        total,
      });
      setResult(response);
    } catch (err) {
      console.error(err);
      setError("Could not place the order. Please check your internet connection and try again.");
    } finally { setSaving(false); }
  }

  if (result) return (
    <div className="modal-backdrop">
      <div className="modal confirmation-modal">
        <div className="success-icon"><CheckCircle2 size={42}/></div>
        <p className="eyebrow">ORDER RECEIVED</p>
        <h2>Thank you, {form.customerName}!</h2>
        <p>Your order has been sent to Nectar OG R3 Cafe.</p>
        <div className="order-code">{result.orderCode}</div>
        {tableNumber && <p className="table-confirm">Table {tableNumber}</p>}
        <button className="primary-btn full" onClick={() => onSuccess(result)}>Done</button>
      </div>
    </div>
  );

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div><p className="eyebrow">CHECKOUT</p><h2>Place your order</h2><p>Total: ₹{total}</p></div>
          <button className="icon-btn" onClick={onClose}><X /></button>
        </div>
        <form onSubmit={submit} className="form-grid">
          {tableNumber && <div className="table-banner">Ordering from <strong>Table {tableNumber}</strong></div>}
          <label>Name<input required value={form.customerName} onChange={(e) => setForm({...form, customerName: e.target.value})} placeholder="Your name" /></label>
          <label>Mobile number<input required type="tel" inputMode="numeric" maxLength="10" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, "").slice(0,10)})} placeholder="10-digit mobile" /></label>
          <label>Order type<select value={form.orderType} onChange={(e) => setForm({...form, orderType: e.target.value})}><option value="takeaway">Takeaway</option><option value="dine-in">Dine-in</option></select></label>
          <label>Notes (optional)<textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Less sugar, no ice, extra spicy, etc." rows="3" /></label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary-btn full" disabled={saving}>{saving ? "Sending order..." : `Confirm Order · ₹${total}`}</button>
        </form>
      </div>
    </div>
  );
}
