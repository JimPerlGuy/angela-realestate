import { useState } from 'react';

const EMPTY_FORM = {
  address: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  description: '',
  features: '',
  status: 'active',
};

function validate(values) {
  const errors = {};
  if (!values.address.trim()) errors.address = 'Address is required';
  if (!values.price || isNaN(Number(values.price)) || Number(values.price) <= 0)
    errors.price = 'Price must be a positive number';
  if (!values.bedrooms || isNaN(Number(values.bedrooms)) || !Number.isInteger(Number(values.bedrooms)) || Number(values.bedrooms) < 0)
    errors.bedrooms = 'Bedrooms must be a non-negative integer';
  if (!values.bathrooms || isNaN(Number(values.bathrooms)) || Number(values.bathrooms) < 0)
    errors.bathrooms = 'Bathrooms must be a non-negative number';
  if (!values.sqft || isNaN(Number(values.sqft)) || !Number.isInteger(Number(values.sqft)) || Number(values.sqft) <= 0)
    errors.sqft = 'Square footage must be a positive integer';
  return errors;
}

function toPayload(values) {
  return {
    address: values.address.trim(),
    price: parseInt(values.price, 10),
    bedrooms: parseInt(values.bedrooms, 10),
    bathrooms: parseFloat(values.bathrooms),
    sqft: parseInt(values.sqft, 10),
    description: values.description.trim(),
    features: values.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean),
    status: values.status,
  };
}

/**
 * AdminListingForm — create or edit a listing.
 *
 * Props:
 *   listing   — existing listing object for edit mode (optional; omit for create)
 *   token     — JWT auth token
 *   apiBase   — API base URL, e.g. "http://localhost:3001" (optional, defaults to "")
 *   onSuccess — called with the saved listing after a successful submit
 *   onCancel  — called when the user clicks Cancel
 */
export default function AdminListingForm({ listing, token, apiBase = '', onSuccess, onCancel }) {
  const isEdit = Boolean(listing?.id);

  const [values, setValues] = useState(
    listing
      ? {
          address: listing.address ?? '',
          price: listing.price != null ? String(listing.price) : '',
          bedrooms: listing.bedrooms != null ? String(listing.bedrooms) : '',
          bathrooms: listing.bathrooms != null ? String(listing.bathrooms) : '',
          sqft: listing.sqft != null ? String(listing.sqft) : '',
          description: listing.description ?? '',
          features: Array.isArray(listing.features) ? listing.features.join(', ') : '',
          status: listing.status ?? 'active',
        }
      : EMPTY_FORM,
  );

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const url = isEdit
      ? `${apiBase}/api/admin/listings/${listing.id}`
      : `${apiBase}/api/admin/listings`;
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(toPayload(values)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${res.status}`);
      }

      const saved = await res.json();
      onSuccess?.(saved);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {isEdit ? 'Edit Listing' : 'New Listing'}
      </h2>

      {submitError && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {submitError}
        </div>
      )}

      {/* Address */}
      <Field label="Address" error={errors.address} required>
        <input
          type="text"
          name="address"
          value={values.address}
          onChange={handleChange}
          placeholder="123 Main St, Austin, TX 78701"
          className={inputClass(errors.address)}
        />
      </Field>

      {/* Price / Beds / Baths / Sqft — 2-column grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Price ($)" error={errors.price} required>
          <input
            type="number"
            name="price"
            value={values.price}
            onChange={handleChange}
            min={0}
            step={1}
            placeholder="450000"
            className={inputClass(errors.price)}
          />
        </Field>

        <Field label="Bedrooms" error={errors.bedrooms} required>
          <input
            type="number"
            name="bedrooms"
            value={values.bedrooms}
            onChange={handleChange}
            min={0}
            step={1}
            placeholder="3"
            className={inputClass(errors.bedrooms)}
          />
        </Field>

        <Field label="Bathrooms" error={errors.bathrooms} required>
          <input
            type="number"
            name="bathrooms"
            value={values.bathrooms}
            onChange={handleChange}
            min={0}
            step={0.5}
            placeholder="2.5"
            className={inputClass(errors.bathrooms)}
          />
        </Field>

        <Field label="Square Footage" error={errors.sqft} required>
          <input
            type="number"
            name="sqft"
            value={values.sqft}
            onChange={handleChange}
            min={1}
            step={1}
            placeholder="1800"
            className={inputClass(errors.sqft)}
          />
        </Field>
      </div>

      {/* Description */}
      <Field label="Description" error={errors.description}>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={5}
          placeholder="Describe the property..."
          className={inputClass(errors.description)}
        />
      </Field>

      {/* Features */}
      <Field
        label="Features"
        error={errors.features}
        hint="Comma-separated (e.g. Pool, Garage, Hardwood floors)"
      >
        <input
          type="text"
          name="features"
          value={values.features}
          onChange={handleChange}
          placeholder="Pool, Garage, Hardwood floors"
          className={inputClass(errors.features)}
        />
      </Field>

      {/* Status */}
      <Field label="Status" required>
        <select
          name="status"
          value={values.status}
          onChange={handleChange}
          className={inputClass(errors.status)}
        >
          <option value="active">Active (Published)</option>
          <option value="draft">Draft (Not Published)</option>
          <option value="archived">Archived</option>
        </select>
      </Field>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Listing'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, hint, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(error) {
  return [
    'block w-full rounded-md border px-3 py-2 text-sm shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
    error
      ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400',
  ].join(' ');
}
