'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, Briefcase, TrendingUp, CheckCircle, Menu, X, Shield, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleLogin = () => { window.location.href = '/login'; };
  const handleRegister = () => { window.location.href = '/register'; };

  const NAV_LINKS = [
    { label: 'About', href: '/about' },
    { label: 'How It Works', id: 'how-it-works' },
  ];

  const FEATURES = [
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'Every freelancer is thoroughly vetted — background-checked, skill-assessed, and reviewed — so you can hire with full confidence.',
    },
    {
      icon: Globe,
      title: 'Diverse Projects',
      description: 'From web development to brand strategy, browse thousands of categories and find opportunities matched to your exact skillset.',
    },
    {
      icon: Zap,
      title: 'Secure Payments',
      description: 'Milestone-based escrow ensures freelancers get paid on time and clients receive exactly what they were promised.',
    },
  ];

  const STEPS = [
    {
      step: '01',
      title: 'Build Your Profile',
      description: 'Create a standout professional profile. Add your portfolio, set your rates, and highlight the skills that make you uniquely valuable.',
      image: '/images/walling-XLqiL-rz4V8-unsplash.jpg',
      features: ['Showcase portfolio & work samples', 'Define your skills and expertise', 'Set custom rates and availability'],
      reverse: false,
    },
    {
      step: '02',
      title: 'Find Your Match',
      description: 'Our smart algorithm surfaces projects and clients that align with your skills and goals — no endless scrolling required.',
      image: '/images/diego-ph-fIq0tET6llw-unsplash.jpg',
      features: ['Filter by category, budget, timeline', 'View client ratings and history', 'Submit targeted proposals fast'],
      reverse: true,
    },
    {
      step: '03',
      title: 'Deliver & Get Paid',
      description: 'Collaborate with clarity, deliver exceptional work, and receive secure payments. Every project builds your reputation.',
      image: '/images/jess-bailey-q10VITrVYUM-unsplash.jpg',
      features: ['Built-in progress tracking tools', 'Secure milestone-based payments', 'Build long-term client relationships'],
      reverse: false,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafaf8', fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fh-nav-link {
          background: none; border: none; cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 400;
          color: #52524e; transition: color 0.2s;
          padding: 4px 0;
          position: relative;
        }
        .fh-nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 1px; background: #227C70;
          transition: width 0.25s ease;
        }
        .fh-nav-link:hover { color: #1c1c1a; }
        .fh-nav-link:hover::after { width: 100%; }

        .fh-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #227C70; color: #fff; border: none;
          padding: 12px 28px; border-radius: 100px; cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 500;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: -0.01em;
        }
        .fh-btn-primary:hover {
          background: #1a5f57; transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(34,124,112,0.28);
        }

        .fh-btn-ghost {
          display: inline-flex; align-items: center;
          background: transparent; color: #52524e; border: 1.5px solid #d6d5cf;
          padding: 11px 28px; border-radius: 100px; cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 400;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .fh-btn-ghost:hover {
          border-color: #227C70; color: #227C70;
          transform: translateY(-1px);
        }

        .fh-btn-cta-white {
          display: inline-flex; align-items: center;
          background: #fff; color: #227C70; border: none;
          padding: 14px 32px; border-radius: 100px; cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 600;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .fh-btn-cta-white:hover {
          background: #f0faf8; transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .fh-btn-cta-outline {
          display: inline-flex; align-items: center;
          background: transparent; color: #fff;
          border: 1.5px solid rgba(255,255,255,0.5);
          padding: 13px 32px; border-radius: 100px; cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 400;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .fh-btn-cta-outline:hover {
          border-color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.1);
          transform: translateY(-1px);
        }

        .feature-card {
          background: #fff; border: 1px solid #eae9e3;
          border-radius: 20px; padding: 36px 32px;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .feature-card:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
          transform: translateY(-4px);
        }

        .step-badge {
          display: inline-block;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 72px; font-weight: 300; font-style: italic;
          color: #e4e3dc; line-height: 1;
          margin-bottom: 8px;
          letter-spacing: -3px;
        }

        .mobile-menu-item {
          display: block; width: 100%; text-align: left;
          padding: 12px 16px; background: none; border: none;
          cursor: pointer; font-family: inherit;
          font-size: 16px; color: #52524e;
          border-radius: 10px; transition: background 0.15s, color 0.15s;
        }
        .mobile-menu-item:hover { background: #f0faf8; color: #227C70; }

        .footer-link {
          display: block; padding: 4px 0;
          color: #8a8980; font-size: 14px; text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: #e4e3dc; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
      `}</style>

      {/* ── Navigation ── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        backgroundColor: scrolled ? 'rgba(250,250,248,0.92)' : 'rgba(250,250,248,0.5)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid #eae9e3' : '1px solid transparent',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: '#227C70', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Briefcase style={{ width: 18, height: 18, color: '#fff' }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#1c1c1a', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>
                FreelanceHub
              </span>
            </button>

            {/* Desktop nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="desktop-nav">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  className="fh-nav-link"
                  onClick={() => link.href ? window.location.href = link.href : scrollToSection(link.id)}
                >
                  {link.label}
                </button>
              ))}
              <div style={{ width: 1, height: 20, background: '#ddd' }} />
              <button className="fh-nav-link" onClick={handleLogin}>Log in</button>
              <button className="fh-btn-primary" onClick={handleRegister} style={{ padding: '9px 22px', fontSize: 14 }}>
                Get started <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
              className="hamburger-btn"
            >
              {mobileMenuOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid #eae9e3', backgroundColor: 'rgba(250,250,248,0.98)', padding: '12px 16px 16px' }}>
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                className="mobile-menu-item"
                onClick={() => link.href ? window.location.href = link.href : scrollToSection(link.id)}
              >
                {link.label}
              </button>
            ))}
            <button className="mobile-menu-item" onClick={handleLogin}>Log in</button>
            <div style={{ marginTop: 8 }}>
              <button className="fh-btn-primary" onClick={handleRegister} style={{ width: '100%', justifyContent: 'center' }}>
                Get started free <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 120, paddingBottom: 80, padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            {/* Text */}
            <div className="fade-up">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#e6f4f1', border: '1px solid #b8e0da',
                borderRadius: 100, padding: '6px 16px', marginBottom: 28,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#227C70' }} />
                <span style={{ fontSize: 13, color: '#227C70', fontWeight: 500 }}>Now in open beta · Free to join</span>
              </div>

              <h1 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 'clamp(38px, 5vw, 62px)',
                fontWeight: 300, lineHeight: 1.1,
                color: '#1c1c1a', letterSpacing: '-0.03em',
                marginBottom: 24,
              }}>
                Where great work<br />
                <span style={{ fontStyle: 'italic', color: '#227C70' }}>finds great people</span>
              </h1>

              <p style={{ fontSize: 17, lineHeight: 1.7, color: '#6b6b67', marginBottom: 36, maxWidth: 480 }}>
                FreelanceHub connects skilled freelancers with forward-thinking clients. No noise, no middlemen — just the right match for the right project.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="fh-btn-primary" onClick={handleRegister}>
                  Start for free <ArrowRight style={{ width: 15, height: 15 }} />
                </button>
                <button className="fh-btn-ghost" onClick={() => window.location.href = '/about'}>
                  See how it works
                </button>
              </div>
            </div>

            {/* Hero image */}
            <div className="fade-up delay-2" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: -16,
                background: 'linear-gradient(135deg, #e6f4f1 0%, #f5f9ee 100%)',
                borderRadius: 32, zIndex: 0,
              }} />
              <img
                src="/images/arnel-hasanovic-MNd-Rka1o0Q-unsplash.jpg"
                alt="Professional workspace"
                style={{
                  position: 'relative', zIndex: 1,
                  width: '100%', borderRadius: 24,
                  objectFit: 'cover', aspectRatio: '4/3',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '80px 24px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#227C70', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Why FreelanceHub
            </p>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 300, color: '#1c1c1a',
              letterSpacing: '-0.025em', lineHeight: 1.2,
            }}>
              Built for the way<br />
              <span style={{ fontStyle: 'italic' }}>professionals actually work</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: '#e6f4f1', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                }}>
                  <f.icon style={{ width: 22, height: 22, color: '#227C70' }} />
                </div>
                <h3 style={{
                  fontSize: 18, fontWeight: 600, color: '#1c1c1a',
                  marginBottom: 12, letterSpacing: '-0.02em',
                }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#6b6b67' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: '80px 24px', backgroundColor: '#fafaf8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#227C70', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              The process
            </p>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 300, color: '#1c1c1a',
              letterSpacing: '-0.025em', lineHeight: 1.2,
            }}>
              Three steps to<br />
              <span style={{ fontStyle: 'italic' }}>your next great project</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 96 }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 64,
                  alignItems: 'center',
                  direction: s.reverse ? 'rtl' : 'ltr',
                }}
              >
                {/* Image */}
                <div style={{ direction: 'ltr', position: 'relative' }}>
                  <img
                    src={s.image}
                    alt={s.title}
                    style={{
                      width: '100%', borderRadius: 24,
                      objectFit: 'cover', aspectRatio: '4/3',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
                    }}
                  />
                </div>

                {/* Text */}
                <div style={{ direction: 'ltr' }}>
                  <div className="step-badge">{s.step}</div>
                  <h3 style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 'clamp(24px, 3vw, 36px)',
                    fontWeight: 300, color: '#1c1c1a',
                    letterSpacing: '-0.025em', lineHeight: 1.2,
                    marginBottom: 16,
                  }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 16, lineHeight: 1.75, color: '#6b6b67', marginBottom: 28, maxWidth: 420 }}>
                    {s.description}
                  </p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {s.features.map((feat, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <CheckCircle style={{ width: 18, height: 18, color: '#227C70', flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 15, color: '#52524e' }}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            background: '#1c1c1a',
            borderRadius: 32, padding: '72px 64px',
            display: 'grid', gridTemplateColumns: '1fr auto',
            gap: 48, alignItems: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative circle */}
            <div style={{
              position: 'absolute', right: -80, top: -80,
              width: 320, height: 320, borderRadius: '50%',
              background: 'rgba(34,124,112,0.15)', pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', right: 40, bottom: -100,
              width: 200, height: 200, borderRadius: '50%',
              background: 'rgba(34,124,112,0.08)', pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative' }}>
              <h2 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 300, fontStyle: 'italic',
                color: '#fff', letterSpacing: '-0.025em',
                lineHeight: 1.15, marginBottom: 16,
              }}>
                Ready to do your best work?
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 440 }}>
                Join thousands of professionals already growing their careers and businesses on FreelanceHub.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', minWidth: 220 }}>
              <button className="fh-btn-cta-white" onClick={handleRegister}>
                Join as freelancer
              </button>
              <button className="fh-btn-cta-outline" onClick={handleRegister}>
                Post a project
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: '#141412', padding: '56px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 48, marginBottom: 48,
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: '#227C70', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Briefcase style={{ width: 16, height: 16, color: '#fff' }} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
                  FreelanceHub
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#6b6b67', maxWidth: 240 }}>
                Connecting talent with opportunity — simply, securely, worldwide.
              </p>
            </div>

            {[
              { title: 'Freelancers', links: ['Find Work', 'How It Works', 'Success Stories'] },
              { title: 'Clients', links: ['Post a Project', 'Find Talent', 'Enterprise'] },
              { title: 'Company', links: ['About Us', 'Contact', 'Privacy Policy'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {col.title}
                </h4>
                <ul style={{ listStyle: 'none' }}>
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="footer-link">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #2a2a28', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: '#52524e' }}>© 2025 FreelanceHub. All rights reserved.</p>
            <p style={{ fontSize: 13, color: '#52524e' }}>Made with care for freelancers everywhere.</p>
          </div>
        </div>
      </footer>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
          section > div > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
          }
          div[style*="grid-template-columns: 2fr 1fr 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
          div[style*="grid-template-columns: 1fr auto"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          div[style*="grid-template-columns: 2fr 1fr 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
