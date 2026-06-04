import { useEffect, useState, useRef } from 'react';
import { API_BASE } from '../api';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [marketUpdates, setMarketUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [testimonialsIndex, setTestimonialsIndex] = useState(0);
  const [marketUpdatesIndex, setMarketUpdatesIndex] = useState(0);
  const testimonialsRef = useRef(null);
  const marketUpdatesRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [listingsRes, testimonialsRes, updatesRes] = await Promise.all([
          fetch(`${API_BASE}/api/listings`),
          fetch(`${API_BASE}/api/testimonials`),
          fetch(`${API_BASE}/api/market-updates`),
        ]);

        if (listingsRes.ok) {
          const data = await listingsRes.json();
          setListings(data);
        }
        if (testimonialsRes.ok) {
          const data = await testimonialsRes.json();
          setTestimonials(data);
        }
        if (updatesRes.ok) {
          const data = await updatesRes.json();
          setMarketUpdates(data);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    const formData = new FormData(e.target);

    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          message: formData.get('message'),
        }),
      });

      if (res.ok) {
        setContactSubmitted(true);
        e.target.reset();
        setTimeout(() => setContactSubmitted(false), 5000);
      }
    } catch (err) {
      console.error('Failed to submit contact form:', err);
    } finally {
      setContactLoading(false);
    }
  };

  const handleScroll = (ref, setIndex, itemCount) => {
    if (ref.current) {
      const scrollLeft = ref.current.scrollLeft;
      const cardWidth = ref.current.offsetWidth / 3; // Approximate card width on desktop
      const newIndex = Math.round(scrollLeft / (cardWidth + 32)); // 32 is gap
      setIndex(Math.max(0, Math.min(newIndex, itemCount - 1)));
    }
  };

  const scroll = (ref, direction, setIndex, itemCount) => {
    if (ref.current) {
      const cardWidth = ref.current.offsetWidth / 3 + 32; // 3 cards + gap
      ref.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
      setTimeout(() => handleScroll(ref, setIndex, itemCount), 300);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif" style={{ color: '#c9a96e' }}>Angela Slawinski</h1>
            <p className="text-xs tracking-widest text-slate-400 uppercase font-light">Texas Realtor</p>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#listings" style={{ color: '#c9a96e' }} className="hover:opacity-80 transition text-sm font-light">Listings</a>
            <a href="#about" style={{ color: '#c9a96e' }} className="hover:opacity-80 transition text-sm font-light">About</a>
            <a href="#contact" style={{ color: '#c9a96e' }} className="hover:opacity-80 transition text-sm font-light">Contact</a>
            <a href="tel:9726327710" style={{ backgroundColor: '#c9a96e' }} className="hover:opacity-80 text-slate-950 px-6 py-2 rounded font-semibold transition text-sm">
              972.632.7710
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 py-20 overflow-hidden" style={{ backgroundColor: '#111c33' }}>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <p className="text-xs tracking-widest uppercase mb-8 font-light" style={{ color: '#c9a96e' }}>DFW Metroplex · Greater Houston</p>

              <h2 className="font-serif text-6xl lg:text-7xl leading-tight mb-8 text-slate-50">
                Your Home.
                <br />
                Your Story.
                <br />
                <span style={{ color: '#c9a96e' }}>Your Realtor.</span>
              </h2>

              <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-xl font-light">
                Angela Slawinski brings compassionate, expert guidance to DFW & Houston families — helping you find not just a house, but a home.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a href="#listings" style={{ backgroundColor: '#c9a96e' }} className="hover:opacity-80 text-slate-950 px-8 py-3 rounded font-semibold transition inline-block text-center">
                  VIEW LISTINGS
                </a>
                <a href="#contact" style={{ borderColor: '#c9a96e', color: '#c9a96e' }} className="border hover:opacity-80 px-8 py-3 rounded font-semibold transition inline-block text-center">
                  GET IN TOUCH
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-800">
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#c9a96e' }}>15+</p>
                  <p className="text-xs tracking-widest text-slate-400 mt-3 font-light">YEARS EXPERIENCE</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#c9a96e' }}>2</p>
                  <p className="text-xs tracking-widest text-slate-400 mt-3 font-light">ACTIVE MARKETS</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#c9a96e' }}>100+</p>
                  <p className="text-xs tracking-widest text-slate-400 mt-3 font-light">HOMES SOLD</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section id="listings" className="py-32 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>Our Selection</p>
            <h2 className="font-serif text-5xl text-slate-50 mb-6">Featured Properties</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-amber-500 to-transparent"></div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-slate-400">Loading listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400">No listings available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>About</p>
            <h2 className="font-serif text-5xl text-slate-50 mb-8">Meet Angela</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed font-light">
              With 15+ years of experience in real estate, Angela Slawinski has established herself as a trusted advisor to hundreds of families across the DFW and Houston markets. Her approach combines market expertise with genuine care for every client.
            </p>
            <p className="text-slate-400 text-lg leading-relaxed font-light">
              Whether you're buying, selling, or investing, Angela's personalized service and deep knowledge of the market ensure the best outcomes for you and your family.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-amber-700">•</span>
                <span className="text-slate-300 font-light">Licensed Texas Real Estate Agent</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-700">•</span>
                <span className="text-slate-300 font-light">15+ Years Industry Experience</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-700">•</span>
                <span className="text-slate-300 font-light">100+ Properties Successfully Sold</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <img src="/angela-portrait.jpg" alt="Angela Slawinski" className="w-full" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>Testimonials</p>
              <h2 className="font-serif text-5xl text-slate-50">What Clients Say</h2>
            </div>
            {testimonials.length > 1 && (
              <div className="flex gap-3">
                <button
                  onClick={() => scroll(testimonialsRef, 'left', setTestimonialsIndex, testimonials.length)}
                  className="p-2 rounded-full border border-slate-600 text-slate-400 hover:text-slate-100 hover:border-slate-400 transition"
                  aria-label="Previous testimonials"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scroll(testimonialsRef, 'right', setTestimonialsIndex, testimonials.length)}
                  className="p-2 rounded-full border border-slate-600 text-slate-400 hover:text-slate-100 hover:border-slate-400 transition"
                  aria-label="Next testimonials"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {testimonials.length > 0 ? (
            <>
              <div
                ref={testimonialsRef}
                className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth pr-6"
                style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', paddingRight: '1.5rem' }}
                onScroll={() => handleScroll(testimonialsRef, setTestimonialsIndex, testimonials.length)}
              >
                {testimonials.map(testimonial => (
                  <div
                    key={testimonial.id}
                    className="flex-shrink-0 w-full md:w-1/3 bg-slate-800 border border-slate-700 p-8 rounded-lg snap-center"
                  >
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-amber-700 text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-slate-300 mb-8 leading-relaxed font-light italic">
                      "{testimonial.text}"
                    </p>
                    <p className="font-semibold text-slate-100">{testimonial.name}</p>
                    {testimonial.contactType && (
                      <p className="text-sm text-slate-500 mt-1 font-light">{testimonial.contactType}</p>
                    )}
                  </div>
                ))}
              </div>
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (testimonialsRef.current) {
                          const cardWidth = testimonialsRef.current.offsetWidth / 3 + 32;
                          testimonialsRef.current.scrollTo({
                            left: index * cardWidth,
                            behavior: 'smooth',
                          });
                          setTestimonialsIndex(index);
                        }
                      }}
                      className={`w-2 h-2 rounded-full transition ${
                        Math.abs(index - testimonialsIndex) < 0.5 ? 'bg-amber-600' : 'bg-slate-600'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">No testimonials yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Market Updates Section */}
      <section className="py-32 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>Stay Informed</p>
              <h2 className="font-serif text-5xl text-slate-50">Market Updates</h2>
            </div>
            {marketUpdates.length > 1 && (
              <div className="flex gap-3">
                <button
                  onClick={() => scroll(marketUpdatesRef, 'left', setMarketUpdatesIndex, marketUpdates.length)}
                  className="p-2 rounded-full border border-slate-600 text-slate-400 hover:text-slate-100 hover:border-slate-400 transition"
                  aria-label="Previous updates"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scroll(marketUpdatesRef, 'right', setMarketUpdatesIndex, marketUpdates.length)}
                  className="p-2 rounded-full border border-slate-600 text-slate-400 hover:text-slate-100 hover:border-slate-400 transition"
                  aria-label="Next updates"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {marketUpdates.length > 0 ? (
            <>
              <div
                ref={marketUpdatesRef}
                className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth pr-6"
                style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', paddingRight: '1.5rem' }}
                onScroll={() => handleScroll(marketUpdatesRef, setMarketUpdatesIndex, marketUpdates.length)}
              >
                {marketUpdates.map(update => (
                  <div
                    key={update.id}
                    className="flex-shrink-0 w-full md:w-1/3 bg-slate-800 border border-slate-700 p-8 rounded-lg hover:border-amber-600 transition snap-center"
                  >
                    <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>
                      {update.sourceName}{update.date ? ` · ${new Date(update.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}` : ''}
                    </p>
                    <h3 className="font-serif text-2xl text-slate-50 mb-4">{update.title}</h3>
                    {update.previewText && (
                      <p className="text-slate-400 text-sm mb-6 leading-relaxed font-light">
                        {update.previewText}
                      </p>
                    )}
                    {update.sourceUrl && (
                      <a href={update.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#c9a96e' }} className="text-sm font-semibold hover:opacity-80 transition">
                        Read More →
                      </a>
                    )}
                  </div>
                ))}
              </div>
              {marketUpdates.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {marketUpdates.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (marketUpdatesRef.current) {
                          const cardWidth = marketUpdatesRef.current.offsetWidth / 3 + 32;
                          marketUpdatesRef.current.scrollTo({
                            left: index * cardWidth,
                            behavior: 'smooth',
                          });
                          setMarketUpdatesIndex(index);
                        }
                      }}
                      className={`w-2 h-2 rounded-full transition ${
                        Math.abs(index - marketUpdatesIndex) < 0.5 ? 'bg-amber-600' : 'bg-slate-600'
                      }`}
                      aria-label={`Go to update ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">No market updates available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>Let's Connect</p>
          <h2 className="font-serif text-5xl text-slate-50 mb-6">Get in Touch</h2>
          <p className="text-slate-400 text-lg mb-12 font-light">
            Have questions about a property or ready to start your real estate journey? Reach out to Angela today. She's available to discuss your needs and answer any questions you may have.
          </p>

          {contactSubmitted && (
            <div className="mb-8 p-4 bg-slate-800 border border-yellow-700 rounded text-amber-50 text-sm font-light">
              ✓ Thank you for reaching out. Angela will be in touch shortly.
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm text-slate-300 mb-3 font-light uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition font-light"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-3 font-light uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition font-light"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3 font-light uppercase tracking-wide">Phone</label>
              <input
                type="tel"
                name="phone"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition font-light"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-3 font-light uppercase tracking-wide">Message</label>
              <textarea
                name="message"
                rows="5"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition resize-none font-light"
                placeholder="Tell us about your real estate needs..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={contactLoading}
              style={{ backgroundColor: '#c9a96e' }}
              className="w-full hover:opacity-80 text-slate-950 font-semibold py-3 rounded transition disabled:opacity-50"
            >
              {contactLoading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-sm font-light">
        <p>&copy; 2026 Angela Slawinski. All rights reserved.</p>
        <p className="mt-4">
          <a href="/admin/login" className="text-slate-400 hover:text-amber-700 transition">Admin Portal</a>
        </p>
      </footer>
    </div>
  );
}
