const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const Product = require("./models/product.model");

const products = [
  // Electronics
  {
    name: "Mechanical Keyboard",
    description: "Premium RGB mechanical gaming and typing keyboard with tactile clicky blue switches, durable double-shot keycaps, and customizable per-key backlighting.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    stock: 10,
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones featuring active noise cancellation (ANC), 40-hour battery life, high-resolution audio drivers, and plush memory foam ear cushions.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    stock: 25,
  },
  {
    name: "Wireless Ergonomic Mouse",
    description: "Precision optical mouse with 4000 DPI sensor, sculpted ergonomic thumb rest, multi-device Bluetooth pairing, and silent click switches.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    stock: 35,
  },
  {
    name: "Ultra-HD 4K Smart Monitor 27-inch",
    description: "27-inch IPS 4K HDR display with 99% sRGB color accuracy, USB-C 65W power delivery, tilt & height adjustable stand, and eye-care blue light filter.",
    price: 24999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    stock: 8,
  },
  {
    name: "Smart Fitness Watch with SpO2",
    description: "AMOLED touch display smartwatch with continuous heart-rate tracking, blood oxygen SpO2 monitoring, GPS, and 14-day extended battery life.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    stock: 18,
  },

  // Fashion
  {
    name: "Vintage Denim Jacket",
    description: "Classic authentic washed blue denim trucker jacket with button-flap chest pockets, brass shank hardware, and durable reinforced stitching.",
    price: 3299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    stock: 15,
  },
  {
    name: "Unisex Fleece Oversized Hoodie",
    description: "Ultra-soft heavyweight brushed cotton-fleece pullover hoodie with kangaroo pocket, double-lined hood, and relaxed modern silhouette.",
    price: 1999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    stock: 30,
  },
  {
    name: "Classic White Canvas Sneakers",
    description: "Timeless low-top canvas sneakers with vulcanized rubber grip sole, cushioned Ortholite insole, and breathable cotton canvas upper.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    stock: 20,
  },
  {
    name: "Pure Cotton Oxford Shirt",
    description: "Tailored slim-fit long sleeve button-down oxford shirt crafted from 100% breathable organic Egyptian cotton.",
    price: 1499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    stock: 22,
  },
  {
    name: "Minimalist Leather Backpack",
    description: "Handcrafted full-grain leather everyday backpack with padded 15.6-inch laptop compartment and water-resistant lining.",
    price: 3899,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    stock: 12,
  },

  // Books
  {
    name: "Atomic Habits by James Clear",
    description: "An easy and proven way to build good habits and break bad ones. The definitive masterclass on micro-behaviors and compound growth.",
    price: 549,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    stock: 50,
  },
  {
    name: "Clean Code: Agile Software Craftsmanship",
    description: "Robert C. Martin's legendary guide to writing clean, maintainable, and readable code with real-world case studies and best practices.",
    price: 1850,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e37257?auto=format&fit=crop&w=800&q=80",
    stock: 16,
  },
  {
    name: "The Psychology of Money",
    description: "Timeless lessons on wealth, greed, and happiness by Morgan Housel. Doing well with money isn't necessarily about what you know, it's about how you behave.",
    price: 420,
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    stock: 45,
  },
  {
    name: "Deep Work: Rules for Focused Success",
    description: "Cal Newport's bestselling guide on the superpower of deep, uninterrupted focus in an increasingly distracted modern world.",
    price: 499,
    category: "Books",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    stock: 28,
  },

  // Home
  {
    name: "Ceramic Pour-Over Coffee Dripper Set",
    description: "Artisan matte ceramic V60 style pour-over dripper with heat-resistant borosilicate glass carafe and measuring scoop.",
    price: 1299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    stock: 18,
  },
  {
    name: "Aroma Essential Oil Ultrasonic Diffuser",
    description: "500ml ultrasonic cool-mist essential oil diffuser with 7 ambient color-changing LED lights and whisper-quiet auto shut-off.",
    price: 1599,
    category: "Home",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    stock: 25,
  },
  {
    name: "Nordic Ambient Warm LED Desk Lamp",
    description: "Scandinavian minimalist dimmable LED table lamp with solid natural oak wood base and warm 3000K touch-sensitive brightness control.",
    price: 1799,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    stock: 14,
  },
  {
    name: "Ergonomic Memory Foam Cushion",
    description: "Orthopedic contoured seat cushion with high-density cooling memory foam designed to relieve tailbone pressure and improve posture.",
    price: 999,
    category: "Home",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    stock: 32,
  },

  // Sports
  {
    name: "Eco-Friendly Non-Slip Yoga Mat",
    description: "6mm thick dual-layer non-slip TPE yoga mat with laser-engraved alignment body lines and lightweight shoulder carrying strap.",
    price: 1199,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
    stock: 35,
  },
  {
    name: "Adjustable Dumbbell Pair",
    description: "Rapid dial-adjust dumbbell system shifting effortlessly from 2.5 kg to 24 kg per dumbbell for compact home gym strength training.",
    price: 8999,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    stock: 6,
  },

  // Beauty
  {
    name: "Vitamin C & Hyaluronic Acid Glow Serum",
    description: "Potent 20% Vitamin C face serum fortified with Ferulic acid and pure Botanical Hyaluronic Acid for brightening and anti-aging hydration.",
    price: 899,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    stock: 40,
  },
  {
    name: "Organic Rose Water Refreshing Mist",
    description: "100% pure steam-distilled organic rose petal hydrating toner mist to revitalize, soothe redness, and balance skin pH.",
    price: 599,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    stock: 30,
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    // Delete existing products to have clean, realistic, consistent data
    await Product.deleteMany({});
    console.log("Cleared old products.");

    const created = await Product.insertMany(products);
    console.log(`Successfully seeded ${created.length} realistic products across categories!`);

    for (const p of created.slice(0, 5)) {
      console.log(`- [${p.category}] ${p.name} (₹${p.price}) ID: ${p._id}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
