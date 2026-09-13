import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Mic, History, Trash2, Tag, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { fetchProducts } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import VoiceSearchModal from '../components/common/VoiceSearchModal';

const DEFAULT_RECENT = ['Silk Saree', 'Anarkali Kurti', 'Party Gown', 'Fabindia', 'Zara Dresses'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(currentQuery);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const { categories } = useShop();

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Recent searches stored in localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('swd_recent_searches');
      return saved ? JSON.parse(saved) : DEFAULT_RECENT;
    } catch {
      return DEFAULT_RECENT;
    }
  });

  const [prevQuery, setPrevQuery] = useState(currentQuery);
  if (prevQuery !== currentQuery) {
    setPrevQuery(currentQuery);
    setSearchInput(currentQuery);
  }

  const saveRecentTerm = (term) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cleaned.toLowerCase());
      const updated = [cleaned, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('swd_recent_searches', JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      saveRecentTerm(searchInput);
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const handleVoiceResult = (spokenText) => {
    setSearchInput(spokenText);
    saveRecentTerm(spokenText);
    setSearchParams({ q: spokenText.trim() });
  };

  const handleChipClick = (term) => {
    setSearchInput(term);
    saveRecentTerm(term);
    setSearchParams({ q: term });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('swd_recent_searches');
    } catch {
      // Ignore storage errors
    }
  };

  // Dynamically fetch search results from MongoDB via backend API
  useEffect(() => {
    let isMounted = true;
    if (!currentQuery.trim()) {
      setSearchResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    fetchProducts({ search: currentQuery.trim(), limit: 100 })
      .then((res) => {
        if (isMounted) {
          setSearchResults(res.data || []);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Error executing product search query:', err);
        if (isMounted) {
          setSearchResults([]);
          setError(err.message || 'Unable to load search results from database');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentQuery, retryCount]);

  return (
    <div className="search-page-wrapper">
      {/* Search Header Banner */}
      <div className="search-header-hero">
        <div className="search-container">
          <h1 className="search-hero-title">Search Saravana Women Dresses</h1>
          <p className="search-hero-subtitle">
            Find the perfect dress, saree, kurti or fashion label instantly
          </p>

          {/* Search Bar Input */}
          <form className="search-main-form" onSubmit={handleSearchSubmit}>
            <Search size={22} className="search-form-icon" />
            <input
              type="text"
              placeholder="Search by product name, brand, or category..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-large-input"
              autoFocus
            />
            <button
              type="button"
              className="search-voice-trigger"
              onClick={() => setIsVoiceOpen(true)}
              title="Voice Search"
              aria-label="Voice Search"
            >
              <Mic size={20} />
            </button>
            <button type="submit" className="search-submit-button">
              Search
            </button>
          </form>

          {/* Recent Searches Chips */}
          {recentSearches.length > 0 && (
            <div className="recent-searches-row">
              <div className="recent-label">
                <History size={14} />
                <span>Recent Searches:</span>
              </div>
              <div className="recent-chips-list">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="recent-chip"
                    onClick={() => handleChipClick(term)}
                  >
                    {term}
                  </button>
                ))}
                <button
                  type="button"
                  className="clear-recent-btn"
                  onClick={clearRecentSearches}
                  title="Clear history"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results / Content Area */}
      <div className="search-content-area">
        {currentQuery ? (
          <div>
            <div className="search-meta-bar">
              <div>
                <span className="results-query-label">Search Results for:</span>
                <span className="results-query-highlight">"{currentQuery}"</span>
              </div>
              {!loading && (
                <div className="results-count-badge">
                  <Tag size={14} />
                  <span>{searchResults.length} Products Found</span>
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '260px' }}>
                <Loader2 className="animate-spin" size={36} color="#9B2242" />
              </div>
            ) : error ? (
              <div className="search-no-results" style={{ borderColor: '#FCA5A5', background: '#FEF2F2' }}>
                <div className="no-results-icon-wrap" style={{ background: '#FEE2E2' }}>
                  <AlertCircle size={44} color="#991B1B" />
                </div>
                <h3 style={{ color: '#991B1B' }}>Search Unavailable</h3>
                <p style={{ color: '#7F1D1D' }}>
                  {error}. Please verify the database connection or try again.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setRetryCount((prev) => prev + 1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    margin: '16px auto 0'
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Retry Search</span>
                </button>
              </div>
            ) : searchResults.length > 0 ? (
              <ProductGrid products={searchResults} itemsPerPage={8} />
            ) : (
              <div className="search-no-results">
                <div className="no-results-icon-wrap">
                  <Search size={44} color="#9B2242" />
                </div>
                <h3>No dresses found for "{currentQuery}"</h3>
                <p>
                  We couldn't find any direct matches. Try searching by fabric, brand (e.g. <em>Biba</em>, <em>Aurelia</em>) or choose from our popular categories below:
                </p>

                <div className="suggested-categories-grid">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id || cat._id}
                      to={`/category/${cat.slug}`}
                      className="suggested-cat-card"
                    >
                      <img src={cat.image} alt={cat.name} />
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty initial search state */
          <div className="search-placeholder-view">
            <h3 className="trending-searches-title">Popular Fashion Categories</h3>
            <div className="suggested-categories-grid">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id || cat._id}
                  to={`/category/${cat.slug}`}
                  className="suggested-cat-card"
                >
                  <img src={cat.image} alt={cat.name} />
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSearchSubmit={handleVoiceResult}
      />
    </div>
  );
}
