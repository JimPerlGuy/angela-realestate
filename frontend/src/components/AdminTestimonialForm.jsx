import { useState } from 'react';

export default function AdminTestimonialForm({ testimonial, token, apiBase, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(testimonial || { rating: 5, text: '', name: '', contactType: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const method = testimonial ? 'PATCH' : 'POST';
      const url = testimonial
        ? `${apiBase}/api/admin/testimonials/${testimonial.id}`
        : `${apiBase}/api/admin/testimonials`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      const saved = await res.json();
      onSuccess(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-900 text-red-100 rounded text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5 stars)</label>
        <select
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial Text</label>
        <textarea
          name="text"
          value={formData.text}
          onChange={handleChange}
          required
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          placeholder="Client testimonial text..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Sarah Martinez"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Type</label>
        <input
          type="text"
          name="contactType"
          value={formData.contactType}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., DFW Homebuyer, Houston Seller"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md"
        >
          {loading ? 'Saving...' : testimonial ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
