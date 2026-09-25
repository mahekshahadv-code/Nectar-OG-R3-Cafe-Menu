export const defaultCategories = [
  { id: "hot-beverages", name: "Hot Beverages", order: 1, active: true },
  { id: "cold-coffee", name: "Cold Coffee", order: 2, active: true },
  { id: "fresh-fruit-juices", name: "Fresh Fruit Juices", order: 3, active: true },
  { id: "milk-shakes", name: "Milk Shakes", order: 4, active: true },
  { id: "smoothies", name: "Smoothies", order: 5, active: true },
  { id: "thickshakes", name: "ThickShakes", order: 6, active: true },
  { id: "bites", name: "Bites", order: 7, active: true },
  { id: "mocktails", name: "Mocktails", order: 8, active: true },
];

const item = (id, categoryId, name, price, order) => ({
  id, categoryId, name, price, order, available: true, description: ""
});

export const defaultItems = [
  item("tea", "hot-beverages", "Tea", 20, 1),
  item("special-tea", "hot-beverages", "Special Tea", 30, 2),
  item("lemon-tea", "hot-beverages", "Lemon Tea", 30, 3),
  item("green-tea", "hot-beverages", "Green Tea", 30, 4),
  item("coffee", "hot-beverages", "Coffee", 30, 5),
  item("cappuccino", "hot-beverages", "Cappuccino", 50, 6),
  item("horlicks", "hot-beverages", "Horlicks", 30, 7),
  item("boost", "hot-beverages", "Boost", 30, 8),

  item("cold-coffee", "cold-coffee", "Cold Coffee", 80, 1),

  item("apple-juice", "fresh-fruit-juices", "Apple", 50, 1),
  item("watermelon-juice", "fresh-fruit-juices", "Watermelon", 50, 2),
  item("papaya-juice", "fresh-fruit-juices", "Papaya", 50, 3),
  item("mosambi-juice", "fresh-fruit-juices", "Mosambi", 50, 4),
  item("black-grapes-juice", "fresh-fruit-juices", "Black Grapes", 50, 5),
  item("orange-juice", "fresh-fruit-juices", "Orange", 50, 6),
  item("pomegranate-juice", "fresh-fruit-juices", "Pomegranate", 60, 7),
  item("sapota-juice", "fresh-fruit-juices", "Sapota", 50, 8),
  item("carrot-juice", "fresh-fruit-juices", "Carrot", 50, 9),
  item("beetroot-juice", "fresh-fruit-juices", "Beetroot", 50, 10),
  item("carrot-beetroot", "fresh-fruit-juices", "Carrot & Beetroot", 60, 11),
  item("pineapple-juice", "fresh-fruit-juices", "Pineapple", 60, 12),
  item("mango-juice", "fresh-fruit-juices", "Mango", 60, 13),
  item("mixed-fruit-juice", "fresh-fruit-juices", "Mixed Fruit", 70, 14),
  item("fruit-bowl", "fresh-fruit-juices", "Fresh Fruit Bowl", 100, 15),
  item("mixed-fresh-juices", "fresh-fruit-juices", "Mixed Fresh Juices", 80, 16),
  item("abc-juice", "fresh-fruit-juices", "ABC Juice (Energy Booster)", 80, 17),

  item("chocolate-smoothie", "smoothies", "Chocolate", 90, 1),
  item("banana-smoothie", "smoothies", "Banana", 80, 2),
  item("apple-smoothie", "smoothies", "Apple", 90, 3),
  item("papaya-smoothie", "smoothies", "Papaya", 80, 4),
  item("avocado-smoothie", "smoothies", "Avocado", 110, 5),
  item("mixed-fruit-smoothie", "smoothies", "Mixed Fruit", 100, 6),
  item("sapota-smoothie", "smoothies", "Sapota", 90, 7),
  item("strawberry-smoothie", "smoothies", "Strawberry", 100, 8),

  item("apple-milkshake", "milk-shakes", "Apple Milkshake", 90, 1),
  item("banana-milkshake", "milk-shakes", "Banana Milkshake", 80, 2),
  item("oreo-milkshake", "milk-shakes", "Oreo Milkshake", 100, 3),
  item("kitkat-milkshake", "milk-shakes", "KitKat Milkshake", 110, 4),
  item("dryfruit-milkshake", "milk-shakes", "Dry Fruit Milkshake", 120, 5),
  item("mixed-fruit-milkshake", "milk-shakes", "Mixed Fruit Milkshake", 100, 6),

  item("oreo-thickshake", "thickshakes", "Oreo Thickshake", 120, 1),
  item("kitkat-thickshake", "thickshakes", "KitKat Thickshake", 130, 2),
  item("belgium-dark-chocolate", "thickshakes", "Belgium Dark Chocolate Thickshake", 150, 3),

  item("plain-sandwich", "bites", "Plain Sandwich", 50, 1),
  item("grill-sandwich", "bites", "Grill Sandwich", 70, 2),
  item("corn-cheese-grilled", "bites", "Corn & Cheese Grilled Sandwich", 90, 3),
  item("nutella-sandwich", "bites", "Nutella Sandwich", 80, 4),
  item("bread-peanut-butter", "bites", "Bread Peanut Butter", 50, 5),
  item("peanut-butter-toast", "bites", "Peanut Butter Toast", 60, 6),
  item("banana-peanut-butter", "bites", "Banana Peanut Butter Sandwich", 80, 7),
  item("veg-maggi", "bites", "Veg Maggi", 60, 8),
  item("cheese-maggi", "bites", "Cheese Maggi", 80, 9),
  item("butter-maggi", "bites", "Butter Maggi", 70, 10),
  item("butter-cheese-maggi", "bites", "Butter Cheese Maggi", 90, 11),
];
