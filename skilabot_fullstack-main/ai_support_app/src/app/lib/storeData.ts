export type Category = {
  id: string;
  name: string;
  image: string;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  description: string;
  stock: number;
};

export const categories: Category[] = [
  {
    id: "pantry",
    name: "Pantry",
    image: "/categories/Pantry.jpg",
    description: "Tahini, oils, rice, sauces and daily essentials.",
  },
  {
    id: "meat",
    name: "Halal Meat",
    image: "/categories/Meat.png",
    description: "Halal sucuk and selected meat products.",
  },
  {
    id: "dairy",
    name: "Dairy",
    image: "/categories/Dairy.jpg",
    description: "Yogurt, cheese and chilled grocery items.",
  },
  {
    id: "sweets",
    name: "Sweets",
    image: "/categories/Sweets.jpg",
    description: "Turkish delight, chocolate and desserts.",
  },
  {
    id: "drinks",
    name: "Drinks",
    image: "/categories/Drinks.webp",
    description: "Tea, coffee and traditional drinks.",
  },
  {
    id: "bakery",
    name: "Bakery",
    image: "/categories/Bakery.jpg",
    description: "Fresh bread, wraps and bakery products.",
  },
];

export const products = [
  {
    id: "tahini",
    name: "Premium Pure Tahini 750g",
    category: "Pantry",
    price: 10.5,
    oldPrice: 12.5,
    image: "/tahini.jpeg",
    badge: "Sale",
    description: "Smooth sesame tahini for dips, sauces and breakfast.",
    stock: 25,
  },
  {
    id: "honey",
    name: "Flower Honey 1kg",
    category: "Breakfast",
    price: 10,
    image: "/products/Honey.webp",
    badge: "Popular",
    description: "Natural flower honey for tea, toast and desserts.",
    stock: 18,
  },
  {
    id: "turkish-delight",
    name: "Rose Turkish Delight 250g",
    category: "Sweets",
    price: 5,
    image: "/products/Turkish Delight.webp",
    description: "Soft rose flavoured Turkish delight.",
    stock: 40,
  },
  {
    id: "yogurt",
    name: "Turkish Style Yogurt 2kg",
    category: "Dairy",
    price: 7,
    image: "/products/Yoghurt.webp",
    description: "Thick Turkish-style yogurt for breakfast and cooking.",
    stock: 12,
  },
  {
    id: "sucuk",
    name: "Halal Beef Sucuk 500g",
    category: "Halal Meat",
    price: 13.6,
    oldPrice: 15,
    image: "/products/sucuk.jpg",
    badge: "Halal",
    description: "Spiced halal beef sucuk sausage.",
    stock: 9,
  },
  {
    id: "dubai-chocolate",
    name: "Dubai Pistachio Chocolate",
    category: "Sweets",
    price: 16.15,
    image: "/products/Dubai Chocolate.webp",
    badge: "New",
    description: "Premium chocolate with pistachio and kadaifi filling.",
    stock: 20,
  },
  {
    id: "tea",
    name: "Turkish Black Tea 500g",
    category: "Drinks",
    price: 11,
    image: "/products/Tea.webp",
    description: "Traditional black tea for daily brewing.",
    stock: 30,
  },
  {
    id: "olive-oil",
    name: "Extra Virgin Olive Oil 1L",
    category: "Pantry",
    price: 14.95,
    image: "/products/Olive Oil.avif",
    description: "Rich olive oil for salads, cooking and dips.",
    stock: 16,
  },
  {
    id: "rice",
    name: "Premium Rice 5kg",
    category: "Pantry",
    price: 18.99,
    image: "/products/Rice.jpg",
    description: "Premium rice for everyday family meals.",
    stock: 22,
  },
  {
    id: "coffee",
    name: "Turkish Coffee",
    category: "Drinks",
    price: 8.99,
    image: "/products/Turkish Coffee.jpg",
    description: "Traditional Turkish coffee with rich aroma.",
    stock: 30,
  },
  {
    id: "cheese",
    name: "Mediterranean Cheese",
    category: "Dairy",
    price: 9.99,
    image: "/products/Cheese.png",
    description: "Fresh cheese for breakfast and cooking.",
    stock: 15,
  },
];