import { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../services/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const initialForm = {
    name: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    featured: false
  };
  const [formData, setFormData] = useState(initialForm);

  const loadCategories = () => {
    setLoading(true);
    fetchCategories()
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch((err) => console.error('Error fetching categories:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData(initialForm);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setIsEditing(true);
    setEditId(cat._id || cat.id || cat.slug);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || initialForm.image,
      featured: !!cat.featured
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Category name is required');
      return;
    }

    setModalLoading(true);
    setModalError(null);
    try {
      if (isEditing) {
        await updateCategory(editId, formData);
      } else {
        await createCategory(formData);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      setModalError(err.message || 'Failed to save category');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (idOrSlug) => {
    try {
      await deleteCategory(idOrSlug);
      setDeleteConfirmId(null);
      loadCategories();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <AdminLayout pageTitle="Category Management">
      <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A' }}>
              All Categories ({categories.length})
            </h3>
            <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.85rem' }}>
              Organize catalog collections displayed on the customer navbar and homepage.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={openAddModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Plus size={18} />
            <span>Add Category</span>
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
          {categories.map((cat) => {
            const catId = cat._id || cat.id || cat.slug;
            return (
              <div
                key={catId}
                className="admin-card"
                style={{
                  margin: 0,
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#FFF',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}
                  >
                    {cat.itemCount || 0} Dresses
                  </span>
                </div>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#0F172A' }}>
                    {cat.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#9B2242', fontWeight: 600, marginBottom: '8px' }}>
                    Slug: /{cat.slug}
                  </span>
                  <p
                    style={{
                      margin: '0 0 16px',
                      fontSize: '0.82rem',
                      color: '#64748B',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {cat.description || 'Curated women ethnic and western apparel.'}
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
                      onClick={() => openEditModal(cat)}
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
                      onClick={() => setDeleteConfirmId(catId)}
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

      {/* Add / Edit Category Modal */}
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
                {isEditing ? 'Edit Category' : 'Add New Category'}
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarees, Lehengas, Kurtis"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short summary for category cards and SEO"
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
                  {modalLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
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
            <h4 style={{ margin: '0 0 8px', color: '#991B1B', fontSize: '1.1rem' }}>Delete Category?</h4>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.9rem' }}>
              Are you sure you want to remove this category from the store catalog?
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
