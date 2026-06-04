import { useEffect, useState } from 'react';
import { API_BASE } from '../api';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/listings`);
        if (res.ok) {
          const data = await res.json();
          setListings(data);
        }
      } catch (err) {
        console.error('Failed to load listings:', err);
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
      <section className="relative min-h-screen flex items-center px-6 py-20 overflow-hidden" style={{
        backgroundColor: '#111c33',
        backgroundImage: 'url(/hero-illustration.png)',
        backgroundPosition: 'center',
        backgroundSize: 'auto 80%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-950/70 pointer-events-none"></div>

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

            {/* Right - Illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="border border-slate-600 rounded-lg p-3" style={{ backgroundColor: 'rgba(20, 30, 50, 0.5)' }}>
                <img src="/hero-illustration.png" alt="Premium real estate services" className="w-full max-w-xs" style={{ display: 'block' }} />
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
          <div className="h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 flex items-center justify-center">
            <p className="text-slate-500 text-center font-light">Agent Portrait</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>Testimonials</p>
          <h2 className="font-serif text-5xl text-slate-50 mb-20">What Clients Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-700 text-lg">★</span>
                ))}
              </div>
              <p className="text-slate-300 mb-8 leading-relaxed font-light italic">
                "Angela's expertise and compassion made all the difference. She didn't just sell us a house—she helped us find our home. Couldn't recommend her more highly."
              </p>
              <p className="font-semibold text-slate-100">Sarah Martinez</p>
              <p className="text-sm text-slate-500 mt-1 font-light">DFW Homebuyer</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-700 text-lg">★</span>
                ))}
              </div>
              <p className="text-slate-300 mb-8 leading-relaxed font-light italic">
                "Professional, responsive, and genuinely invested in getting us the best deal. Angela's market knowledge is unmatched. A true pleasure to work with."
              </p>
              <p className="font-semibold text-slate-100">James Chen</p>
              <p className="text-sm text-slate-500 mt-1 font-light">Houston Seller</p>
            </div>
          </div>
        </div>
      </section>

      {/* Market Updates Section */}
      <section className="py-32 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>Stay Informed</p>
          <h2 className="font-serif text-5xl text-slate-50 mb-20">Market Updates</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg hover:border-amber-600 transition">
              <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>Fortune · Aug 13, 2025</p>
              <h3 className="font-serif text-2xl text-slate-50 mb-4">Mortgage Rates Hit Lowest Point of the Year</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed font-light">
                Interest rates have dropped to their lowest level this year — creating a meaningful window for buyers who've been waiting on the sidelines.
              </p>
              <a href="#" style={{ color: '#c9a96e' }} className="text-sm font-semibold hover:opacity-80 transition">
                Read Article →
              </a>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg hover:border-amber-600 transition">
              <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>CNBC · Aug 12, 2025</p>
              <h3 className="font-serif text-2xl text-slate-50 mb-4">Housing Market Video Update</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed font-light">
                CNBC breaks down the latest housing market trends and what falling rates mean for buyers and sellers in markets like DFW and Houston.
              </p>
              <a href="#" style={{ color: '#c9a96e' }} className="text-sm font-semibold hover:opacity-80 transition">
                Watch Video →
              </a>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg hover:border-amber-600 transition">
              <p className="text-xs tracking-widest uppercase font-light mb-4" style={{ color: '#c9a96e' }}>From Angela</p>
              <h3 className="font-serif text-2xl text-slate-50 mb-4">Is Now the Right Time to Buy or Sell?</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed font-light">
                Every situation is different. Reach out and I'll give you an honest, personalized assessment of what the current market means for your specific goals.
              </p>
              <a href="#contact" style={{ color: '#c9a96e' }} className="text-sm font-semibold hover:opacity-80 transition">
                Schedule a Consultation →
              </a>
            </div>
          </div>
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
