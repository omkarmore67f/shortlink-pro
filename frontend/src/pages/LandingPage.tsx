import { Link } from 'react-router-dom';
import { Link as LinkIcon, BarChart3, QrCode, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

/**
 * LandingPage
 *
 * Public marketing page shown to unauthenticated visitors at "/".
 * Designed to look like a real SaaS product homepage (hero, features,
 * CTA) rather than a bare login form - this is what differentiates
 * the project visually in a portfolio.
 */
const LandingPage = () => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning-Fast Redirects',
      description: 'Optimized database indexing ensures your shortened links resolve instantly, every time.',
    },
    {
      icon: BarChart3,
      title: 'Powerful Analytics',
      description: 'Track total clicks, daily trends, device breakdowns, and top-performing links in real time.',
    },
    {
      icon: QrCode,
      title: 'QR Code Generation',
      description: 'Every link comes with a downloadable QR code - perfect for print, packaging, and events.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure by Design',
      description: 'JWT authentication, rate limiting, input sanitization, and industry-standard security headers.',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative gradient blobs for visual depth */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="glass border-x-0 border-t-0 rounded-none sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600/90 backdrop-blur-sm rounded-lg p-1.5 shadow-sm">
              <LinkIcon className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg text-gray-900">ShortLink Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
        <span className="inline-flex items-center rounded-full glass text-primary-700 text-xs font-medium px-3 py-1 mb-6">
          The link management platform for modern teams
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
          Shorten links.
          <br />
          <span className="text-primary-600">Track everything.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
          Create branded short links, generate QR codes, and gain deep insights into your audience
          with a real-time analytics dashboard built for growth.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/register">
            <Button size="lg">
              Start for free
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Log in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="bg-primary-50/80 backdrop-blur-sm text-primary-600 rounded-lg p-2.5 w-fit mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        <div className="glass-strong rounded-3xl px-8 py-14 text-center bg-gradient-to-br from-primary-600/90 to-fuchsia-600/80 text-white border-white/20">
          <h2 className="text-3xl font-bold text-white">Ready to take control of your links?</h2>
          <p className="mt-3 text-primary-100">
            Join ShortLink Pro today and start tracking every click.
          </p>
          <Link to="/register" className="inline-block mt-6">
            <Button variant="secondary" size="lg">
              Create your free account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="glass border-x-0 border-b-0 rounded-none py-6 text-center text-sm text-gray-400 relative z-10">
        &copy; {new Date().getFullYear()} ShortLink Pro. Built with the MERN stack.
      </footer>
    </div>
  );
};

export default LandingPage;
