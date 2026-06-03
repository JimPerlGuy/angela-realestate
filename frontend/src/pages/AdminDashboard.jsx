import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken, getToken, authFetch, API_BASE } from '../api';
import AdminListingForm from '../components/AdminListingForm';
import AdminPhotoUpload from '../components/AdminPhotoUpload';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = getToken();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'form' | 'photos'
  const [editListing, setEditListing] = useState(null);
  const [photoListing, setPhotoListing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await authFetch('/api/admin/listings');
      if (!res.ok) throw new Error(`Failed to load listings (${res.status})`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  function handleLogout() {
    clearToken();
    navigate('/admin/login');
  }

  function handleNew() {
    setEditListing(null);
    setView('form');
  }

  function handleEdit(listing) {
    setEditListing(listing);
    setView('form');
  }

  function handleManagePhotos(listing) {
    setPhotoListing(listing);
    setView('photos');
  }

  function handleFormSuccess(saved) {
    fetchListings();
    if (!editListing) {
      setPhotoListing(saved);
      setView('photos');
    } else {
      setView('list');
      setEditListing(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await authFetch(`/api/admin/listings/${deleteTarget}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Delete failed (${res.status})`);
      }
      setListings(prev => prev.filter(l => l.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function goToList() {
    setView('list');
    setEditListing(null);
    setPhotoListing(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            {view !== 'list' && (
              <button
                onClick={goToList}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Back to listings"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-semibold text-gray-900">
              {view === 'list' && 'Listings'}
              {view === 'form' && (editListing ? 'Edit Listing' : 'New Listing')}
              {view === 'photos' && 'Manage Photos'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {view === 'list' && (
              <button
                onClick={handleNew}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                + New Listing
              </button>
            )}
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {view === 'list' && (
          <ListingsView
            listings={listings}
            loading={loading}
            fetchError={fetchError}
            deleteTarget={deleteTarget}
            deleting={deleting}
            deleteError={deleteError}
            onEdit={handleEdit}
            onDelete={(id) => { setDeleteTarget(id); setDeleteError(''); }}
            onCancelDelete={() => { setDeleteTarget(null); setDeleteError(''); }}
            onConfirmDelete={handleDelete}
            onManagePhotos={handleManagePhotos}
            onRefresh={fetchListings}
          />
        )}

        {view === 'form' && (
          <div className="mx-auto max-w-2xl bg-white rounded-lg shadow-sm p-6">
            <AdminListingForm
              listing={editListing}
              token={token}
              apiBase={API_BASE}
              onSuccess={handleFormSuccess}
              onCancel={goToList}
            />
          </div>
        )}

        {view === 'photos' && photoListing && (
          <div className="mx-auto max-w-2xl bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-6 truncate">{photoListing.address}</p>
            <AdminPhotoUpload
              listingId={photoListing.id}
              initialPhotos={photoListing.photos || []}
              token={token}
              apiBase={API_BASE}
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={goToList}
                className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ListingsView({ listings, loading, fetchError, deleteTarget, deleting, deleteError, onEdit, onDelete, onCancelDelete, onConfirmDelete, onManagePhotos, onRefresh }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-6 w-6 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-3 text-sm text-gray-600">Loading listings…</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200 flex items-center justify-between">
        <span>{fetchError}</span>
        <button onClick={onRefresh} className="ml-4 font-medium underline hover:text-red-900">Retry</button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-sm">No listings yet — click <strong>+ New Listing</strong> to add one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {deleteError}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden sm:table-cell">Beds / Baths</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">Sqft</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.map(listing =>
              deleteTarget === listing.id ? (
                <tr key={listing.id} className="bg-red-50">
                  <td colSpan={5} className="px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <p className="text-sm text-red-700 font-medium">
                        Delete &ldquo;{listing.address}&rdquo;? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={onCancelDelete}
                          disabled={deleting}
                          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={onConfirmDelete}
                          disabled={deleting}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                        >
                          {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{listing.address}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">${listing.price?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 hidden sm:table-cell">{listing.bedrooms}bd / {listing.bathrooms}ba</td>
                  <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">{listing.sqft?.toLocaleString()} sqft</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onManagePhotos(listing)}
                        className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                      >
                        Photos
                      </button>
                      <button
                        onClick={() => onEdit(listing)}
                        className="rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(listing.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
