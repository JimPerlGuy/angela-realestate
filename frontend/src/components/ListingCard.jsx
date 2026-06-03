import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  const primaryPhoto = listing.photos?.find(p => p.isPrimary) || listing.photos?.[0];

  return (
    <Link to={`/listing/${listing.id}`} className="group block">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-600 transition duration-300 h-full flex flex-col">
        {/* Photo */}
        <div className="h-64 bg-slate-800 overflow-hidden relative">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={listing.address}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-serif text-amber-100 mb-3 group-hover:text-amber-300 transition line-clamp-2">
            {listing.address}
          </h3>
          <p className="text-3xl font-bold text-amber-500 mb-6">
            ${listing.price?.toLocaleString()}
          </p>

          <div className="flex gap-6 text-center mt-auto pt-6 border-t border-slate-700">
            <div className="flex-1">
              <p className="text-xl font-bold text-amber-100">{listing.bedrooms}</p>
              <p className="text-xs text-slate-400 mt-1 font-light tracking-wide">BEDS</p>
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-amber-100">{listing.bathrooms}</p>
              <p className="text-xs text-slate-400 mt-1 font-light tracking-wide">BATHS</p>
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-amber-100">{listing.sqft?.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1 font-light tracking-wide">SQFT</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <span className="text-amber-400 font-light text-sm group-hover:text-amber-300 transition">
              Explore Property →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
