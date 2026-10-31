import Link from "next/link";

export const metadata = {
  title: "About — FreelanceHub",
  description:
    "FreelanceHub connects skilled freelancers with forward-thinking clients. No noise, no middlemen — just the right match for the right project.",
};

const NAV_LINKS = ["About", "How It Works"];

const PILLARS = [
  {
    id: "verified",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    label: "01",
    title: "Verified Professionals",
    body: "Every freelancer is thoroughly vetted — background-checked, skill-assessed, and reviewed — so you can hire with full confidence.",
    highlight: "background-checked, skill-assessed, and reviewed",
  },
  {
    id: "diverse",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    label: "02",
    title: "Diverse Projects",
    body: "From web development to brand strategy, browse thousands of categories and find opportunities matched to your exact skillset.",
    highlight: "thousands of categories",
  },
  {
    id: "payments",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
        <path d="M14 15h4" />
      </svg>
    ),
    label: "03",
    title: "Secure Payments",
    body: "Milestone-based escrow ensures freelancers get paid on time and clients receive exactly what they were promised.",
    highlight: "Milestone-based escrow",
  },
];



export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --teal:       #0D6B5E;
          --teal-light: #E6F2F0;
          --teal-mid:   #1A8A7A;
          --cream:      #F8F7F4;
          --stone:      #EAE8E3;
          --ink:        #141414;
          --muted:      #6B6B68;
          --border:     rgba(13,107,94,.14);
          --serif:      'Cormorant Garamond', Georgia, serif;
          --sans:       'DM Sans', system-ui, sans-serif;
          --radius-sm:  6px;
          --radius-md:  12px;
          --radius-lg:  20px;
          --transition: 260ms cubic-bezier(.4,0,.2,1);
        }

        body { font-family: var(--sans); background: var(--cream); color: var(--ink); }

        /* ── NAV ── */
        .nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5%; height: 68px;
          background: rgba(248,247,244,.88);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--sans); font-weight: 500; font-size: 17px;
          color: var(--ink); text-decoration: none;
        }
        .nav-logo-icon {
          width: 36px; height: 36px; border-radius: var(--radius-sm);
          background: var(--teal); display: flex; align-items: center; justify-content: center;
        }
        .nav-links { display: flex; align-items: center; gap: 36px; }
        .nav-links a {
          font-size: 14px; color: var(--muted); text-decoration: none;
          transition: color var(--transition);
        }
        .nav-links a:hover, .nav-links a[aria-current] { color: var(--ink); }
        .nav-divider { width: 1px; height: 20px; background: var(--border); }
        .nav-actions { display: flex; align-items: center; gap: 12px; }
        .btn-ghost {
          font-size: 14px; color: var(--ink); background: none;
          border: none; cursor: pointer; padding: 6px 4px;
          text-decoration: none; transition: color var(--transition);
        }
        .btn-primary {
          font-size: 14px; font-weight: 500;
          background: var(--teal); color: #fff; border: none;
          padding: 10px 22px; border-radius: 100px; cursor: pointer;
          text-decoration: none; transition: background var(--transition), transform var(--transition);
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-primary:hover { background: var(--teal-mid); transform: translateY(-1px); }

        /* ── HERO ── */
        .hero {
          padding: 100px 5% 80px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
          max-width: 1200px; margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--teal-light); color: var(--teal);
          font-size: 12px; font-weight: 500; letter-spacing: .04em;
          padding: 6px 14px; border-radius: 100px; margin-bottom: 28px;
          border: 1px solid rgba(13,107,94,.2);
        }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); }
        .hero h1 {
          font-family: var(--serif); font-size: clamp(46px, 5vw, 68px);
          font-weight: 400; line-height: 1.08; letter-spacing: -.02em; margin-bottom: 24px;
        }
        .hero h1 em { font-style: italic; color: var(--teal); }
        .hero-sub {
          font-size: 16px; line-height: 1.75; color: var(--muted);
          max-width: 420px; margin-bottom: 40px;
        }
        .hero-cta { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
        .btn-outline {
          font-size: 14px; color: var(--ink); background: none;
          border: 1px solid rgba(20,20,20,.22); padding: 10px 22px;
          border-radius: 100px; cursor: pointer; text-decoration: none;
          transition: border-color var(--transition), background var(--transition);
        }
        .btn-outline:hover { border-color: var(--teal); background: var(--teal-light); }
        .hero-visual {
          position: relative; border-radius: var(--radius-lg);
          overflow: hidden; aspect-ratio: 4/3;
          background: linear-gradient(135deg, var(--stone) 0%, var(--teal-light) 100%);
          display: flex; align-items: center; justify-content: center;
        }
        .hero-visual-inner {
          width: 80%; aspect-ratio: 1;
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .hero-card {
          background: #fff; border-radius: var(--radius-md);
          padding: 18px; border: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 8px;
        }
        .hero-card-icon {
          width: 36px; height: 36px; border-radius: var(--radius-sm);
          background: var(--teal-light); color: var(--teal);
          display: flex; align-items: center; justify-content: center;
        }
        .hero-card-title { font-size: 13px; font-weight: 500; }
        .hero-card-bar {
          height: 4px; border-radius: 2px; background: var(--stone); overflow: hidden;
        }
        .hero-card-fill { height: 100%; background: var(--teal); border-radius: 2px; }
        .hero-card-meta { font-size: 11px; color: var(--muted); }



        /* ── MISSION ── */
        .mission { padding: 100px 5%; max-width: 1200px; margin: 0 auto; }
        .section-label {
          font-size: 11px; font-weight: 500; letter-spacing: .1em;
          text-transform: uppercase; color: var(--teal); margin-bottom: 20px;
        }
        .mission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .mission-headline {
          font-family: var(--serif); font-size: clamp(36px, 4vw, 52px);
          font-weight: 400; line-height: 1.12; letter-spacing: -.02em;
        }
        .mission-headline em { font-style: italic; color: var(--teal); }
        .mission-body { font-size: 15px; line-height: 1.85; color: var(--muted); }
        .mission-body p + p { margin-top: 1em; }
        .mission-quote {
          margin-top: 32px; padding: 24px 28px;
          border-left: 3px solid var(--teal);
          background: var(--teal-light); border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }
        .mission-quote p {
          font-family: var(--serif); font-style: italic;
          font-size: 18px; line-height: 1.5; color: var(--teal);
        }

        /* ── PILLARS ── */
        .pillars { padding: 0 5% 100px; max-width: 1200px; margin: 0 auto; }
        .pillars-header { text-align: center; margin-bottom: 64px; }
        .pillars-headline {
          font-family: var(--serif); font-size: clamp(34px, 3.5vw, 48px);
          font-weight: 400; line-height: 1.14; letter-spacing: -.02em;
        }
        .pillars-headline em { font-style: italic; color: var(--teal); }
        .pillars-sub { font-size: 15px; color: var(--muted); max-width: 420px; margin: 16px auto 0; line-height: 1.7; }
        .pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .pillar-card {
          background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg);
          padding: 40px 32px; position: relative; overflow: hidden;
          transition: transform var(--transition), box-shadow var(--transition);
        }
        .pillar-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(13,107,94,.08); }
        .pillar-card::before {
          content: attr(data-label); position: absolute; top: 24px; right: 28px;
          font-family: var(--serif); font-size: 13px; color: var(--stone);
          font-weight: 600;
        }
        .pillar-icon {
          width: 56px; height: 56px; border-radius: var(--radius-md);
          background: var(--teal-light); color: var(--teal);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
        }
        .pillar-title {
          font-family: var(--serif); font-size: 26px; font-weight: 400;
          line-height: 1.2; margin-bottom: 14px; letter-spacing: -.01em;
        }
        .pillar-body { font-size: 14px; line-height: 1.8; color: var(--muted); }



        /* ── CTA ── */
        .cta-section {
          margin: 0 5% 80px; border-radius: var(--radius-lg);
          background: var(--teal); padding: 80px 10%;
          display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
        }
        .cta-headline {
          font-family: var(--serif); font-size: clamp(34px, 3vw, 44px);
          font-weight: 400; color: #fff; line-height: 1.14; letter-spacing: -.02em;
        }
        .cta-headline em { font-style: italic; opacity: .75; }
        .cta-body { font-size: 15px; color: rgba(255,255,255,.65); line-height: 1.7; margin-bottom: 32px; }
        .btn-white {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: var(--teal); font-size: 14px; font-weight: 500;
          padding: 12px 28px; border-radius: 100px; text-decoration: none;
          transition: transform var(--transition), opacity var(--transition);
        }
        .btn-white:hover { transform: translateY(-2px); opacity: .92; }
        .btn-outline-white {
          display: inline-flex; align-items: center; gap: 8px;
          background: none; color: rgba(255,255,255,.8); font-size: 14px;
          border: 1px solid rgba(255,255,255,.3); padding: 12px 28px;
          border-radius: 100px; text-decoration: none;
          transition: border-color var(--transition), color var(--transition);
        }
        .btn-outline-white:hover { border-color: #fff; color: #fff; }

        /* ── FOOTER ── */
        .footer {
          border-top: 1px solid var(--border); padding: 40px 5%;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-logo { font-size: 15px; font-weight: 500; color: var(--ink); }
        .footer-links { display: flex; gap: 28px; }
        .footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; }
        .footer-links a:hover { color: var(--teal); }
        .footer-copy { font-size: 12px; color: var(--muted); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .hero, .mission-grid, .cta-section { grid-template-columns: 1fr; gap: 40px; }
          .pillars-grid { grid-template-columns: 1fr; }
          .hero-visual { display: none; }
          .footer { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </span>
          FreelanceHub
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <Link key={l} href={`/${l.toLowerCase().replace(/ /g, "-")}`} aria-current={l === "About" ? "page" : undefined}>
              {l}
            </Link>
          ))}
          <span className="nav-divider" aria-hidden="true" />
        </div>

        <div className="nav-actions">
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/get-started" className="btn-primary">
            Get started
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </nav>

      <main>
        {/* ── HERO ── */}
        <section className="hero" aria-labelledby="about-heading">
          <div>
            <div className="hero-badge" role="note">
              <span className="hero-badge-dot" aria-hidden="true" />
              Now in open beta · Free to join
            </div>
            <h1 id="about-heading">
              Built for the way<br />
              <em>real work happens</em>
            </h1>
            <p className="hero-sub">
              FreelanceHub was created because we got tired of platforms that talk about trust while taking 20% cuts and hiding client identities. We built the thing we wished existed.
            </p>
            <div className="hero-cta">
              <Link href="/register" className="btn-primary">
                Start for free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/how-it-works" className="btn-outline">See how it works</Link>
            </div>
          </div>

          <div className="hero-visual" role="img" aria-label="FreelanceHub platform preview showing active freelancer cards">
            <div className="hero-visual-inner">
              {[
                { title: "UI Design", fill: "82%", meta: "Matched · 3 open briefs" },
                { title: "Copywriting", fill: "67%", meta: "Matched · 7 open briefs" },
                { title: "Web Dev", fill: "94%", meta: "Matched · 12 open briefs" },
                { title: "Strategy", fill: "55%", meta: "Matched · 2 open briefs" },
              ].map((c) => (
                <div className="hero-card" key={c.title}>
                  <div className="hero-card-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
                    </svg>
                  </div>
                  <span className="hero-card-title">{c.title}</span>
                  <div className="hero-card-bar">
                    <div className="hero-card-fill" style={{ width: c.fill }} />
                  </div>
                  <span className="hero-card-meta">{c.meta}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

{/* ── MISSION ── */}
        <section className="mission" aria-labelledby="mission-heading">
          <p className="section-label">Our Mission</p>
          <div className="mission-grid">
            <h2 id="mission-heading" className="mission-headline">
              Fixing the trust<br />
              <em>problem in freelancing</em>
            </h2>
            <div>
              <div className="mission-body">
                <p>
                  The freelance economy is broken. Clients can&apos;t tell who&apos;s qualified. Freelancers can&apos;t trust they&apos;ll get paid. Platforms profit from the chaos.
                </p>
                <p>
                  FreelancerHub is different. We built rigorous vetting from day one, escrow payments that actually protect both sides, and a matching algorithm that respects your time. No race to the bottom on pricing. No pay-to-win visibility.
                </p>
                <p>
                  Our open beta launched in 2024. We&apos;re growing deliberately — because quality always wins over volume.
                </p>
              </div>
              <blockquote className="mission-quote">
                <p>&ldquo;No noise, no middlemen — just the right match for the right project.&rdquo;</p>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section className="pillars" aria-labelledby="pillars-heading">
          <header className="pillars-header">
            <p className="section-label">Why FreelanceHub</p>
            <h2 id="pillars-heading" className="pillars-headline">
              Built for the way<br /><em>great work happens</em>
            </h2>
            <p className="pillars-sub">Three foundations that make every engagement on FreelanceHub worth your time.</p>
          </header>

          <div className="pillars-grid">
            {PILLARS.map((p) => (
              <article className="pillar-card" key={p.id} data-label={p.label}>
                <div className="pillar-icon" aria-hidden="true">{p.icon}</div>
                <h3 className="pillar-title">{p.title}</h3>
                <p className="pillar-body">{p.body}</p>
              </article>
            ))}
          </div>
        </section>

{/* ── CTA ── */}
        <section className="cta-section" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="cta-headline">
            Ready to find your<br /><em>next great project?</em>
          </h2>
          <div>
            <p className="cta-body">
              Join thousands of freelancers and forward-thinking clients who&apos;ve already made the switch to a platform built on actual trust.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link href="/register" className="btn-white">
                Start for free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/how-it-works" className="btn-outline-white">See how it works</Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer" role="contentinfo">
        <span className="footer-logo">FreelanceHub</span>
        <span className="footer-copy">© {new Date().getFullYear()} FreelanceHub Inc.</span>
      </footer>
    </>
  );
}
