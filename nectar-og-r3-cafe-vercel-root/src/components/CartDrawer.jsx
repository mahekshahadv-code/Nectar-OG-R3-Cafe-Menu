import React from "react";
import React, { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

export default function CartDrawer({
  cart,
  open,
  onClose,
  onAdd,
  onRemove,
  onClear,
  total,
  onCheckout,
}) {
  if (!open) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <h2>Your Order</h2>
            <span>{cart.reduce((s, i) => s + i.qty, 0)} item(s)</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={42} />
            <p>Your cart is empty.</p>
            <button className="secondary-btn" onClick={onClose}>Browse Menu</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-row" key={item.id}>
                  <div className="cart-main">
                    <strong>{item.name}</strong>
                    <span>₹{item.price} each</span>
                  </div>
                  <div className="qty-control">
                    <button onClick={() => onRemove(item.id)}><Minus size={14}/></button>
                    <span>{item.qty}</span>
                    <button onClick={() => onAdd(item)}><Plus size={14}/></button>
                  </div>
                  <strong>₹{item.price * item.qty}</strong>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <button className="text-btn danger" onClick={onClear}>
                <Trash2 size={16}/> Clear cart
              </button>
              <div className="total-line">
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>
              <button className="primary-btn full" onClick={onCheckout}>
                Place Order
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
