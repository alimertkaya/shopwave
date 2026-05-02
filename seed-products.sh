#!/bin/bash
# ShopWave — Product Seed Script
# Seeds sample products into the running Product Service.
# Usage: chmod +x seed-products.sh && ./seed-products.sh
#
# Default target: http://localhost:8082 (Docker Compose or K8s port-forward)
# Override:       BASE_URL=http://localhost:8080/api ./seed-products.sh

BASE_URL="${BASE_URL:-http://localhost:8082}/api/products"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

post() {
  local name="$1"
  local body="$2"
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "$body")
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "  ${GREEN}✓${NC} $name"
  else
    echo -e "  ${RED}✗${NC} $name  (HTTP $http_code)"
  fi
}

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       ShopWave — Product Seeder          ║"
echo "╚══════════════════════════════════════════╝"
echo "  Target: $BASE_URL"
echo ""

# ── Electronics ───────────────────────────────────────────────────────────────
echo "▶ Electronics"

post "Samsung Galaxy S24 Ultra" '{
  "name": "Samsung Galaxy S24 Ultra",
  "description": "6.8-inch QHD+ AMOLED display, 200MP camera, 5000mAh battery, S Pen included.",
  "price": 1299.99,
  "category": "Electronics",
  "imageUrl": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600"
}'

post "Apple MacBook Pro 14\" M3" '{
  "name": "Apple MacBook Pro 14\" M3",
  "description": "Apple M3 chip, 16GB unified memory, 512GB SSD, Liquid Retina XDR display.",
  "price": 1999.99,
  "category": "Laptop & Computer",
  "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600"
}'

post "Sony WH-1000XM5 Headphones" '{
  "name": "Sony WH-1000XM5 Headphones",
  "description": "Industry-leading noise cancellation, 30-hour battery life, multipoint connection.",
  "price": 349.99,
  "category": "Headphones & Speakers",
  "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
}'

post "Apple iPad Pro 12.9\"" '{
  "name": "Apple iPad Pro 12.9\"",
  "description": "M2 chip, 12.9-inch Liquid Retina XDR, 5G, compatible with Apple Pencil.",
  "price": 1099.99,
  "category": "Tablet",
  "imageUrl": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600"
}'

post "PlayStation 5" '{
  "name": "PlayStation 5",
  "description": "Ultra-high speed SSD, ray tracing, 4K gaming, haptic feedback DualSense controller.",
  "price": 499.99,
  "category": "Gaming Consoles",
  "imageUrl": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600"
}'

# ── Clothing ──────────────────────────────────────────────────────────────────
echo "▶ Clothing"

post "Classic Fit Oxford Shirt" '{
  "name": "Classic Fit Oxford Shirt",
  "description": "100% premium cotton, machine washable, available in multiple colors.",
  "price": 49.99,
  "category": "Clothing",
  "imageUrl": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"
}'

post "Slim-Fit Chino Trousers" '{
  "name": "Slim-Fit Chino Trousers",
  "description": "Stretch fabric, slim fit, suitable for all-day comfort.",
  "price": 69.99,
  "category": "Clothing",
  "imageUrl": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"
}'

post "Nike Air Max 270" '{
  "name": "Nike Air Max 270",
  "description": "Large Air unit heel, lightweight design, casual everyday sneaker.",
  "price": 129.99,
  "category": "Shoes",
  "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
}'

post "Leather Crossbody Bag" '{
  "name": "Leather Crossbody Bag",
  "description": "Genuine leather, adjustable strap, multiple compartments.",
  "price": 89.99,
  "category": "Clothing",
  "imageUrl": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"
}'

# ── Home & Living ─────────────────────────────────────────────────────────────
echo "▶ Home & Living"

post "Minimalist Desk Lamp" '{
  "name": "Minimalist Desk Lamp",
  "description": "LED, 5 brightness levels, USB-C charging port, eye-comfort mode.",
  "price": 45.99,
  "category": "Home & Living",
  "imageUrl": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"
}'

post "Ceramic Coffee Mug Set (4 pcs)" '{
  "name": "Ceramic Coffee Mug Set (4 pcs)",
  "description": "350ml capacity each, dishwasher safe, minimalist matte finish.",
  "price": 29.99,
  "category": "Home & Living",
  "imageUrl": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600"
}'

post "Bamboo Cutting Board Set" '{
  "name": "Bamboo Cutting Board Set",
  "description": "3-piece set, eco-friendly bamboo, juice grooves, non-slip feet.",
  "price": 34.99,
  "category": "Kitchen & Cooking",
  "imageUrl": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"
}'

post "Geometric Throw Pillow" '{
  "name": "Geometric Throw Pillow",
  "description": "45x45cm, removable cover, machine washable, modern geometric design.",
  "price": 19.99,
  "category": "Home & Living",
  "imageUrl": "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600"
}'

# ── Sports ────────────────────────────────────────────────────────────────────
echo "▶ Sports"

post "Adjustable Dumbbell Set (5-25 kg)" '{
  "name": "Adjustable Dumbbell Set (5-25 kg)",
  "description": "Quick-adjust dial system, replaces 15 sets of weights, compact storage.",
  "price": 299.99,
  "category": "Sports",
  "imageUrl": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600"
}'

post "Yoga Mat (6mm)" '{
  "name": "Yoga Mat (6mm)",
  "description": "Non-slip surface, eco-friendly TPE material, carrying strap included.",
  "price": 39.99,
  "category": "Sports",
  "imageUrl": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600"
}'

post "Garmin Forerunner 255 GPS Watch" '{
  "name": "Garmin Forerunner 255 GPS Watch",
  "description": "GPS running watch, heart rate monitoring, 14-day battery, triathlon support.",
  "price": 349.99,
  "category": "Sports",
  "imageUrl": "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600"
}'

post "Resistance Band Set" '{
  "name": "Resistance Band Set",
  "description": "5 resistance levels, 100% natural latex, suitable for all fitness levels.",
  "price": 24.99,
  "category": "Sports",
  "imageUrl": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600"
}'

# ── Books ─────────────────────────────────────────────────────────────────────
echo "▶ Books"

post "Clean Code — Robert C. Martin" '{
  "name": "Clean Code — Robert C. Martin",
  "description": "A handbook of agile software craftsmanship. Essential reading for every developer.",
  "price": 34.99,
  "category": "Books",
  "imageUrl": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600"
}'

post "Designing Data-Intensive Applications" '{
  "name": "Designing Data-Intensive Applications",
  "description": "Martin Kleppmann. Covers distributed systems, databases, and data processing patterns.",
  "price": 49.99,
  "category": "Books",
  "imageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600"
}'

post "Atomic Habits — James Clear" '{
  "name": "Atomic Habits — James Clear",
  "description": "An easy and proven way to build good habits and break bad ones.",
  "price": 18.99,
  "category": "Books",
  "imageUrl": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600"
}'

# ── Cosmetics ─────────────────────────────────────────────────────────────────
echo "▶ Cosmetics"

post "Vitamin C Face Serum (30ml)" '{
  "name": "Vitamin C Face Serum (30ml)",
  "description": "15% Vitamin C, hyaluronic acid, brightening and anti-aging formula.",
  "price": 29.99,
  "category": "Cosmetics",
  "imageUrl": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600"
}'

post "Moisturizing Sunscreen SPF 50+" '{
  "name": "Moisturizing Sunscreen SPF 50+",
  "description": "UVA/UVB protection, non-greasy texture, suitable for all skin types.",
  "price": 19.99,
  "category": "Cosmetics",
  "imageUrl": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600"
}'

post "Argan Oil Hair Mask (250ml)" '{
  "name": "Argan Oil Hair Mask (250ml)",
  "description": "Deeply nourishing, repairs damaged hair, frizz control, salon-quality.",
  "price": 14.99,
  "category": "Cosmetics",
  "imageUrl": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600"
}'

# ── Toys ──────────────────────────────────────────────────────────────────────
echo "▶ Toys"

post "LEGO City Space Station (1000 pcs)" '{
  "name": "LEGO City Space Station (1000 pcs)",
  "description": "Detailed space station model, includes 5 astronaut minifigures, ages 9+.",
  "price": 79.99,
  "category": "Toys",
  "imageUrl": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600"
}'

post "Wooden Chess Set" '{
  "name": "Wooden Chess Set",
  "description": "Handcrafted pieces, folding board with storage, all ages.",
  "price": 44.99,
  "category": "Toys",
  "imageUrl": "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=600"
}'

# ── Pet Shop ──────────────────────────────────────────────────────────────────
echo "▶ Pet Shop"

post "Premium Dry Dog Food (15 kg)" '{
  "name": "Premium Dry Dog Food (15 kg)",
  "description": "Grain-free, real chicken first ingredient, suitable for all breeds.",
  "price": 54.99,
  "category": "Pet Shop",
  "imageUrl": "https://images.unsplash.com/photo-1589924691995-400dc9eee359?w=600"
}'

post "Interactive Cat Toy Set" '{
  "name": "Interactive Cat Toy Set",
  "description": "5-piece feather wand, ball track, and puzzle feeder set.",
  "price": 22.99,
  "category": "Pet Shop",
  "imageUrl": "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=600"
}'

# ── Automotive ────────────────────────────────────────────────────────────────
echo "▶ Automotive"

post "Wireless Car Phone Holder (15W)" '{
  "name": "Wireless Car Phone Holder (15W)",
  "description": "Dashboard or windshield mount, 15W fast wireless charging, auto-clamp.",
  "price": 39.99,
  "category": "Automotive",
  "imageUrl": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"
}'

echo ""
echo "✓ Seed complete."
echo ""
