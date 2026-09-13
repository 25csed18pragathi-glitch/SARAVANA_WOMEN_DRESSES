import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Product from './models/Product.js';

dotenv.config();

const INITIAL_CATEGORIES = [
  {
    name: 'Sarees',
    slug: 'sarees',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    itemCount: 42,
    description: 'Traditional Kanjeevaram, Banarasi, Georgette & Organza sarees',
    featured: true
  },
  {
    name: 'Kurtis',
    slug: 'kurtis',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    itemCount: 68,
    description: 'Elegant straight, A-line, and flared festive Kurtis',
    featured: true
  },
  {
    name: 'Ethnic Wear',
    slug: 'ethnic-wear',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    itemCount: 95,
    description: 'Complete Indian ethnic sets, Anarkalis and Lehenga cholis',
    featured: true
  },
  {
    name: 'Western Wear',
    slug: 'western-wear',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    itemCount: 84,
    description: 'Contemporary western fashion, dresses, jumpsuits and co-ords',
    featured: true
  },
  {
    name: 'Dresses',
    slug: 'dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    itemCount: 56,
    description: 'Midi, maxi, bodycon, and floral summer dresses',
    featured: true
  },
  {
    name: 'Party Wear',
    slug: 'party-wear',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
    itemCount: 48,
    description: 'Glamorous evening gowns, shimmer dresses and cocktail attire',
    featured: true
  },
  {
    name: 'Tops',
    slug: 'tops',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    itemCount: 112,
    description: 'Crop tops, peplums, shirts, tunics and casual tees',
    featured: false
  },
  {
    name: 'Bottoms',
    slug: 'bottoms',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    itemCount: 76,
    description: 'Palazzos, cigarette pants, trousers, leggings and denim',
    featured: false
  },
  {
    name: 'Co-ord Sets',
    slug: 'co-ord-sets',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
    itemCount: 38,
    description: 'Chic matching top and bottom sets for effortless styling',
    featured: true
  },
  {
    name: 'Fusion Wear',
    slug: 'fusion-wear',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    itemCount: 52,
    description: 'Indo-western tunics, dhoti pants, shrugs and modern capes',
    featured: false
  },
  {
    name: 'Plus Size',
    slug: 'plus-size',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=600&q=80',
    itemCount: 64,
    description: 'Flattering silhouettes crafted specially for curves up to 5XL',
    featured: false
  },
  {
    name: 'Maternity Wear',
    slug: 'maternity-wear',
    image: 'https://images.unsplash.com/photo-1520006403909-838d6b89c284?auto=format&fit=crop&w=600&q=80',
    itemCount: 34,
    description: 'Comfortable, breathable maternity and nursing dresses',
    featured: false
  },
  {
    name: 'Nightwear',
    slug: 'nightwear',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    itemCount: 45,
    description: 'Satin slip dresses, cotton pyjama sets, and soft robes',
    featured: false
  },
  {
    name: 'Loungewear',
    slug: 'loungewear',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    itemCount: 40,
    description: 'Relaxed oversized sets, tracksuits and stay-at-home comforts',
    featured: false
  },
  {
    name: 'Winter Wear',
    slug: 'winter-wear',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
    itemCount: 38,
    description: 'Cashmere cardigans, cozy overcoats, trench coats and stoles',
    featured: false
  },
  {
    name: 'Activewear',
    slug: 'activewear',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    itemCount: 55,
    description: 'High-stretch leggings, moisture-wicking tops and sports bras',
    featured: false
  },
  {
    name: 'Dupattas & Shawls',
    slug: 'dupattas-and-shawls',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
    itemCount: 62,
    description: 'Handwoven Banarasi silk, Phulkari, and Kalamkari dupattas',
    featured: false
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    itemCount: 88,
    description: 'Traditional jhumkas, bridal potlis, embroidered clutches & belts',
    featured: false
  }
];

const INITIAL_BRANDS = [
  {
    name: 'Aurelia',
    slug: 'aurelia',
    tagline: 'Effortlessly Indian, Truly Contemporary',
    logo: 'AURELIA',
    accentColor: '#9B2242',
    description: 'Renowned for contemporary ethnic wear that blends comfort with refined craftsmanship.',
    bannerImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    itemCount: 48
  },
  {
    name: 'Biba',
    slug: 'biba',
    tagline: 'Change is Beautiful',
    logo: 'BIBA',
    accentColor: '#B83253',
    description: 'Iconic ethnic suits, festive Anarkalis, and rich traditional prints made for Indian celebrations.',
    bannerImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    itemCount: 54
  },
  {
    name: 'W for Woman',
    slug: 'w-for-woman',
    tagline: 'Reflects the Modern Indian Woman',
    logo: 'W',
    accentColor: '#2B2D42',
    description: 'Pioneering fusion silhouettes, asymmetric hemline kurtas, and chic smart-casual workwear.',
    bannerImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    itemCount: 39
  },
  {
    name: 'Global Desi',
    slug: 'global-desi',
    tagline: 'Boho Chic Indian Fusion',
    logo: 'GLOBAL DESI',
    accentColor: '#D4AF37',
    description: 'Vibrant boho prints, kaleidoscope colors, and breezy silhouettes inspired by world folklore.',
    bannerImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80',
    itemCount: 36
  },
  {
    name: 'Fabindia',
    slug: 'fabindia',
    tagline: 'Celebrate India with Handloom Elegance',
    logo: 'FABINDIA',
    accentColor: '#6B2D5C',
    description: 'Artisanal handwoven cottons, Chanderi silks, Chikankari craftsmanship, and organic dyes.',
    bannerImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
    itemCount: 42
  },
  {
    name: 'Soch',
    slug: 'soch',
    tagline: 'Refined Elegance for Every Occasion',
    logo: 'SOCH',
    accentColor: '#005F73',
    description: 'Modern silhouettes, rich textiles, delicate embroidery, and regal designer ensembles.',
    bannerImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
    itemCount: 31
  },
  {
    name: 'AND',
    slug: 'and',
    tagline: 'Contemporary Style for Global Women',
    logo: 'AND',
    accentColor: '#E76F51',
    description: 'Sleek western cuts, high-impact jumpsuits, sharp blazers, and clean minimalist workwear.',
    bannerImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
    itemCount: 28
  },
  {
    name: 'Saravana Silk Heritage',
    slug: 'saravana-silk-heritage',
    tagline: 'Authentic Heritage Weaves of South India',
    logo: 'SARAVANA',
    accentColor: '#C1121F',
    description: 'Master weavers crafting authentic Pure Mulberry Silk Sarees, bridal pattu, and royal temple borders.',
    bannerImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    itemCount: 65
  }
];

const INITIAL_PRODUCTS = [
  {
    customId: 'prod-01',
    name: 'Kanjeevaram Gold Zari Silk Saree',
    brand: 'Saravana Silk Heritage',
    brandSlug: 'saravana-silk-heritage',
    category: 'Sarees',
    categorySlug: 'sarees',
    price: 7999,
    discount: 46,
    finalPrice: 4299,
    rating: 4.9,
    reviewCount: 318,
    availability: 'In Stock',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['Free Size'],
    colors: [
      { name: 'Royal Crimson', hex: '#9B2242' },
      { name: 'Peacock Teal', hex: '#005F73' },
      { name: 'Mustard Gold', hex: '#D4AF37' }
    ],
    description: 'An ode to traditional South Indian weaving, this authentic Kanjeevaram silk saree features elaborate pure zari temple borders and a resplendent contrasting pallu.',
    fabric: 'Pure Mulberry Silk with Zari brocade',
    care: 'Dry clean only. Store wrapped in soft muslin.',
    isBestSeller: true,
    isTrending: true,
    isNew: false,
    recentlyAdded: false
  },
  {
    customId: 'prod-02',
    name: 'Handcrafted Anarkali Kurti & Dupatta Set',
    brand: 'Biba',
    brandSlug: 'biba',
    category: 'Kurtis',
    categorySlug: 'kurtis',
    price: 4599,
    discount: 45,
    finalPrice: 2499,
    rating: 4.8,
    reviewCount: 245,
    availability: 'In Stock',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Rose Quartz', hex: '#F7CAD0' },
      { name: 'Emerald Green', hex: '#2D6A4F' },
      { name: 'Deep Maroon', hex: '#800020' }
    ],
    description: 'Turn heads at every festive occasion with this flared Anarkali silhouette tailored from premium breathable rayon-cotton, completed with intricate Gota Patti detailing on the neckline.',
    fabric: 'Rayon Cotton with Organza Dupatta',
    care: 'Hand wash with mild detergent or gentle machine cycle.',
    isBestSeller: true,
    isTrending: true,
    isNew: false,
    recentlyAdded: true
  },
  {
    customId: 'prod-03',
    name: 'Emerald Green Embroidered Lehenga Set',
    brand: 'Aurelia',
    brandSlug: 'aurelia',
    category: 'Ethnic Wear',
    categorySlug: 'ethnic-wear',
    price: 12999,
    discount: 46,
    finalPrice: 6999,
    rating: 4.9,
    reviewCount: 182,
    availability: 'Only 3 Left',
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Emerald Green', hex: '#1B4332' },
      { name: 'Midnight Navy', hex: '#1D3557' }
    ],
    description: 'Crafted for grand weddings, this semi-stitched lehenga features shimmering sequin work with floral thread zardozi embroidery and a scalloped net dupatta.',
    fabric: 'Georgette Lehenga with Satin Silk Lining',
    care: 'Dry clean only.',
    isBestSeller: false,
    isTrending: true,
    isNew: true,
    recentlyAdded: true
  },
  {
    customId: 'prod-04',
    name: 'Floral Chiffon Tiered Maxi Dress',
    brand: 'AND',
    brandSlug: 'and',
    category: 'Western Wear',
    categorySlug: 'western-wear',
    price: 3999,
    discount: 45,
    finalPrice: 2199,
    rating: 4.7,
    reviewCount: 129,
    availability: 'In Stock',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Blush Floral', hex: '#F4ACB7' },
      { name: 'Sky Blue Floral', hex: '#A2D2FF' }
    ],
    description: 'Flowy, romantic and utterly flattering. Cut from lightweight printed chiffon with delicate tiered ruffles, puff sleeves, and a cinched smocked waist.',
    fabric: '100% Poly Chiffon with Soft Crepe Lining',
    care: 'Machine wash delicate or cold hand wash.',
    isBestSeller: true,
    isTrending: false,
    isNew: false,
    recentlyAdded: false
  },
  {
    customId: 'prod-05',
    name: 'Pure Cotton Hand-Block Print Flared Dress',
    brand: 'Fabindia',
    brandSlug: 'fabindia',
    category: 'Dresses',
    categorySlug: 'dresses',
    price: 3299,
    discount: 42,
    finalPrice: 1899,
    rating: 4.6,
    reviewCount: 98,
    availability: 'In Stock',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Indigo Blue', hex: '#1D3557' },
      { name: 'Earthy Rust', hex: '#9E2A2B' }
    ],
    description: 'Crafted from breathable artisanal Bagru block printed cotton. This flared A-line dress comes with functional side pockets and comfortable three-quarter sleeves.',
    fabric: '100% Pure Organic Cotton',
    care: 'First wash dry clean, subsequently gentle hand wash with mild liquid soap.',
    isBestSeller: false,
    isTrending: true,
    isNew: true,
    recentlyAdded: true
  },
  {
    customId: 'prod-06',
    name: 'Sequin Embellished Mermaid Evening Gown',
    brand: 'Soch',
    brandSlug: 'soch',
    category: 'Party Wear',
    categorySlug: 'party-wear',
    price: 9499,
    discount: 42,
    finalPrice: 5499,
    rating: 4.9,
    reviewCount: 87,
    availability: 'Only 2 Left',
    stock: 2,
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Wine Velvet', hex: '#4A0E17' },
      { name: 'Onyx Black', hex: '#1A1A1A' }
    ],
    description: 'A showstopping party silhouette dripping in hand-sewn micro sequins, designed with a sweetheart neckline and dramatic fluted mermaid hem.',
    fabric: 'Stretch Net with Sequin Brocade & Satin Lining',
    care: 'Professional dry clean only.',
    isBestSeller: false,
    isTrending: true,
    isNew: false,
    recentlyAdded: false
  },
  {
    customId: 'prod-07',
    name: 'Schiffli Embroidered Mandarin Collar Tunic',
    brand: 'W for Woman',
    brandSlug: 'w-for-woman',
    category: 'Tops',
    categorySlug: 'tops',
    price: 2499,
    discount: 48,
    finalPrice: 1299,
    rating: 4.5,
    reviewCount: 164,
    availability: 'In Stock',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Ivory Cream', hex: '#FDF0D5' },
      { name: 'Powder Lilac', hex: '#CDB4DB' }
    ],
    description: 'Crisp, summery and sophisticated. Tailored with intricate all-over Schiffli cutwork embroidery, mother-of-pearl buttons, and a neat Mandarin band collar.',
    fabric: '100% Breathable Cotton Lawn',
    care: 'Machine wash warm, iron while damp.',
    isBestSeller: true,
    isTrending: false,
    isNew: true,
    recentlyAdded: true
  },
  {
    customId: 'prod-08',
    name: 'High-Waist Wide Leg Flared Linen Trousers',
    brand: 'Global Desi',
    brandSlug: 'global-desi',
    category: 'Bottoms',
    categorySlug: 'bottoms',
    price: 2799,
    discount: 43,
    finalPrice: 1599,
    rating: 4.7,
    reviewCount: 114,
    availability: 'In Stock',
    stock: 19,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['26', '28', '30', '32', '34', '36'],
    colors: [
      { name: 'Desert Khaki', hex: '#D4A373' },
      { name: 'Olive Army', hex: '#588157' },
      { name: 'Classic Black', hex: '#212529' }
    ],
    description: 'Linen trousers engineered with a clean tailored waistband, concealed side zip, and a gracefully draped wide leg that elongates the figure.',
    fabric: 'Linen-Viscose Blend',
    care: 'Gentle machine wash, tumble dry low.',
    isBestSeller: false,
    isTrending: true,
    isNew: false,
    recentlyAdded: false
  },
  {
    customId: 'prod-09',
    name: 'Bohemian Aztec Printed Blazer & Short Co-ord',
    brand: 'Global Desi',
    brandSlug: 'global-desi',
    category: 'Co-ord Sets',
    categorySlug: 'co-ord-sets',
    price: 4999,
    discount: 44,
    finalPrice: 2799,
    rating: 4.8,
    reviewCount: 92,
    availability: 'In Stock',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Terracotta Aztec', hex: '#BC6C25' },
      { name: 'Teal Geometric', hex: '#0077B6' }
    ],
    description: 'A stylish coordinates set featuring a notched lapel tailored summer jacket paired with matching high-rise pleated shorts in exclusive bohemian print.',
    fabric: 'Rayon Slub with Soft Handfeel',
    care: 'Cold hand wash separately.',
    isBestSeller: true,
    isTrending: true,
    isNew: true,
    recentlyAdded: true
  },
  {
    customId: 'prod-10',
    name: 'Dhoti Pants & Embroidered Cape Shrug Set',
    brand: 'Aurelia',
    brandSlug: 'aurelia',
    category: 'Fusion Wear',
    categorySlug: 'fusion-wear',
    price: 5999,
    discount: 45,
    finalPrice: 3299,
    rating: 4.8,
    reviewCount: 76,
    availability: 'In Stock',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Royal Mustard', hex: '#E09F3E' },
      { name: 'Rani Pink', hex: '#D90429' }
    ],
    description: 'Effortless Indo-Western glamour combining pleated satin dhoti bottoms with an intricately mirror-work embroidered sheer organza cape.',
    fabric: 'Modal Satin Pants with Organza Cape',
    care: 'Dry clean recommended.',
    isBestSeller: false,
    isTrending: true,
    isNew: false,
    recentlyAdded: false
  },
  {
    customId: 'prod-11',
    name: 'Curved A-Line Empire Waist Midi Dress',
    brand: 'Biba',
    brandSlug: 'biba',
    category: 'Plus Size',
    categorySlug: 'plus-size',
    price: 4299,
    discount: 44,
    finalPrice: 2399,
    rating: 4.9,
    reviewCount: 143,
    availability: 'In Stock',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['XL', 'XXL', '3XL', '4XL', '5XL'],
    colors: [
      { name: 'Midnight Plum', hex: '#581845' },
      { name: 'Cobalt Blue', hex: '#00296B' }
    ],
    description: 'Designed exclusively for curvier figures, featuring a slimming empire waistline, breathable stretch-cotton twill, and a flowy pleat-detailed skirt.',
    fabric: 'Cotton-Spandex Comfort Twill',
    care: 'Machine wash warm, gentle spin cycle.',
    isBestSeller: true,
    isTrending: false,
    isNew: true,
    recentlyAdded: false
  },
  {
    customId: 'prod-12',
    name: 'Concealed Zip Nursing Maternity Maxi Dress',
    brand: 'W for Woman',
    brandSlug: 'w-for-woman',
    category: 'Maternity Wear',
    categorySlug: 'maternity-wear',
    price: 3699,
    discount: 46,
    finalPrice: 1999,
    rating: 4.9,
    reviewCount: 156,
    availability: 'In Stock',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1520006403909-838d6b89c284?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Soft Sage Green', hex: '#84A98C' },
      { name: 'Baby Pink', hex: '#FFB5A7' }
    ],
    description: 'Engineered for motherly comfort throughout pregnancy and postpartum nursing, featuring discreet horizontal invisible zippers and bump-friendly gathers.',
    fabric: '100% Certified Organic Modal Cotton',
    care: 'Gentle machine wash with baby-safe detergent.',
    isBestSeller: true,
    isTrending: false,
    isNew: false,
    recentlyAdded: false
  },
  {
    customId: 'prod-13',
    name: 'Mulberry Silk Lace-Trim Nightwear Slip & Robe',
    brand: 'AND',
    brandSlug: 'and',
    category: 'Nightwear',
    categorySlug: 'nightwear',
    price: 3499,
    discount: 49,
    finalPrice: 1799,
    rating: 4.7,
    reviewCount: 94,
    availability: 'In Stock',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Champagne Gold', hex: '#EDE0D4' },
      { name: 'Midnight Black', hex: '#1B1B1E' }
    ],
    description: 'Ultra-luxe 2-piece loungewear set featuring an adjustable spaghetti slip lined with delicate French scalloped lace and an open-front tie robe.',
    fabric: 'Premium Satin Silk with Micro Lace',
    care: 'Hand wash with silk detergent or wash inside laundry bag.',
    isBestSeller: false,
    isTrending: false,
    isNew: true,
    recentlyAdded: true
  },
  {
    customId: 'prod-14',
    name: 'Waffle Knit Relaxed Sweatshirt & Jogger Set',
    brand: 'AND',
    brandSlug: 'and',
    category: 'Loungewear',
    categorySlug: 'loungewear',
    price: 3199,
    discount: 44,
    finalPrice: 1799,
    rating: 4.6,
    reviewCount: 108,
    availability: 'In Stock',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Oatmeal Heather', hex: '#E6CCB2' },
      { name: 'Charcoal Grey', hex: '#495057' }
    ],
    description: 'Weekend unwinding redefined. Breathable honeycomb waffle knit with an oversized dropped-shoulder pullover and elasticated cuff joggers.',
    fabric: '100% Combed Cotton Waffle Knit',
    care: 'Machine wash cold, dry flat in shade.',
    isBestSeller: false,
    isTrending: true,
    isNew: false,
    recentlyAdded: false
  },
  {
    customId: 'prod-15',
    name: 'Double-Breasted Wool Blend Trench Overcoat',
    brand: 'AND',
    brandSlug: 'and',
    category: 'Winter Wear',
    categorySlug: 'winter-wear',
    price: 8999,
    discount: 44,
    finalPrice: 4999,
    rating: 4.9,
    reviewCount: 65,
    availability: 'Only 3 Left',
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Camel Tan', hex: '#C68B59' },
      { name: 'Charcoal Black', hex: '#212529' }
    ],
    description: 'An enduring winter investment piece featuring wide notched lapels, tortoiseshell buttons, storm flaps, and an adjustable waist belt.',
    fabric: '60% Merino Wool, 40% Polyester with Thermal Satin Lining',
    care: 'Dry clean only.',
    isBestSeller: true,
    isTrending: false,
    isNew: true,
    recentlyAdded: true
  },
  {
    customId: 'prod-16',
    name: 'Seamless High-Waist Performance Gym Leggings',
    brand: 'AND',
    brandSlug: 'and',
    category: 'Activewear',
    categorySlug: 'activewear',
    price: 2599,
    discount: 46,
    finalPrice: 1399,
    rating: 4.8,
    reviewCount: 198,
    availability: 'In Stock',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Burgundy', hex: '#6B2D5C' },
      { name: 'Stealth Black', hex: '#1E1E24' },
      { name: 'Deep Teal', hex: '#005F73' }
    ],
    description: 'Squat-proof 4-way stretch active tights with targeted core compression, moisture-wicking technology, and dual deep smartphone side pockets.',
    fabric: '75% Polyamide, 25% Elastane Spandex',
    care: 'Machine wash cold with similar athletic fabrics, do not fabric-soften.',
    isBestSeller: true,
    isTrending: true,
    isNew: false,
    recentlyAdded: false
  },
  {
    customId: 'prod-17',
    name: 'Banarasi Brocade Silk Dupatta with Gold Meenakari',
    brand: 'Saravana Silk Heritage',
    brandSlug: 'saravana-silk-heritage',
    category: 'Dupattas & Shawls',
    categorySlug: 'dupattas-and-shawls',
    price: 3499,
    discount: 49,
    finalPrice: 1799,
    rating: 4.9,
    reviewCount: 122,
    availability: 'In Stock',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['2.5 Metres'],
    colors: [
      { name: 'Vermillion Red', hex: '#D62828' },
      { name: 'Royal Emerald', hex: '#1B4332' },
      { name: 'Gold & Ivory', hex: '#FDF0D5' }
    ],
    description: 'Transform any simple kurta into regal bridal couture. Hand-loomed in Varanasi with dense floral kadwa bootis and pure gold zari border borders.',
    fabric: 'Katan Silk with Pure Metallic Zari',
    care: 'Dry clean only. Roll on cardboard tube to preserve zari weave.',
    isBestSeller: true,
    isTrending: true,
    isNew: false,
    recentlyAdded: false
  },
  {
    customId: 'prod-18',
    name: 'Temple Jewellery Kundan & Pearl Choker Necklace',
    brand: 'Saravana Silk Heritage',
    brandSlug: 'saravana-silk-heritage',
    category: 'Accessories',
    categorySlug: 'accessories',
    price: 3999,
    discount: 45,
    finalPrice: 2199,
    rating: 4.9,
    reviewCount: 175,
    availability: 'In Stock',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['Adjustable Dori'],
    colors: [
      { name: 'Antique 22K Gold Finish', hex: '#D4AF37' },
      { name: 'Ruby-Emerald Dual Tone', hex: '#9B2242' }
    ],
    description: 'Heirloom South Indian temple jewelry set featuring hand-set Jadau Kundan stones, natural basra pearls, and matching chandelier jhumki earrings.',
    fabric: 'Brass Alloy with 22K Micro Gold Plating & Semi-Precious Kundan',
    care: 'Keep away from perfumes, moisture and sprays. Store in airtight pouch.',
    isBestSeller: true,
    isTrending: true,
    isNew: true,
    recentlyAdded: true
  }
];

export const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV !== 'development' || process.env.ALLOW_DESTRUCTIVE_SEED !== 'true') {
      throw new Error('Destructive seed blocked. Set NODE_ENV=development and ALLOW_DESTRUCTIVE_SEED=true explicitly.');
    }
    console.log('Connecting to MongoDB Atlas for seeding...');
    await connectDB();

    console.log('Clearing existing categories, brands, and products...');
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});

    console.log('Seeding Categories...');
    const insertedCategories = await Category.insertMany(INITIAL_CATEGORIES);
    console.log(`Successfully seeded ${insertedCategories.length} categories!`);

    console.log('Seeding Brands...');
    const insertedBrands = await Brand.insertMany(INITIAL_BRANDS);
    console.log(`Successfully seeded ${insertedBrands.length} brands!`);

    // Create lookup maps for category and brand references
    const categoryMap = {};
    insertedCategories.forEach((cat) => {
      categoryMap[cat.name.toLowerCase()] = cat._id;
      categoryMap[cat.slug.toLowerCase()] = cat._id;
    });

    const brandMap = {};
    insertedBrands.forEach((b) => {
      brandMap[b.name.toLowerCase()] = b._id;
      brandMap[b.slug.toLowerCase()] = b._id;
    });

    // Attach categoryRef and brandRef to every product
    const productsWithRefs = INITIAL_PRODUCTS.map((prod) => {
      const catKey = prod.category ? prod.category.toLowerCase() : '';
      const brandKey = prod.brand ? prod.brand.toLowerCase() : '';
      return {
        ...prod,
        categoryRef: categoryMap[catKey] || null,
        brandRef: brandMap[brandKey] || null
      };
    });

    console.log('Seeding Products with Category & Brand references...');
    const insertedProducts = await Product.insertMany(productsWithRefs);
    console.log(`Successfully seeded ${insertedProducts.length} products with category & brand references!`);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// If run directly from terminal
if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0));
}
