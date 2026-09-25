import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

export const DEFAULT_SETTINGS = {
  cafeName: "Nectar OG R3 Cafe",
  coBrand: "A co-brand of Juice Katey",
  tagline: "Great Coffee · Fresh Juices · Delicious Bites",
  address: "R3 Badminton, Excellencia Road, Kothapet, Hyderabad",
  instagramHandle: "juice_katey",
  instagramUrl: "https://www.instagram.com/juice_katey/",
  orderNote: "Orders are prepared fresh. Please allow a little time during busy hours.",
};

export async function fetchMenu() {
  const [catSnap, itemSnap] = await Promise.all([
    getDocs(query(collection(db, "categories"), orderBy("order"))),
    getDocs(query(collection(db, "menuItems"), orderBy("order"))),
  ]);
  return {
    categories: catSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    items: itemSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
}

export async function saveCategory(category) {
  await setDoc(doc(db, "categories", category.id), {
    name: category.name.trim(),
    order: Number(category.order || 0),
    active: category.active !== false,
  });
}

export async function saveItem(item) {
  const payload = {
    categoryId: item.categoryId,
    name: item.name.trim(),
    price: Number(item.price),
    order: Number(item.order || 0),
    available: item.available !== false,
    description: (item.description || "").trim(),
  };
  await setDoc(doc(db, "menuItems", item.id), payload);
}

export async function removeCategory(id) {
  await deleteDoc(doc(db, "categories", id));
}

export async function removeItem(id) {
  await deleteDoc(doc(db, "menuItems", id));
}

export async function placeOrder(order) {
  const orderCode = `NG-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const ref = await addDoc(collection(db, "orders"), {
    ...order,
    orderCode,
    total: Number(order.total),
    status: "new",
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, orderCode };
}

export function subscribeToOrders(callback) {
  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function updateOrderStatus(id, status) {
  await updateDoc(doc(db, "orders", id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function seedMenu(defaultCategories, defaultItems) {
  for (const category of defaultCategories) await saveCategory(category);
  for (const menuItem of defaultItems) await saveItem(menuItem);
  await saveSettings(DEFAULT_SETTINGS);
}

export async function saveSettings(settings) {
  await setDoc(doc(db, "settings", "site"), settings, { merge: true });
}

export async function fetchSettings() {
  const snap = await getDoc(doc(db, "settings", "site"));
  return snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : DEFAULT_SETTINGS;
}
