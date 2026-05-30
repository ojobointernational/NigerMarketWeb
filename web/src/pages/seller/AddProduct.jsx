import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';

export default function AddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '',
    stock: '', category_id: '',
  });

  useEffect(() => {
    api.get('/products/categories').then(r => setCategories(r.data)).catch(console.error);
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Product name is required.');
    if (!form.price || isNaN(parseFloat(form.price))) return toast.error('Enter a valid price.');

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (imageFile) formData.append('image', imageFile);

      await api.post('/seller/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Product added successfully!');
      navigate('/seller');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <button className="btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="page-title">Add New Product</h1>
        <div />
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Image upload */}
          <div>
            <label className="form-label">Product Image</label>
            <label className="img-upload-area">
              {imagePreview
                ? <img src={imagePreview} alt="preview" className="img-preview" />
                : <div className="img-upload-placeholder">
                    <Upload size={32} color="var(--gray-400)" />
                    <span>Click to upload image</span>
                    <small>JPG, PNG, WebP up to 5MB</small>
                  </div>
              }
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-input" placeholder="e.g. iPhone 15 Pro Max" value={form.name} onChange={set('name')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" placeholder="Describe your product in detail..." value={form.description} onChange={set('description')} rows={5} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Price (₦) *</label>
              <input className="form-input" type="number" placeholder="0.00" step="0.01" min="0" value={form.price} onChange={set('price')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input className="form-input" type="number" placeholder="0" min="0" value={form.stock} onChange={set('stock')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category_id} onChange={set('category_id')}>
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Adding Product...' : '✅ Add Product'}
          </button>
        </div>
      </form>

      <style>{`
        .img-upload-area {
          display: block; width: 100%; border: 2px dashed var(--gray-300);
          border-radius: var(--radius-md); overflow: hidden;
          cursor: pointer; transition: var(--transition);
          min-height: 200px;
        }
        .img-upload-area:hover { border-color: var(--green); background: var(--green-pale); }
        .img-upload-placeholder {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 8px;
          padding: 40px; color: var(--gray-500); font-size: 14px;
          min-height: 200px;
        }
        .img-upload-placeholder small { color: var(--gray-400); font-size: 12px; }
        .img-preview { width: 100%; max-height: 300px; object-fit: cover; display: block; }
      `}</style>
    </div>
  );
}