import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchBrands, createBrand, updateBrand, deleteBrand } from '../../services/api';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const initialForm = {
    name: '',
    tagline: '',
    logo: '👑',
    accentColor: '#9B2242',
    description: '',
    bannerImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  };
  const [formData, setFormData] = useState(initialForm);

  const loadBrands = () => {
    setLoading(true);
    fetchBrands()
      .then((res) => {
        if (res.data) setBrands(res.data);
      })
      .catch((err) => console.error('Error fetching brands:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData(initialForm);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (brand) => {
    setIsEditing(true);
    setEditId(brand._id || brand.id || brand.slug);
    setFormData({
      name: brand.name || '',
      tagline: brand.tagline || '',
      logo: brand.logo || '👑',
      accentColor: brand.accentColor || '#9B2242',
      description: brand.description || '',
      bannerImage: brand.bannerImage || initialForm.bannerImage
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Brand name is required');
      return;
    }

    setModalLoading(true);
    setModalError(null);
    try {
      if (isEditing) {
        await updateBrand(editId, formData);
      } else {
        await createBrand(formData);
      }
      setIsModalOpen(false);
      loadBrands();
    } catch (err) {
      setModalError(err.message || 'Failed to save brand');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (idOrSlug) => {
    try {
      await deleteBrand(idOrSlug);
      setDeleteConfirmId(null);
      loadBrands();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <AdminLayout pageTitle="Brand Management">
      <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A' }}>
              All Partner Brands ({brands.length})
            </h3>
            <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.85rem' }}>
              Manage Indian ethnic and international designer brand labels.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={openAddModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Plus size={18} />
            <span>Add Brand</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 className="animate-spin" size={36} color="#9B2242" />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}
        >
          {brands.map((brand) => {
            const brandId = brand._id || brand.id || brand.slug;
            return (
              <div
                key={brandId}
                className="admin-card"
                style={{
                  margin: 0,
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '110px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={brand.bannerImage}
                    alt={brand.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '16px',
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: '#FFF',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      border: `2px solid ${brand.accentColor || '#9B2242'}`
                    }}
                  >
                    {brand.logo || '👑'}
                  </div>
                </div>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ margin: '0 0 2px', fontSize: '1.05rem', color: '#0F172A' }}>
                    {brand.name}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: brand.accentColor || '#9B2242', fontWeight: 600, marginBottom: '6px' }}>
                    {brand.tagline || 'Designer Label'}
                  </span>
                  <p
                    style={{
                      margin: '0 0 14px',
                      fontSize: '0.82rem',
                      color: '#64748B',
                      flex: 1
                    }}
                  >
                    {brand.description || 'Exclusive fashion designer collections.'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '12px'
                    }}
                  >
                    <button
                      onClick={() => openEditModal(brand)}
                      style={{
                        background: '#F1F5F9',
                        border: 'none',
                        color: '#334155',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(brandId)}
                      style={{
                        background: '#FEE2E2',
                        border: 'none',
                        color: '#DC2626',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Brand Modal */}
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
              maxWidth: '520px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                {isEditing ? 'Edit Brand' : 'Add New Brand'}
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
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '0.85rem'
                  }}
                >
                  {modalError}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manyavar Mohey, Biba, Fabindia"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                    Brand Logo Emoji / Icon
                  </label>
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                    Accent Theme Color
                  </label>
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    style={{ width: '100%', height: '42px', padding: '4px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                  Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Celebration Wear & Bridal Couture"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                  Brand Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={modalLoading}
                  style={{ padding: '9px 20px' }}
                >
                  {modalLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
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
            <h4 style={{ margin: '0 0 8px', color: '#991B1B', fontSize: '1.1rem' }}>Delete Brand?</h4>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.9rem' }}>
              Are you sure you want to remove this brand label from the partner showcase?
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
