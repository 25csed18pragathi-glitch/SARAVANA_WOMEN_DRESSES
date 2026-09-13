import { useState, useEffect } from 'react';
import {
  Shirt,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Upload,
  X,
  Check,
  Loader2,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImageFile
} from '../../services/api';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const COMMON_COLORS = [
  { name: 'Crimson Red', hex: '#9B2242' },
  { name: 'Royal Blue', hex: '#1D3557' },
  { name: 'Emerald Green', hex: '#2D6A4F' },
  { name: 'Antique Gold', hex: '#D4AF37' },
  { name: 'Classic Black', hex: '#111827' },
  { name: 'Ivory White', hex: '#F8F9FA' },
  { name: 'Rose Pink', hex: '#F4ACB7' },
  { name: 'Mustard Yellow', hex: '#E9C46A' }
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    description: '',
    price: '',
    discount: 0,
    finalPrice: '',
    stock: 10,
    category: '',
    brand: '',
    sizes: ['Free Size'],
    colors: [{ name: 'Crimson Red', hex: '#9B2242' }],
    availability: 'In Stock',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
    isTrending: false,
    isBestSeller: false,
    isNew: false
  };
  const [formData, setFormData] = useState(initialForm);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        fetchProducts({ limit: 100 }),
        fetchCategories(),
        fetchBrands()
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (brandRes.data) setBrands(brandRes.data);
    } catch (err) {
      console.error('Error loading product catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      ...initialForm,
      category: categories[0]?.name || 'Sarees',
      brand: brands[0]?.name || 'Saravana Silk Heritage'
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setIsEditing(true);
    setEditId(p._id || p.id);
    setFormData({
      name: p.name || '',
      description: p.description || '',
      price: p.price || '',
      discount: p.discount || 0,
      finalPrice: p.finalPrice || p.price || '',
      stock: p.stock !== undefined ? p.stock : 10,
      category: p.category || categories[0]?.name || '',
      brand: p.brand || brands[0]?.name || '',
      sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ['Free Size'],
      colors: p.colors && p.colors.length > 0 ? p.colors : [{ name: 'Crimson Red', hex: '#9B2242' }],
      availability: p.availability || 'In Stock',
      images: p.images && p.images.length > 0 ? p.images : [p.image],
      isTrending: !!p.isTrending,
      isBestSeller: !!p.isBestSeller,
      isNew: !!p.isNew
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handlePriceOrDiscountChange = (field, val) => {
    const num = Number(val);
    const updated = { ...formData, [field]: val };

    const price = field === 'price' ? num : Number(formData.price || 0);
    const discount = field === 'discount' ? num : Number(formData.discount || 0);

    if (price >= 0) {
      const calculated = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
      updated.finalPrice = calculated;
    }
    setFormData(updated);
  };

  const handleStockChange = (val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    let availability = 'In Stock';
    if (num === 0) availability = 'Out of Stock';
    else if (num <= 3) availability = 'Only a few Left';
    else if (num <= 5) availability = 'Limited Stock';

    setFormData((prev) => ({
      ...prev,
      stock: num,
      availability
    }));
  };

  const handleSizeToggle = (sz) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(sz);
      const newSizes = exists ? prev.sizes.filter((s) => s !== sz) : [...prev.sizes, sz];
      return { ...prev, sizes: newSizes.length > 0 ? newSizes : ['Free Size'] };
    });
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()]
      }));
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadImageFile(file);
      if (res.data?.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, res.data.url]
        }));
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      setModalError('Please fill in product name, price, and category');
      return;
    }

    if (Number(formData.stock) < 0) {
      setModalError('Stock quantity cannot be negative');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    const payload = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount),
      finalPrice: Number(formData.finalPrice || formData.price),
      stock: Number(formData.stock)
    };

    try {
      if (isEditing) {
        await updateProduct(editId, payload);
      } else {
        await createProduct(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Error saving product');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Filtered product catalog
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = !filterCategory || p.category === filterCategory;
    const matchesBrand = !filterBrand || p.brand === filterBrand;
    return matchesSearch && matchesCat && matchesBrand;
  });

  return (
    <AdminLayout pageTitle="Product Catalog Management">
      {/* Top Bar with Add Button and Quick Filters */}
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
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder="Search products by name, brand, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                background: '#FFF'
              }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c._id || c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                background: '#FFF'
              }}
            >
              <option value="">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b._id || b.slug} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={openAddModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="animate-spin" size={36} color="#9B2242" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <Shirt size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ color: '#0F172A', margin: '0 0 6px' }}>No dresses match your filters</h3>
            <p style={{ margin: 0 }}>Try clearing filters or search term.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Product</th>
                  <th style={{ padding: '12px 16px' }}>Category & Brand</th>
                  <th style={{ padding: '12px 16px' }}>Price</th>
                  <th style={{ padding: '12px 16px' }}>Stock</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const prodId = p._id || p.id;
                  const thumb = p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c';
                  const isLow = p.stock <= 5;

                  return (
                    <tr key={prodId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={thumb}
                            alt={p.name}
                            style={{
                              width: '44px',
                              height: '52px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0'
                            }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, color: '#0F172A', display: 'block' }}>
                              {p.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              ID: {prodId.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'block', fontWeight: 600, color: '#0F172A' }}>{p.category}</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{p.brand}</span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>
                          ₹{(p.finalPrice || p.price).toLocaleString()}
                        </div>
                        {p.discount > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                            {p.discount}% OFF (MRP ₹{p.price.toLocaleString()})
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            background: p.stock === 0 ? '#FEE2E2' : isLow ? '#FEF3C7' : '#F1F5F9',
                            color: p.stock === 0 ? '#DC2626' : isLow ? '#D97706' : '#334155'
                          }}
                        >
                          {isLow && <AlertTriangle size={12} />}
                          {p.stock} units
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: p.stock > 0 ? '#ECFDF5' : '#FEF2F2',
                            color: p.stock > 0 ? '#059669' : '#DC2626'
                          }}
                        >
                          {p.availability || (p.stock > 0 ? 'In Stock' : 'Out of Stock')}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            style={{
                              background: '#F1F5F9',
                              border: 'none',
                              color: '#334155',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(prodId)}
                            title="Delete Product"
                            style={{
                              background: '#FEE2E2',
                              border: 'none',
                              color: '#DC2626',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '760px',
              maxHeight: '90vh',
              borderRadius: '16px',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#FFF',
                zIndex: 10
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>
                {isEditing ? 'Edit Product' : 'Add New Dress to Catalog'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {modalError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '18px',
                    fontSize: '0.88rem'
                  }}
                >
                  {modalError}
                </div>
              )}

              {/* Product Title */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                  Dress / Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Kanjeevaram Silk Saree"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              {/* Description */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fabric narrative, border details, occasion styling advice..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              {/* Price, Discount, Final Price, Stock Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                    MRP Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => handlePriceOrDiscountChange('price', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => handlePriceOrDiscountChange('discount', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={formData.finalPrice}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                    Inventory Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => handleStockChange(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              {/* Category & Brand Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF' }}
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                    Brand *
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF' }}
                  >
                    {brands.map((b) => (
                      <option key={b._id || b.slug} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sizes Checkboxes */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                  Available Sizes
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {AVAILABLE_SIZES.map((sz) => {
                    const selected = formData.sizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => handleSizeToggle(sz)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: selected ? '1px solid #9B2242' : '1px solid #CBD5E1',
                          background: selected ? '#9B2242' : '#FFF',
                          color: selected ? '#FFF' : '#334155',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Management Section */}
              <div style={{ marginBottom: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>
                  Product Images (Multi-Image Support & Cloudinary Ready)
                </label>
                <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#64748B' }}>
                  Add image URLs directly, or upload files below. Large files are never saved in MongoDB.
                </p>

                {/* Add URL Row */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    style={{ background: '#334155', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Add URL
                  </button>
                </div>

                {/* File Upload Trigger */}
                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: '#FFFFFF',
                      border: '1px dashed #94A3B8',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: '#475569'
                    }}
                  >
                    <Upload size={16} />
                    <span>{uploadingImage ? 'Uploading image...' : 'Upload Image File'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                  </label>
                </div>

                {/* Thumbnails preview */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: '70px',
                        height: '84px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid #CBD5E1'
                      }}
                    >
                      <img src={img} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFF',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={modalLoading}
                  style={{ padding: '10px 22px' }}
                >
                  {modalLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            zIndex: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '100%' }}>
            <h4 style={{ margin: '0 0 8px', color: '#991B1B', fontSize: '1.1rem' }}>Delete Product?</h4>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.9rem' }}>
              Are you sure you want to delete this product? This action removes it from the customer storefront.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#DC2626', color: '#FFF' }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
