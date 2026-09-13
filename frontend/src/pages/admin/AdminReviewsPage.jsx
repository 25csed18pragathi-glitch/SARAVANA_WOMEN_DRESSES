import { useState, useEffect } from 'react';
import { Star, Trash2, Eye, EyeOff, Check, X, Search, Loader2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import StarRating from '../../components/common/StarRating';
import { fetchAdminReviews, updateAdminReviewStatus, deleteAdminReview } from '../../services/api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadReviews = () => {
    setLoading(true);
    fetchAdminReviews({
      status: statusFilter !== 'all' ? statusFilter : '',
      search: searchTerm.trim()
    })
      .then((res) => {
        if (res.data) setReviews(res.data);
      })
      .catch((err) => console.error('Error fetching reviews:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  const handleToggleStatus = async (review) => {
    const nextStatus = review.status === 'approved' ? 'hidden' : 'approved';
    try {
      const res = await updateAdminReviewStatus(review._id, nextStatus);
      if (res.data) {
        setReviews((prev) =>
          prev.map((r) => (r._id === review._id ? res.data : r))
        );
      }
    } catch (err) {
      alert('Status change failed: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      await deleteAdminReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert('Failed to delete review: ' + err.message);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadReviews();
  };

  return (
    <AdminLayout pageTitle="Product Review Moderation">
      {/* Header and Search */}
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: statusFilter === 'all' ? '#9B2242' : '#F1F5F9',
                color: statusFilter === 'all' ? '#FFF' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All Reviews
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: statusFilter === 'approved' ? '#9B2242' : '#F1F5F9',
                color: statusFilter === 'approved' ? '#FFF' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Approved Public
            </button>
            <button
              onClick={() => setStatusFilter('hidden')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: statusFilter === 'hidden' ? '#9B2242' : '#F1F5F9',
                color: statusFilter === 'hidden' ? '#FFF' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Hidden / Flagged
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder="Search reviewer or comment text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Review List */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="animate-spin" size={36} color="#9B2242" />
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <Star size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ color: '#0F172A', margin: '0 0 6px' }}>No reviews found</h3>
            <p style={{ margin: 0 }}>Try clearing search criteria or filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Dress / Product</th>
                  <th style={{ padding: '12px 16px' }}>Reviewer</th>
                  <th style={{ padding: '12px 16px' }}>Rating</th>
                  <th style={{ padding: '12px 16px' }}>Customer Feedback</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Moderation</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => {
                  const isApproved = rev.status === 'approved';
                  return (
                    <tr key={rev._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={rev.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c'}
                            alt={rev.product?.name || 'Dress'}
                            style={{ width: '38px', height: '46px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, color: '#0F172A', display: 'block', fontSize: '0.85rem' }}>
                              {rev.product?.name || 'Unlinked Product'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              {rev.product?.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A', display: 'block' }}>
                          {rev.customerName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <StarRating rating={rev.rating} size={13} reviews={null} />
                      </td>

                      <td style={{ padding: '12px 16px', maxWidth: '340px' }}>
                        <p style={{ margin: 0, color: '#334155', fontSize: '0.85rem', lineHeight: 1.4 }}>
                          "{rev.comment}"
                        </p>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: isApproved ? '#ECFDF5' : '#FEF2F2',
                            color: isApproved ? '#059669' : '#DC2626'
                          }}
                        >
                          {isApproved ? 'Approved' : 'Hidden'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => handleToggleStatus(rev)}
                            title={isApproved ? 'Hide from Storefront' : 'Approve on Storefront'}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              background: isApproved ? '#FEF3C7' : '#ECFDF5',
                              color: isApproved ? '#92400E' : '#059669',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}
                          >
                            {isApproved ? <EyeOff size={13} /> : <Eye size={13} />}
                            <span>{isApproved ? 'Hide' : 'Approve'}</span>
                          </button>

                          <button
                            onClick={() => handleDelete(rev._id)}
                            title="Delete Review"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#FEE2E2',
                              color: '#DC2626',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}
                          >
                            <Trash2 size={13} />
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
    </AdminLayout>
  );
}
