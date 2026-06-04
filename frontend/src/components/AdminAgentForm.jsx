import { useState, useRef } from 'react';

export default function AdminAgentForm({ agent, token, apiBase, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(agent?.photoUrl || null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(agent || {
    name: '',
    title: '',
    bio: '',
    photoUrl: '',
    yearsExperience: '',
    propertiesSold: '',
    activeMarkets: '',
    isPrimary: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'yearsExperience' || name === 'propertiesSold') ? (value ? parseInt(value) : '') : value
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(`${apiBase}/api/admin/agents/${agent.id}/photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload photo');

      const data = await res.json();
      setFormData(prev => ({ ...prev, photoUrl: data.url }));
      setPhotoPreview(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const method = agent ? 'PATCH' : 'POST';
      const url = agent
        ? `${apiBase}/api/admin/agents/${agent.id}`
        : `${apiBase}/api/admin/agents`;

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
        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Angela Slawinski"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Texas Realtor, Senior Agent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          placeholder="Agent bio and background..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              disabled={photoLoading}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 font-medium"
            >
              {photoLoading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
          {photoPreview && (
            <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-md object-cover" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
          <input
            type="number"
            name="yearsExperience"
            value={formData.yearsExperience}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Properties Sold</label>
          <input
            type="number"
            name="propertiesSold"
            value={formData.propertiesSold}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Active Markets</label>
        <input
          type="text"
          name="activeMarkets"
          value={formData.activeMarkets}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., DFW Metroplex, Greater Houston"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPrimary"
          name="isPrimary"
          checked={formData.isPrimary}
          onChange={handleChange}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isPrimary" className="ml-3 text-sm font-medium text-gray-700">
          Mark as primary agent (featured on home page)
        </label>
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
          {loading ? 'Saving...' : agent ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
