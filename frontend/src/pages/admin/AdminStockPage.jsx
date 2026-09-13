import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle,
  Save,
  Loader2,
  Package,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchProducts, updateAdminProductStock } from '../../services/api';

export default function AdminStockPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [stockInputs, setStockInputs] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadStockData = () => {
    setLoading(true);
    fetchProducts({ limit: 100 })
      .then((res) => {
        if (res.data) {
          setProducts(res.data);
          const initialMap = {};
          res.data.forEach((p) => {
            initialMap[p._id || p.id] = p.stock !== undefined ? p.stock : 10;
          });
          setStockInputs(initialMap);
        }
      })
      .catch((err) => console.error('Error loading inventory:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStockData();
  }, []);

  const handleStockInputChange = (id, value) => {
    const parsed = parseInt(value, 10);
    // Never allow negative values in input
    const cleanValue = isNaN(parsed) ? '' : Math.max(0, parsed);
    setStockInputs((prev) => ({
      ...prev,
      [id]: cleanValue
    }));
  };

  const adjustStock = (id, delta) => {
    setStockInputs((prev) => {
      const current = typeof prev[id] === 'number' ? prev[id] : 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  const handleSaveStock = async (id) => {
    const rawVal = stockInputs[id];
    const newStock = Math.max(0, parseInt(rawVal, 10) || 0);

    setSavingId(id);
    try {
      const res = await updateAdminProductStock(id, newStock);
      if (res.data) {
        setProducts((prev) =>
          prev.map((p) => ((p._id || p.id) === id ? res.data : p))
        );
        setSuccessMsg(`Stock updated for ${res.data.name}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      alert('Failed to update stock: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const lowStockCount = products.filter((p) => (p.stock || 0) <= 5).length;
  const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLow = filterLowStockOnly ? (p.stock || 0) <= 5 : true;
    return matchesSearch && matchesLow;
  });

  return (
    <AdminLayout pageTitle="Inventory & Stock Management">
      {/* Alert Header Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}
      >
        <div className="admin-card" style={{ margin: 0, padding: '20px', borderLeft: '4px solid #10B981' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Tracked Items
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '4px 0 0' }}>
            {products.length}
          </h3>
        </div>

        <div className="admin-card" style={{ margin: 0, padding: '20px', borderLeft: '4px solid #F59E0B' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
            Low-Stock Warning (&le; 5 units)
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', margin: '4px 0 0' }}>
            {lowStockCount} items
          </h3>
        </div>

        <div className="admin-card" style={{ margin: 0, padding: '20px', borderLeft: '4px solid #EF4444' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
            Out of Stock (0 units)
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#DC2626', margin: '4px 0 0' }}>
            {outOfStockCount} items
          </h3>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}
        >
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>

            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: filterLowStockOnly ? '1px solid #D97706' : '1px solid #CBD5E1',
                background: filterLowStockOnly ? '#FEF3C7' : '#FFF',
                color: filterLowStockOnly ? '#92400E' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertTriangle size={14} />
              <span>Low-Stock Only ({lowStockCount})</span>
            </button>
          </div>

          <button
            onClick={loadStockData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              background: '#FFF',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: '#334155'
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="animate-spin" size={36} color="#9B2242" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Product</th>
                  <th style={{ padding: '12px 16px' }}>Category & Price</th>
                  <th style={{ padding: '12px 16px' }}>Current Stock</th>
                  <th style={{ padding: '12px 16px' }}>Status Warning</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Adjust Quantity (Min 0)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Save Update</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const prodId = p._id || p.id;
                  const currentStock = p.stock !== undefined ? p.stock : 10;
                  const inputVal = stockInputs[prodId] !== undefined ? stockInputs[prodId] : currentStock;
                  const isLow = currentStock <= 5;
                  const isOut = currentStock === 0;
                  const isSaving = savingId === prodId;
                  const isModified = inputVal !== currentStock;

                  return (
                    <tr
                      key={prodId}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        background: isOut ? '#FEF2F2' : isLow ? '#FFFBEB' : '#FFF'
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={p.images?.[0] || p.image}
                            alt={p.name}
                            style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, color: '#0F172A', display: 'block' }}>{p.name}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.brand}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'block', fontWeight: 600, color: '#0F172A' }}>{p.category}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          ₹{(p.finalPrice || p.price).toLocaleString()}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: isOut ? '#DC2626' : isLow ? '#D97706' : '#16A34A'
                          }}
                        >
                          {currentStock} units
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isOut ? '#FEE2E2' : isLow ? '#FEF3C7' : '#ECFDF5',
                            color: isOut ? '#DC2626' : isLow ? '#92400E' : '#065F46'
                          }}
                        >
                          {isLow && <AlertTriangle size={12} />}
                          {p.availability || (isOut ? 'Out of Stock' : 'In Stock')}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => adjustStock(prodId, -1)}
                            disabled={inputVal <= 0}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              background: '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: inputVal <= 0 ? 'not-allowed' : 'pointer',
                              opacity: inputVal <= 0 ? 0.4 : 1
                            }}
                          >
                            <Minus size={14} />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={inputVal}
                            onChange={(e) => handleStockInputChange(prodId, e.target.value)}
                            style={{
                              width: '60px',
                              textAlign: 'center',
                              padding: '4px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontWeight: 700,
                              fontSize: '0.9rem'
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => adjustStock(prodId, 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              background: '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleSaveStock(prodId)}
                          disabled={isSaving || !isModified}
                          className="btn-primary"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            opacity: isModified ? 1 : 0.4,
                            cursor: isModified ? 'pointer' : 'default'
                          }}
                        >
                          {isSaving ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <Save size={14} />
                          )}
                          <span>Save</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
