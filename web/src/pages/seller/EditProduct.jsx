import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: '', description: '', price: '',
    stock: '', category_id: '', is_available: 'true',
  });

  useEffect(() => {
    Promise.all([
      api.get(`/seller/products`),
      api.get('/products/categories'),
    ]).then(([pr, cr]) => {
      const product = pr.data.find(p => p.id === parseInt(id));
      if (product) {
        setForm({
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock,
          category_id: product.category_id || '',
          is_available: String(product.is_available),
        });
        if (product.image_url) setImagePreview(product.image_url);
      }
      setCategories(cr.data);
    }).catch(console.error)
    .finally(() => setFetching(false));
  }, [id]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') formData.append(k, v); });
      if (imageFile) formData.append('image', imageFile);

      await api.put(`/seller/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Product updated!');
      navigate('/seller');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <button className="btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="page-title">Edit Product</h1>
        <div />
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="form-label">Product Image</label>
            <label className="img-upload-area">
              {imagePreview
                ? <img src={imagePreview} alt="preview" className="img-preview" />
                : <div className="img-upload-placeholder">
                    <span style={{ fontSize: 32 }}>📷</span>
                    <span>Click to change image</span>
                  </div>
              }
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={form.description} onChange={set('description')} rows={4} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Price (₦) *</label>
              <input className="form-input" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock</label>
              <input className="form-input" type="number" min="0" value={form.stock} onChange={set('stock')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category_id} onChange={set('category_id')}>
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select className="form-select" value={form.is_available} onChange={set('is_available')}>
                <option value="true">✅ Active (visible)</option>
                <option value="false">🚫 Hidden</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </form>

      <style>{`
        .img-upload-area { display: block; width: 100%; border: 2px dashed var(--gray-300); border-radius: var(--radius-md); overflow: hidden; cursor: pointer; transition: var(--transition); min-height: 200px; }
        .img-upload-area:hover { border-color: var(--green); background: var(--green-pale); }
        .img-upload-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 40px; color: var(--gray-500); font-size: 14px; min-height: 200px; }
        .img-preview { width: 100%; max-height: 300px; object-fit: cover; display: block; }
      `}</style>
    </div>
  );
}