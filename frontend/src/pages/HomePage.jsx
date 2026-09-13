import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Flame,
  Tag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import ProductGrid from '../components/product/ProductGrid';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'The Royal Silk & Festive Saree Edit',
    subtitle: 'Authentic Kanjeevaram & Banarasi weaves crafted for timeless grandeur.',
    badge: 'FESTIVE COLLECTION 2026',
    ctaText: 'Explore Royal Sarees',
    ctaLink: '/category/sarees',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    discountText: 'FLAT 40% - 50% OFF'
  },
  {
    id: 2,
    title: 'Celebration Anarkalis & Designer Kurtis',
    subtitle: 'Breezy silhouettes with exquisite Gota Patti and mirror craftsmanship.',
    badge: 'NEW ARRIVALS',
    ctaText: 'Shop Kurtis Collection',
    ctaLink: '/category/kurtis',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    discountText: 'STARTS AT ₹999'
  },
  {
    id: 3,
    title: 'High-Street Glamour & Evening Gowns',
    subtitle: 'From dramatic sequin party wear to fluid satin cocktail silhouettes.',
    badge: 'WESTERN & PARTY WEAR',
    ctaText: 'Discover Party Wear',
    ctaLink: '/category/party-wear',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
    discountText: 'UP TO 45% OFF'
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { categories, brands, loading: shopLoading } = useShop();

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newCollections, setNewCollections] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [homeError, setHomeError] = useState(null);

  // Auto-advance hero carousel every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const loadDynamicHomeData = async () => {
    setLoadingProducts(true);
    setHomeError(null);
    try {
      const [trendRes, bestRes, newRes, recentRes, allRes] = await Promise.allSettled([
        fetchProducts({ isTrending: 'true', limit: 4 }),
        fetchProducts({ isBestSeller: 'true', limit: 4 }),
        fetchProducts({ isNew: 'true', limit: 4 }),
        fetchProducts({ recentlyAdded: 'true', limit: 4 }),
        fetchProducts({ limit: 50 })
      ]);

      let loadedAny = false;
      if (trendRes.status === 'fulfilled' && trendRes.value?.data) {
        setTrendingProducts(trendRes.value.data);
        loadedAny = true;
      }
      if (bestRes.status === 'fulfilled' && bestRes.value?.data) {
        setBestSellers(bestRes.value.data);
        loadedAny = true;
      }
      if (newRes.status === 'fulfilled' && newRes.value?.data) {
        setNewCollections(newRes.value.data);
        loadedAny = true;
      }
      if (recentRes.status === 'fulfilled' && recentRes.value?.data) {
        setRecentlyAdded(recentRes.value.data);
        loadedAny = true;
      }
      if (allRes.status === 'fulfilled' && allRes.value?.data) {
        setAllProducts(allRes.value.data);
        loadedAny = true;
      }

      if (!loadedAny) {
        const errorReason =
          trendRes.reason?.message ||
          bestRes.reason?.message ||
          newRes.reason?.message ||
          'Failed to load products from database';
        setHomeError(errorReason);
      }
    } catch (err) {
      console.error('Error fetching home data from MongoDB:', err);
      setHomeError(err.message || 'Unable to connect to database. Please check your backend connection.');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadDynamicHomeData();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div className="home-page-container">
      {/* Dynamic Error State Banner if backend/database error occurs */}
      {homeError && (
        <div
          className="home-error-banner"
          style={{
            maxWidth: '1200px',
            margin: '20px auto 0',
            padding: '16px 24px',
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(153, 27, 27, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#991B1B' }}>
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>Database Connection Notice</strong>
              <span style={{ fontSize: '13px', opacity: 0.9 }}>{homeError}</span>
            </div>
          </div>
          <button
            onClick={loadDynamicHomeData}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="hero-carousel-section">
        <div className="hero-carousel-wrapper">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`hero-slide-item ${idx === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.45) 55%, rgba(15, 23, 42, 0.1) 100%), url(${slide.image})`
              }}
            >
              <div className="hero-slide-content">
                <div className="hero-badge">
                  <Sparkles size={14} />
                  <span>{slide.badge}</span>
                </div>
                <h1 className="hero-slide-title">{slide.title}</h1>
                <p className="hero-slide-subtitle">{slide.subtitle}</p>

                <div className="hero-offer-highlight">
                  <Tag size={16} />
                  <span>{slide.discountText}</span>
                </div>

                <div className="hero-cta-row">
                  <Link to={slide.ctaLink} className="hero-btn-primary">
                    <span>{slide.ctaText}</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/shop" className="hero-btn-secondary">
                    View All Collections
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Arrows */}
          <button className="carousel-control prev" onClick={prevSlide} aria-label="Previous Slide">
            <ChevronLeft size={24} />
          </button>
          <button className="carousel-control next" onClick={nextSlide} aria-label="Next Slide">
            <ChevronRight size={24} />
          </button>

          {/* Carousel Dots */}
          <div className="carousel-indicators">
            {HERO_SLIDES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                className={`carousel-dot ${dotIdx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY */}
      <section className="home-section category-showcase-section">
        <div className="section-header-block">
          <span className="section-eyebrow">CURATED FASHION</span>
          <h2 className="section-main-heading">Shop By Category</h2>
          <p className="section-sub-text">
            Explore our {categories.length > 0 ? categories.length : '18'} handcrafted categories designed for every mood and occasion
          </p>
        </div>

        <div className="category-scroll-grid">
          {categories.map((category) => (
            <Link
              key={category.id || category._id}
              to={`/category/${category.slug}`}
              className="category-card-tile"
            >
              <div className="category-image-wrap">
                <img src={category.image} alt={category.name} loading="lazy" />
                <div className="category-item-count">{category.itemCount || 0} Items</div>
              </div>
              <h4 className="category-card-name">{category.name}</h4>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TRENDING DRESSES */}
      <section className="home-section trending-section">
        <div className="section-header-row">
          <div>
            <div className="section-badge-inline">
              <TrendingUp size={16} color="#9B2242" />
              <span>MOST POPULAR NOW</span>
            </div>
            <h2 className="section-main-heading">Trending Dresses</h2>
          </div>
          <Link to="/shop" className="view-all-link">
            Explore All Trending →
          </Link>
        </div>

        {loadingProducts ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" size={32} color="#9B2242" />
          </div>
        ) : (
          <div className="product-cards-grid">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. NEW COLLECTIONS */}
      <section className="home-section new-collections-section">
        <div className="section-header-row">
          <div>
            <div className="section-badge-inline">
              <Sparkles size={16} color="#D4AF37" />
              <span>FRESH ARRIVALS</span>
            </div>
            <h2 className="section-main-heading">New Collections</h2>
          </div>
          <Link to="/shop" className="view-all-link">
            View All Arrivals →
          </Link>
        </div>

        {loadingProducts ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" size={32} color="#9B2242" />
          </div>
        ) : (
          <div className="product-cards-grid">
            {newCollections.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. SHOP BY BRAND */}
      <section className="home-section brand-showcase-section">
        <div className="section-header-block">
          <span className="section-eyebrow">PREMIUM PARTNERS</span>
          <h2 className="section-main-heading">Shop By Brand</h2>
          <p className="section-sub-text">
            Discover creations from leading Indian ethnic & international western labels
          </p>
        </div>

        <div className="brand-cards-grid">
          {brands.map((brand) => (
            <Link
              key={brand.id || brand._id}
              to={`/brand/${brand.slug}`}
              className="brand-card-item"
            >
              <div className="brand-banner-thumb">
                <img src={brand.bannerImage} alt={brand.name} loading="lazy" />
                <div className="brand-logo-badge" style={{ borderColor: brand.accentColor }}>
                  <span className="brand-logo-text">{brand.logo}</span>
                </div>
              </div>
              <div className="brand-card-content">
                <h4 className="brand-card-title">{brand.name}</h4>
                <p className="brand-card-tagline">{brand.tagline}</p>
                <span className="brand-card-count">{brand.itemCount || 0}+ Styles Available</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="home-section best-sellers-section">
        <div className="section-header-row">
          <div>
            <div className="section-badge-inline">
              <Award size={16} color="#9B2242" />
              <span>CUSTOMER FAVORITES</span>
            </div>
            <h2 className="section-main-heading">Best Sellers</h2>
          </div>
          <Link to="/shop" className="view-all-link">
            View All Best Sellers →
          </Link>
        </div>

        {loadingProducts ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" size={32} color="#9B2242" />
          </div>
        ) : (
          <div className="product-cards-grid">
            {bestSellers.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 7. RECENTLY ADDED */}
      <section className="home-section recently-added-section">
        <div className="section-header-row">
          <div>
            <div className="section-badge-inline">
              <Flame size={16} color="#E63946" />
              <span>JUST UNPACKED</span>
            </div>
            <h2 className="section-main-heading">Recently Added</h2>
          </div>
          <Link to="/shop" className="view-all-link">
            View All Recent →
          </Link>
        </div>

        {loadingProducts ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" size={32} color="#9B2242" />
          </div>
        ) : (
          <div className="product-cards-grid">
            {recentlyAdded.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 8. ALL PRODUCTS CATALOG WITH LOAD MORE */}
      <section className="home-section all-products-catalog-section">
        <div className="section-header-block">
          <span className="section-eyebrow">SARAVANA WOMEN DRESSES WARDROBE</span>
          <h2 className="section-main-heading">All Dresses & Outfits</h2>
          <p className="section-sub-text">Browse our complete collection with infinite loading and instant filters</p>
        </div>

        <ProductGrid products={allProducts} itemsPerPage={8} />
      </section>
    </div>
  );
}
