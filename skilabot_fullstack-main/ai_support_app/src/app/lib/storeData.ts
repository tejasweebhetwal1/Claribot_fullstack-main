export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  halal?: boolean;
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Premium Pure Tahini 750g",
    category: "Pantry",
    price: 10.5,
    image: "🥣",
    description: "Smooth sesame tahini, perfect for dips, sauces and breakfast.",
    stock: 25,
    halal: true,
  },
  {
    id: "p2",
    name: "Flower Honey 1kg",
    category: "Breakfast",
    price: 10,
    image: "🍯",
    description: "Natural flower honey for tea, toast and desserts.",
    stock: 18,
    halal: true,
  },
  {
    id: "p3",
    name: "Rose Turkish Delight 250g",
    category: "Dessert",
    price: 5,
    image: "🍬",
    description: "Soft rose-flavoured Turkish delight.",
    stock: 40,
    halal: true,
  },
  {
    id: "p4",
    name: "Turkish Style Yogurt 2kg",
    category: "Dairy",
    price: 7,
    image: "🥛",
    description: "Thick Turkish-style yogurt for cooking and breakfast.",
    stock: 12,
    halal: true,
  },
  {
    id: "p5",
    name: "Halal Beef Sucuk 500g",
    category: "Meat",
    price: 13.6,
    image: "🥩",
    description: "Spiced halal beef sucuk sausage.",
    stock: 9,
    halal: true,
  },
  {
    id: "p6",
    name: "Dubai Pistachio Chocolate",
    category: "Chocolate",
    price: 16.15,
    image: "🍫",
    description: "Premium chocolate filled with pistachio cream.",
    stock: 20,
    halal: true,
  },
];