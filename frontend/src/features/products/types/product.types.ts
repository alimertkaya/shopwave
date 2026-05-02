export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock?: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  size: number;
}

export interface CategoryConfig {
  id: string;
  label: string;
  emoji: string;
  color: string;       // bg + text tailwind classes
  sub: string[];
}

export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    id: 'Electronics',
    label: 'Electronics',
    emoji: '📱',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    sub: ['Phone & Accessories', 'Laptop & Computer', 'Tablet', 'Headphones & Speakers', 'Camera & Photography', 'TV & Audio Systems', 'Gaming Consoles', 'Smart Watch & Band'],
  },
  {
    id: 'Clothing',
    label: 'Clothing & Fashion',
    emoji: '👕',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    sub: ["Women's Clothing", "Men's Clothing", "Children's Clothing", 'Shoes', 'Bags & Wallets', 'Watches & Accessories', 'Underwear', 'Sportswear'],
  },
  {
    id: 'Home & Living',
    label: 'Home & Living',
    emoji: '🏠',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    sub: ['Furniture', 'Kitchen & Cooking', 'Decoration', 'Lighting', 'Bathroom', 'Garden & Balcony', 'Cleaning', 'Textile & Bedding'],
  },
  {
    id: 'Sports',
    label: 'Sports & Outdoor',
    emoji: '⚽',
    color: 'bg-green-50 text-green-700 border-green-200',
    sub: ['Fitness & Gym', 'Running & Walking', 'Cycling', 'Camping & Nature', 'Swimming & Water Sports', 'Team Sports', 'Mountaineering', 'Yoga & Pilates'],
  },
  {
    id: 'Books',
    label: 'Books & Media',
    emoji: '📚',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    sub: ['Fiction & Stories', 'Science & Technology', 'Self-Development', "Children's Books", 'History & Biography', 'Art & Design', 'Music', 'Movies & TV'],
  },
  {
    id: 'Toys',
    label: 'Toys & Games',
    emoji: '🧸',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    sub: ['Baby Toys', 'Lego & Puzzles', 'Board Games', 'Educational Toys', 'Outdoor Games', 'Collectibles', 'Video Games'],
  },
  {
    id: 'Cosmetics',
    label: 'Cosmetics & Health',
    emoji: '💄',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    sub: ['Skin Care', 'Makeup', 'Perfume & Deodorant', 'Hair Care', 'Oral Care', 'Vitamins & Supplements', 'Diet & Fitness', 'Medical'],
  },
  {
    id: 'Automotive',
    label: 'Automotive',
    emoji: '🚗',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    sub: ['Interior Accessories', 'Exterior Accessories', 'Maintenance & Washing', 'Safety', 'Tires & Wheels', 'Electrical & Electronics', 'Motorcycle'],
  },
  {
    id: 'Pet Shop',
    label: 'Pet Shop',
    emoji: '🐾',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    sub: ['Dog', 'Cat', 'Bird', 'Fish & Aquarium', 'Rodents', 'Food & Treats', 'Health & Grooming'],
  },
  {
    id: 'Grocery',
    label: 'Grocery & Market',
    emoji: '🛒',
    color: 'bg-lime-50 text-lime-700 border-lime-200',
    sub: ['Snacks', 'Beverages', 'Breakfast', 'Organic & Natural', 'Canned & Ready Meals', 'Bakery & Pastry', 'Spices & Sauces'],
  },
  {
    id: 'Other',
    label: 'Other',
    emoji: '📦',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    sub: [],
  },
];

// Flat list (for form select and filters)
export const PRODUCT_CATEGORIES: string[] = [
  ...CATEGORY_CONFIG.filter((c) => c.id !== 'Other').flatMap((c) => [
    c.id,
    ...c.sub,
  ]),
  'Other',
];
