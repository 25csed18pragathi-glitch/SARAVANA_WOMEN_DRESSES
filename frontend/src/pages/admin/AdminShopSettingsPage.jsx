import { useEffect, useState } from 'react';
import { Image, Loader2, Save } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  fetchAdminShopSettings,
  updateAdminShopSettings,
  uploadImageFile
} from '../../services/api';

const initialForm = {
  shopName: '',
  logoUrl: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  mapLink: '',
  instagramLink: '',
  facebookLink: '',
  websiteLink: '',
  businessDescription: '',
  customerSupport: '',
  returnRefundPolicy: ''
};

const fieldGroups = [
  {
    title: 'Store identity',
    fields: [
      ['shopName', 'Shop name'],
      ['logoUrl', 'Logo URL'],
      ['businessDescription', 'Business description', 'textarea']
    ]
  },
  {
    title: 'Contact and address',
    fields: [
      ['phone', 'Phone number'],
      ['whatsapp', 'WhatsApp number'],
      ['email', 'Email address'],
      ['address', 'Full shop address', 'textarea'],
      ['city', 'City'],
      ['state', 'State'],
      ['pincode', 'Pincode'],
      ['mapLink', 'Google Maps link']
    ]
  },
  {
    title: 'Social links',
    fields: [
      ['instagramLink', 'Instagram link'],
      ['facebookLink', 'Facebook link'],
      ['websiteLink', 'Website link']
    ]
  },
  {
    title: 'Customer care and policies',
    fields: [
      ['customerSupport', 'Customer support information', 'textarea'],
      ['returnRefundPolicy', 'Return/refund information', 'textarea']
    ]
  }
];

export default function AdminShopSettingsPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchAdminShopSettings()
      .then((response) => setForm({ ...initialForm, ...response.data }))
      .catch((error) => setFeedback({ type: 'error', text: error.message || 'Unable to load shop settings' }))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFeedback(null);
    try {
      const response = await uploadImageFile(file, 'saravana-women-dresses/branding');
      updateField('logoUrl', response.data?.url || '');
      setFeedback({ type: 'success', text: 'Logo uploaded. Save settings to apply it.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'Logo upload failed' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const response = await updateAdminShopSettings(form);
      setForm({ ...initialForm, ...response.data });
      setFeedback({ type: 'success', text: 'Shop settings saved successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'Unable to save shop settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout pageTitle="Shop Settings">
      <div className="admin-card" style={{ maxWidth: '980px' }}>
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ margin: 0, color: '#0F172A' }}>Shop Settings</h2>
          <p style={{ color: '#64748B', margin: '6px 0 0' }}>
            Update the public store identity and customer contact information from one place.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader2 className="animate-spin" /></div>
        ) : (
          <form onSubmit={handleSubmit}>
            {feedback && (
              <div style={{ padding: '12px 14px', marginBottom: '18px', borderRadius: '8px', background: feedback.type === 'error' ? '#FEF2F2' : '#ECFDF5', color: feedback.type === 'error' ? '#B91C1C' : '#047857' }}>
                {feedback.text}
              </div>
            )}

            {fieldGroups.map((group) => (
              <section key={group.title} style={{ borderTop: '1px solid #E2E8F0', padding: '20px 0' }}>
                <h3 style={{ margin: '0 0 14px', color: '#334155', fontSize: '1rem' }}>{group.title}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  {group.fields.map(([name, label, type]) => (
                    <label key={name} style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569', fontWeight: 600, fontSize: '0.86rem', gridColumn: type === 'textarea' ? '1 / -1' : undefined }}>
                      {label}
                      {type === 'textarea' ? (
                        <textarea rows={3} value={form[name]} onChange={(event) => updateField(name, event.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', resize: 'vertical', font: 'inherit' }} />
                      ) : (
                        <input type={name === 'email' ? 'email' : 'text'} value={form[name]} onChange={(event) => updateField(name, event.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px' }} />
                      )}
                    </label>
                  ))}
                </div>
              </section>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
              <label className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: uploading ? 'wait' : 'pointer' }}>
                <Image size={16} />
                {uploading ? 'Uploading...' : 'Upload logo'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} hidden />
              </label>
              {form.logoUrl && <img src={form.logoUrl} alt="Shop logo preview" style={{ width: '48px', height: '48px', objectFit: 'contain', border: '1px solid #E2E8F0', borderRadius: '8px' }} />}
              <button type="submit" className="btn-primary" disabled={saving || uploading} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
