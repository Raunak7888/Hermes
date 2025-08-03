import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Shield, Zap, ArrowRight, Menu, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// const navigate = useNavigate();
// onClick={() => navigate('/signup')

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo animate-slide-in">
        <MessageSquare size={28} className="animate-pulse-slow" aria-hidden="true" />
        <h1>ChatApp</h1>
      </div>
      <button 
        className="menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <a href="#features" onClick={() => setIsMenuOpen(false)} className="animate-slide-in" style={{ animationDelay: '100ms' }}>Features</a>
        <a href="#about" onClick={() => setIsMenuOpen(false)} className="animate-slide-in" style={{ animationDelay: '200ms' }}>About</a>
        <a href="#contact" onClick={() => setIsMenuOpen(false)} className="animate-slide-in" style={{ animationDelay: '300ms' }}>Contact</a>
        <button className="login-btn animate-slide-in" style={{ animationDelay: '400ms' }} onClick={() => navigate('/login')}>Log In</button>
      </div>
    </nav>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="hero-section" aria-label="Hero Section">
      <div className="hero-content">
        {/* <div className="badge animate-bounce-in">🚀 New: Group Video Calls</div> */}
        <h1 className="animate-slide-up">
          Connect with anyone, <span className="gradient-text animate-gradient">anywhere</span>
        </h1>
        <p className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          Experience seamless communication with our modern chat platform. Stay connected with friends, family, and colleagues in real-time.
        </p>
        <div className="hero-buttons">
          <button className="get-started-btn animate-bounce-in"  onClick={() => navigate('/signup')} style={{ animationDelay: '400ms' }}>
            Get Started <ArrowRight size={20} className="animate-bounce-x" />
          </button>
          <button className="learn-more-btn animate-bounce-in" style={{ animationDelay: '500ms' }}>
            Learn More <ChevronRight size={20} className="animate-slide-x" />
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat animate-bounce-in" style={{ animationDelay: '600ms' }}>
            <span className="stat-number animate-count">10M+</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat animate-bounce-in" style={{ animationDelay: '700ms' }}>
            <span className="stat-number animate-count">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
          <div className="stat animate-bounce-in" style={{ animationDelay: '800ms' }}>
            <span className="stat-number animate-count">4.9★</span>
            <span className="stat-label">User Rating</span>
          </div>
        </div>
      </div>
      <div className="hero-image animate-float">
        <div className="image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop" 
            alt="Chat Interface Preview"
            loading="lazy"
            className="animate-scale-in"
          />
          {/* <div className="floating-card card-1 animate-float-delayed">
            <MessageSquare size={20} className="animate-pulse-slow" />
            <span>New Message</span>
          </div>
          <div className="floating-card card-2 animate-float-delayed-2">
            <Users size={20} className="animate-pulse-slow" />
            <span>5 Online</span>
          </div> */}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="features-section" id="features" aria-label="Features">
      <h2 className="animate-slide-up">
        Why Choose <span className="gradient-text animate-gradient">ChatApp</span>?
      </h2>
      <div className="features-grid">
        <div className="feature-card animate-scale-in" style={{ animationDelay: '200ms' }}>
          <div className="icon-wrapper animate-spin-slow">
            <Zap size={32} aria-hidden="true" />
          </div>
          <h3>Lightning Fast</h3>
          <p>Real-time messaging with instant delivery and response.</p>
          <a href="#learn-more" className="feature-link">
            Learn more <ChevronRight size={16} className="animate-slide-x" />
          </a>
        </div>
        <div className="feature-card animate-scale-in" style={{ animationDelay: '400ms' }}>
          <div className="icon-wrapper animate-spin-slow">
            <Shield size={32} aria-hidden="true" />
          </div>
          <h3>Secure</h3>
          <p>End-to-end encryption for all your conversations.</p>
          <a href="#learn-more" className="feature-link">
            Learn more <ChevronRight size={16} className="animate-slide-x" />
          </a>
        </div>
        <div className="feature-card animate-scale-in" style={{ animationDelay: '600ms' }}>
          <div className="icon-wrapper animate-spin-slow">
            <Users size={32} aria-hidden="true" />
          </div>
          <h3>Group Chat</h3>
          <p>Create and manage multiple group conversations with ease.</p>
          <a href="#learn-more" className="feature-link">
            Learn more <ChevronRight size={16} className="animate-slide-x" />
          </a>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="cta-section animate-gradient-bg" aria-label="Call to Action">
      <div className="cta-content">
        <span className="cta-badge animate-pulse">Limited Time Offer</span>
        <h2 className="animate-slide-up">Ready to get started?</h2>
        <p className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          Join millions of users already enjoying ChatApp.
        </p>
        <button className="cta-btn animate-bounce-in" onClick={() => navigate('/signup')} style={{ animationDelay: '400ms' }} >
          Create Free Account
          <ArrowRight size={20} className="animate-slide-x" />
        </button>
        <div className="cta-features">
          <div className="cta-feature animate-slide-up" style={{ animationDelay: '600ms' }}>
            <Shield size={16} className="animate-pulse-slow" />
            <span>No credit card required</span>
          </div>
          <div className="cta-feature animate-slide-up" style={{ animationDelay: '800ms' }}>
            <Zap size={16} className="animate-pulse-slow" />
            <span>Set up in minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-main animate-fade-in">
          <div className="footer-logo">
            <MessageSquare size={24} className="animate-pulse-slow" aria-hidden="true" />
            <span>ChatApp</span>
          </div>
          <p className="footer-description">
            The next generation communication platform.
          </p>
        </div>
        <div className="footer-links">
          <div className="footer-column animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#security">Security</a>
          </div>
          <div className="footer-column animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#careers">Careers</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-column animate-slide-up" style={{ animationDelay: '600ms' }}>
            <h4>Resources</h4>
            <a href="#blog">Blog</a>
            <a href="#help">Help Center</a>
            <a href="#status">Status</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom animate-fade-in">
        <p>© 2024 ChatApp. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <div className="landing-container">
      <Navigation />
      <main className="landing-main">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default Home;