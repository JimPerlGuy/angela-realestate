import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken, getToken, authFetch, API_BASE } from '../api';
import AdminListingForm from '../components/AdminListingForm';
import AdminPhotoUpload from '../components/AdminPhotoUpload';
import AdminTestimonialForm from '../components/AdminTestimonialForm';
import AdminMarketUpdateForm from '../components/AdminMarketUpdateForm';
import AdminAgentForm from '../components/AdminAgentForm';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = getToken();

  const [listings, setListings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [marketUpdates, setMarketUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [view, setView] = useState('listings'); // 'listings' | 'listing-form' | 'photos' | 'agents' | 'agent-form' | 'testimonials' | 'testimonial-form' | 'market-updates' | 'market-update-form'
  const [editListing, setEditListing] = useState(null);
  const [photoListing, setPhotoListing] = useState(null);
  const [editAgent, setEditAgent] = useState(null);
  const [editTestimonial, setEditTestimonial] = useState(null);
  const [editMarketUpdate, setEditMarketUpdate] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'listing' | 'agent' | 'testimonial' | 'market-update'
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchListings = useCallback(async () => {
    setFetchError('');
    try {
      const res = await authFetch('/api/admin/listings');
      if (!res.ok) throw new Error(`Failed to load listings (${res.status})`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      setFetchError(err.message);
    }
  }, []);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await authFetch('/api/admin/testimonials');
      if (!res.ok) throw new Error(`Failed to load testimonials (${res.status})`);
      const data = await res.json();
      setTestimonials(data);
    } catch (err) {
      setFetchError(err.message);
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await authFetch('/api/admin/agents');
      if (!res.ok) throw new Error(`Failed to load agents (${res.status})`);
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      setFetchError(err.message);
    }
  }, []);

  const fetchMarketUpdates = useCallback(async () => {
    try {
      const res = await authFetch('/api/admin/market-updates');
      if (!res.ok) throw new Error(`Failed to load market updates (${res.status})`);
      const data = await res.json();
      setMarketUpdates(data);
    } catch (err) {
      setFetchError(err.message);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchListings(), fetchAgents(), fetchTestimonials(), fetchMarketUpdates()]).finally(() => setLoading(false));
  }, [fetchListings, fetchAgents, fetchTestimonials, fetchMarketUpdates]);

  function handleLogout() {
    clearToken();
    navigate('/admin/login');
  }

  function goToListings() {
    setView('listings');
    setEditListing(null);
    setPhotoListing(null);
  }

  function goToAgents() {
    setView('agents');
    setEditAgent(null);
  }

  function goToTestimonials() {
    setView('testimonials');
    setEditTestimonial(null);
  }

  function goToMarketUpdates() {
    setView('market-updates');
    setEditMarketUpdate(null);
  }

  function handleNewListing() {
    setEditListing(null);
    setView('listing-form');
  }

  function handleEditListing(listing) {
    setEditListing(listing);
    setView('listing-form');
  }

  function handleManagePhotos(listing) {
    setPhotoListing(listing);
    setView('photos');
  }

  function handleListingFormSuccess(saved) {
    fetchListings();
    if (!editListing) {
      setPhotoListing(saved);
      setView('photos');
    } else {
      goToListings();
    }
  }

  function handleNewAgent() {
    setEditAgent(null);
    setView('agent-form');
  }

  function handleEditAgent(agent) {
    setEditAgent(agent);
    setView('agent-form');
  }

  function handleAgentFormSuccess() {
    fetchAgents();
    goToAgents();
  }

  function handleNewTestimonial() {
    setEditTestimonial(null);
    setView('testimonial-form');
  }

  function handleEditTestimonial(testimonial) {
    setEditTestimonial(testimonial);
    setView('testimonial-form');
  }

  function handleTestimonialFormSuccess() {
    fetchTestimonials();
    goToTestimonials();
  }

  function handleNewMarketUpdate() {
    setEditMarketUpdate(null);
    setView('market-update-form');
  }

  function handleEditMarketUpdate(update) {
    setEditMarketUpdate(update);
    setView('market-update-form');
  }

  function handleMarketUpdateFormSuccess() {
    fetchMarketUpdates();
    goToMarketUpdates();
  }

  async function handleDelete() {
    if (!deleteTarget || !deleteType) return;
    setDeleting(true);
    setDeleteError('');
    try {
      let endpoint;
      if (deleteType === 'listing') {
        endpoint = `/api/admin/listings/${deleteTarget}`;
      } else if (deleteType === 'agent') {
        endpoint = `/api/admin/agents/${deleteTarget}`;
      } else if (deleteType === 'testimonial') {
        endpoint = `/api/admin/testimonials/${deleteTarget}`;
      } else if (deleteType === 'market-update') {
        endpoint = `/api/admin/market-updates/${deleteTarget}`;
      }

      const res = await authFetch(endpoint, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Delete failed (${res.status})`);
      }

      if (deleteType === 'listing') {
        setListings(prev => prev.filter(l => l.id !== deleteTarget));
      } else if (deleteType === 'agent') {
        setAgents(prev => prev.filter(a => a.id !== deleteTarget));
      } else if (deleteType === 'testimonial') {
        setTestimonials(prev => prev.filter(t => t.id !== deleteTarget));
      } else if (deleteType === 'market-update') {
        setMarketUpdates(prev => prev.filter(m => m.id !== deleteTarget));
      }

      setDeleteTarget(null);
      setDeleteType(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 mb-0">
            <div className="flex items-center gap-2">
              {(view !== 'listings' && view !== 'testimonials' && view !== 'market-updates') && (
                <button
                  onClick={() => {
                    if (view.includes('listing')) goToListings();
                    else if (view.includes('testimonial')) goToTestimonials();
                    else if (view.includes('market-update')) goToMarketUpdates();
                  }}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                  aria-label="Back"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h1 className="text-lg font-semibold text-gray-900">
                {(view === 'listings' || view === 'listing-form' || view === 'photos') && (view === 'listings' ? 'Listings' : view === 'listing-form' ? (editListing ? 'Edit Listing' : 'New Listing') : 'Manage Photos')}
                {(view === 'agents' || view === 'agent-form') && (view === 'agents' ? 'Agents' : editAgent ? 'Edit Agent' : 'New Agent')}
                {(view === 'testimonials' || view === 'testimonial-form') && (view === 'testimonials' ? 'Testimonials' : editTestimonial ? 'Edit Testimonial' : 'New Testimonial')}
                {(view === 'market-updates' || view === 'market-update-form') && (view === 'market-updates' ? 'Market Updates' : editMarketUpdate ? 'Edit Market Update' : 'New Market Update')}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>

          {(view === 'listings' || view === 'listing-form' || view === 'photos') && (
            <div className="flex gap-6 border-t border-gray-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <button onClick={goToListings} className={`py-4 px-1 border-b-2 font-medium text-sm ${view.includes('listing') ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Listings</button>
            </div>
          )}

          {(view === 'agents' || view === 'agent-form') && (
            <div className="flex gap-6 border-t border-gray-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <button onClick={goToAgents} className={`py-4 px-1 border-b-2 font-medium text-sm ${view === 'agents' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Agents</button>
            </div>
          )}

          {(view === 'testimonials' || view === 'testimonial-form') && (
            <div className="flex gap-6 border-t border-gray-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <button onClick={goToTestimonials} className={`py-4 px-1 border-b-2 font-medium text-sm ${view === 'testimonials' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Testimonials</button>
            </div>
          )}

          {(view === 'market-updates' || view === 'market-update-form') && (
            <div className="flex gap-6 border-t border-gray-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <button onClick={goToMarketUpdates} className={`py-4 px-1 border-b-2 font-medium text-sm ${view === 'market-updates' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Market Updates</button>
            </div>
          )}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 border-t border-gray-200 flex gap-2">
          <button onClick={goToListings} className={`px-4 py-2 rounded-md text-sm font-medium ${view.includes('listing') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}>Listings</button>
          <button onClick={goToAgents} className={`px-4 py-2 rounded-md text-sm font-medium ${view.includes('agent') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}>Agents</button>
          <button onClick={goToTestimonials} className={`px-4 py-2 rounded-md text-sm font-medium ${view.includes('testimonial') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}>Testimonials</button>
          <button onClick={goToMarketUpdates} className={`px-4 py-2 rounded-md text-sm font-medium ${view.includes('market-update') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}>Market Updates</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {(view === 'listings' || view === 'listing-form' || view === 'photos') && (
          <>
            {view === 'listings' && (
              <ListingsView
                listings={listings}
                loading={loading}
                fetchError={fetchError}
                deleteTarget={deleteTarget}
                deleting={deleting}
                deleteError={deleteError}
                onNew={handleNewListing}
                onEdit={handleEditListing}
                onDelete={(id) => { setDeleteTarget(id); setDeleteType('listing'); setDeleteError(''); }}
                onCancelDelete={() => { setDeleteTarget(null); setDeleteType(null); setDeleteError(''); }}
                onConfirmDelete={handleDelete}
                onManagePhotos={handleManagePhotos}
                onRefresh={fetchListings}
              />
            )}

            {view === 'listing-form' && (
              <div className="mx-auto max-w-2xl bg-white rounded-lg shadow-sm p-6">
                <AdminListingForm
                  listing={editListing}
                  token={token}
                  apiBase={API_BASE}
                  onSuccess={handleListingFormSuccess}
                  onCancel={goToListings}
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
                    onClick={goToListings}
                    className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {(view === 'agents' || view === 'agent-form') && (
          <>
            {view === 'agents' && (
              <AgentsView
                agents={agents}
                loading={loading}
                fetchError={fetchError}
                deleteTarget={deleteTarget}
                deleting={deleting}
                deleteError={deleteError}
                onNew={handleNewAgent}
                onEdit={handleEditAgent}
                onDelete={(id) => { setDeleteTarget(id); setDeleteType('agent'); setDeleteError(''); }}
                onCancelDelete={() => { setDeleteTarget(null); setDeleteType(null); setDeleteError(''); }}
                onConfirmDelete={handleDelete}
                onRefresh={fetchAgents}
              />
            )}

            {view === 'agent-form' && (
              <div className="mx-auto max-w-2xl bg-white rounded-lg shadow-sm p-6">
                <AdminAgentForm
                  agent={editAgent}
                  token={token}
                  apiBase={API_BASE}
                  onSuccess={handleAgentFormSuccess}
                  onCancel={goToAgents}
                />
              </div>
            )}
          </>
        )}

        {(view === 'testimonials' || view === 'testimonial-form') && (
          <>
            {view === 'testimonials' && (
              <TestimonialsView
                testimonials={testimonials}
                loading={loading}
                fetchError={fetchError}
                deleteTarget={deleteTarget}
                deleting={deleting}
                deleteError={deleteError}
                onNew={handleNewTestimonial}
                onEdit={handleEditTestimonial}
                onDelete={(id) => { setDeleteTarget(id); setDeleteType('testimonial'); setDeleteError(''); }}
                onCancelDelete={() => { setDeleteTarget(null); setDeleteType(null); setDeleteError(''); }}
                onConfirmDelete={handleDelete}
                onRefresh={fetchTestimonials}
              />
            )}

            {view === 'testimonial-form' && (
              <div className="mx-auto max-w-2xl bg-white rounded-lg shadow-sm p-6">
                <AdminTestimonialForm
                  testimonial={editTestimonial}
                  token={token}
                  apiBase={API_BASE}
                  onSuccess={handleTestimonialFormSuccess}
                  onCancel={goToTestimonials}
                />
              </div>
            )}
          </>
        )}

        {(view === 'market-updates' || view === 'market-update-form') && (
          <>
            {view === 'market-updates' && (
              <MarketUpdatesView
                updates={marketUpdates}
                loading={loading}
                fetchError={fetchError}
                deleteTarget={deleteTarget}
                deleting={deleting}
                deleteError={deleteError}
                onNew={handleNewMarketUpdate}
                onEdit={handleEditMarketUpdate}
                onDelete={(id) => { setDeleteTarget(id); setDeleteType('market-update'); setDeleteError(''); }}
                onCancelDelete={() => { setDeleteTarget(null); setDeleteType(null); setDeleteError(''); }}
                onConfirmDelete={handleDelete}
                onRefresh={fetchMarketUpdates}
              />
            )}

            {view === 'market-update-form' && (
              <div className="mx-auto max-w-2xl bg-white rounded-lg shadow-sm p-6">
                <AdminMarketUpdateForm
                  update={editMarketUpdate}
                  token={token}
                  apiBase={API_BASE}
                  onSuccess={handleMarketUpdateFormSuccess}
                  onCancel={goToMarketUpdates}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ListingsView({ listings, loading, fetchError, deleteTarget, deleting, deleteError, onNew, onEdit, onDelete, onCancelDelete, onConfirmDelete, onManagePhotos, onRefresh }) {
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
      <div className="flex justify-end mb-4">
        <button
          onClick={onNew}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + New Listing
        </button>
      </div>

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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.map(listing =>
              deleteTarget === listing.id ? (
                <tr key={listing.id} className="bg-red-50">
                  <td colSpan={6} className="px-6 py-4">
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
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      listing.status === 'published' ? 'bg-green-100 text-green-800' :
                      listing.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      listing.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1) || 'Unknown'}
                    </span>
                  </td>
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

function TestimonialsView({ testimonials, loading, fetchError, deleteTarget, deleting, deleteError, onNew, onEdit, onDelete, onCancelDelete, onConfirmDelete, onRefresh }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-6 w-6 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-3 text-sm text-gray-600">Loading testimonials…</span>
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={onNew}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + New Testimonial
        </button>
      </div>

      {deleteError && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {deleteError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map(testimonial =>
          deleteTarget === testimonial.id ? (
            <div key={testimonial.id} className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <p className="text-sm text-red-700 font-medium mb-4">Delete testimonial from {testimonial.name}?</p>
              <div className="flex gap-2 justify-end">
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
          ) : (
            <div key={testimonial.id} className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.contactType}</p>
                  <p className="text-sm text-amber-600 mt-1">{'★'.repeat(testimonial.rating)}</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-4 italic">"{testimonial.text}"</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => onEdit(testimonial)}
                  className="rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(testimonial.id)}
                  className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {testimonials.length === 0 && !deleteError && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No testimonials yet — click <strong>+ New Testimonial</strong> to add one.</p>
        </div>
      )}
    </div>
  );
}

function AgentsView({ agents, loading, fetchError, deleteTarget, deleting, deleteError, onNew, onEdit, onDelete, onCancelDelete, onConfirmDelete, onRefresh }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-6 w-6 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-3 text-sm text-gray-600">Loading agents…</span>
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={onNew}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + New Agent
        </button>
      </div>

      {deleteError && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {deleteError}
        </div>
      )}

      <div className="space-y-4">
        {agents.map(agent =>
          deleteTarget === agent.id ? (
            <div key={agent.id} className="bg-red-50 border border-red-200 p-6 rounded-lg flex items-center justify-between">
              <p className="text-sm text-red-700 font-medium">Delete {agent.name}?</p>
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
          ) : (
            <div key={agent.id} className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition flex gap-6">
              {agent.photoUrl && (
                <div className="w-24 h-24 flex-shrink-0">
                  <img src={agent.photoUrl} alt={agent.name} className="w-full h-full object-cover rounded" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{agent.name}</p>
                    {agent.title && <p className="text-sm text-gray-600">{agent.title}</p>}
                  </div>
                  {agent.isPrimary && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">Primary</span>
                  )}
                </div>
                {agent.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{agent.bio}</p>}
                <div className="flex gap-4 mt-3 text-sm text-gray-600">
                  {agent.yearsExperience && <span>{agent.yearsExperience}+ years</span>}
                  {agent.propertiesSold && <span>{agent.propertiesSold} sold</span>}
                  {agent.activeMarkets && <span>{agent.activeMarkets}</span>}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => onEdit(agent)}
                  className="rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(agent.id)}
                  className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {agents.length === 0 && !deleteError && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No agents yet — click <strong>+ New Agent</strong> to add one.</p>
        </div>
      )}
    </div>
  );
}

function MarketUpdatesView({ updates, loading, fetchError, deleteTarget, deleting, deleteError, onNew, onEdit, onDelete, onCancelDelete, onConfirmDelete, onRefresh }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-6 w-6 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-3 text-sm text-gray-600">Loading market updates…</span>
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={onNew}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + New Market Update
        </button>
      </div>

      {deleteError && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {deleteError}
        </div>
      )}

      <div className="space-y-4">
        {updates.map(update =>
          deleteTarget === update.id ? (
            <div key={update.id} className="bg-red-50 border border-red-200 p-6 rounded-lg flex items-center justify-between">
              <p className="text-sm text-red-700 font-medium">Delete "{update.title}"?</p>
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
          ) : (
            <div key={update.id} className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{update.sourceName} · {new Date(update.date).toLocaleDateString()}</p>
                  <h3 className="font-semibold text-gray-900 mb-2">{update.title}</h3>
                </div>
              </div>
              {update.previewText && <p className="text-sm text-gray-600 mb-4">{update.previewText}</p>}
              {update.sourceUrl && <p className="text-xs text-indigo-600 mb-4"><a href={update.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">View Source →</a></p>}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => onEdit(update)}
                  className="rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(update.id)}
                  className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {updates.length === 0 && !deleteError && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No market updates yet — click <strong>+ New Market Update</strong> to add one.</p>
        </div>
      )}
    </div>
  );
}
