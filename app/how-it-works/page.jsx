import Link from "next/link";

export const metadata = {
  title: "How It Works — FreelanceHub",
  description:
    "From account creation to getting paid — every step of how FreelanceHub connects clients and freelancers with trust built in.",
};

/* ─────────────────────────── DATA ─────────────────────────── */

const PHASES = [
  {
    id: "account",
    phase: "Phase 01",
    title: "Create Your Account",
    subtitle: "Choose your role — one platform, two paths.",
    audience: "both",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    steps: [
      {
        who: "client",
        label: "Sign up as a Client",
        body: "Post projects, browse verified talent, and manage your entire hiring pipeline from one dashboard.",
      },
      {
        who: "freelancer",
        label: "Sign up as a Freelancer",
        body: "Build your profile, showcase your skills, and gain access to quality projects matched to your expertise.",
      },
    ],
    note: null,
  },
  {
    id: "apply",
    phase: "Phase 02",
    title: "Apply & Get Shortlisted",
    subtitle: "Freelancers pitch. Clients shortlist the best fits.",
    audience: "both",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    steps: [
      {
        who: "freelancer",
        label: "Submit a Proposal",
        body: "Write a tailored proposal for the job — your rate, timeline, and approach. No template spam; clients see real intent.",
      },
      {
        who: "client",
        label: "Review & Shortlist",
        body: "Browse proposals, compare profiles, and shortlist the candidates you want to move forward with.",
      },
    ],
    note: null,
  },
  {
    id: "meeting",
    phase: "Phase 03",
    title: "Schedule a Meeting",
    subtitle: "Before any commitment — talk first.",
    audience: "both",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    steps: [
      {
        who: "client",
        label: "Invite Shortlisted Freelancers",
        body: "Send a meeting invite to shortlisted candidates directly through the platform to align on scope and expectations.",
      },
      {
        who: "freelancer",
        label: "Attend the Discovery Call",
        body: "Join the call, ask the right questions, confirm the brief, and decide if this project is the right fit for you.",
      },
    ],
    note: null,
  },
  {
    id: "offer",
    phase: "Phase 04",
    title: "Offer Letter",
    subtitle: "Post-meeting, the client formalises the engagement.",
    audience: "client",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    steps: [
      {
        who: "client",
        label: "Send an Offer Letter",
        body: "If the meeting goes well, the client sends a formal offer letter outlining project scope, total budget, and milestones.",
      },
      {
        who: "freelancer",
        label: "Accept or Reject the Offer",
        body: "The freelancer reviews the offer in full. They can accept if terms align or reject if they don't — no pressure, no hidden obligations.",
      },
    ],
    note: "If the freelancer rejects the offer, the client is notified and can approach the next shortlisted candidate.",
  },
  {
    id: "escrow",
    phase: "Phase 05",
    title: "Escrow Payment & Contract",
    subtitle: "Money goes in before work begins — protecting both sides.",
    audience: "client",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
        <path d="M14 15h4" />
      </svg>
    ),
    steps: [
      {
        who: "client",
        label: "Fund the Escrow",
        body: "Upon offer acceptance, the client deposits the total project budget into FreelanceHub's secure escrow. Funds are held — not charged — until work is reviewed.",
      },
      {
        who: "system",
        label: "Contract Auto-Generated",
        body: "Once payment clears, the platform automatically generates a binding contract between the client and freelancer. Both parties receive a signed copy.",
      },
    ],
    note: "Escrow protects the freelancer from non-payment and the client from undelivered work. Neither party can access the funds until admin release.",
  },
  {
    id: "terms",
    phase: "Phase 06",
    title: "Accept Terms & Download Tracker",
    subtitle: "One agreement, one tool — then you're ready to work.",
    audience: "freelancer",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    steps: [
      {
        who: "freelancer",
        label: "Accept Terms & Privacy Policy",
        body: "The freelancer reviews and accepts FreelanceHub's terms of service and privacy policy before accessing the work session.",
      },
      {
        who: "freelancer",
        label: "Download the Desktop Tracker",
        body: "A download button appears immediately after acceptance. Install the lightweight desktop app on macOS or Windows — it's the only way to log billable hours.",
      },
      {
        who: "freelancer",
        label: "Log In With Your Credentials",
        body: "Open the tracker and sign in with the same email and password used on FreelanceHub. No new account needed.",
      },
    ],
    note: null,
  },
  {
    id: "tracker",
    phase: "Phase 07",
    title: "Track Your Work Session",
    subtitle: "Start. Work. The platform records everything transparently.",
    audience: "freelancer",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    steps: [
      {
        who: "freelancer",
        label: "Start the Session",
        body: "Hit Start to begin tracking. The timer runs and the session is linked to your active contract automatically.",
      },
      {
        who: "freelancer",
        label: "Pause or Stop Anytime",
        body: "Need a break? Pause the session — idle time is not counted as billable. Stop the session when your work block ends.",
      },
      {
        who: "system",
        label: "Screenshots & Idle Detection",
        body: "The tracker captures periodic screenshots and measures keyboard/mouse activity. Idle periods are flagged and excluded. All data is encrypted and sent to the backend.",
      },
    ],
    note: "Screenshots are visible to the client and admin — full transparency, no surprises.",
  },
  {
    id: "payment",
    phase: "Phase 08",
    title: "Admin Review & Payout",
    subtitle: "Work reviewed. Payment released. Platform fee deducted.",
    audience: "system",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    steps: [
      {
        who: "system",
        label: "Admin Reviews Logged Work",
        body: "The FreelanceHub admin team reviews the tracked hours, screenshots, and session logs submitted for the contract period.",
      },
      {
        who: "system",
        label: "Escrow Released to Freelancer",
        body: "After approval, funds are released from escrow directly to the freelancer's account — minus the platform fee.",
      },
      {
        who: "system",
        label: "10% Platform Fee Retained",
        body: "FreelanceHub deducts a flat 10% service fee from the total project budget. No hidden charges, no surprise deductions — just one transparent cut.",
      },
    ],
    note: "If the admin flags issues with logged work, both parties are notified and a resolution process begins before funds move.",
  },
];

const WHO_CONFIG = {
  client: { label: "Client", color: "#0D6B5E", bg: "#E6F2F0" },
  freelancer: { label: "Freelancer", color: "#5A3FA0", bg: "#EEE9FC" },
  system: { label: "Platform", color: "#7A5000", bg: "#FEF3DC" },
};

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function HowItWorksPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --teal:        #0D6B5E;
          --teal-light:  #E6F2F0;
          --teal-mid:    #1A8A7A;
          --cream:       #F8F7F4;
          --stone:       #EAE8E3;
          --ink:         #141414;
          --muted:       #6B6B68;
          --border:      rgba(13,107,94,.14);
          --border-hard: rgba(13,107,94,.22);
          --serif:       'Cormorant Garamond', Georgia, serif;
          --sans:        'DM Sans', system-ui, sans-serif;
          --radius-sm:   6px;
          --radius-md:   12px;
          --radius-lg:   20px;
          --radius-xl:   28px;
          --transition:  260ms cubic-bezier(.4,0,.2,1);
        }

        html { scroll-behavior: smooth; }
        body { font-family: var(--sans); background: var(--cream); color: var(--ink); -webkit-font-smoothing: antialiased; }

        /* ── NAV ── */
        .nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5%; height: 68px;
          background: rgba(248,247,244,.9);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-weight: 500; font-size: 17px; color: var(--ink); text-decoration: none;
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
          font-size: 14px; color: var(--ink); background: none; border: none;
          cursor: pointer; padding: 6px 4px; text-decoration: none;
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
          padding: 88px 5% 72px; text-align: center;
          max-width: 860px; margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--teal-light); color: var(--teal);
          font-size: 12px; font-weight: 500; letter-spacing: .05em; text-transform: uppercase;
          padding: 6px 16px; border-radius: 100px; margin-bottom: 32px;
          border: 1px solid rgba(13,107,94,.2);
        }
        .hero h1 {
          font-family: var(--serif); font-size: clamp(48px, 6vw, 76px);
          font-weight: 400; line-height: 1.06; letter-spacing: -.025em; margin-bottom: 22px;
        }
        .hero h1 em { font-style: italic; color: var(--teal); }
        .hero-sub {
          font-size: 17px; line-height: 1.75; color: var(--muted);
          max-width: 560px; margin: 0 auto 44px;
        }

        /* ── LEGEND ── */
        .legend {
          display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;
          padding: 0 5% 64px;
        }
        .legend-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--muted);
        }
        .legend-dot {
          width: 10px; height: 10px; border-radius: 50%;
        }

        /* ── PHASE RAIL ── */
        .rail {
          max-width: 1100px; margin: 0 auto; padding: 0 5% 120px;
          position: relative;
        }
        .rail::before {
          content: ''; position: absolute;
          left: calc(5% + 27px); top: 0; bottom: 120px;
          width: 2px; background: var(--stone);
        }

        /* ── PHASE BLOCK ── */
        .phase-block {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 0 32px;
          margin-bottom: 72px;
          position: relative;
        }

        /* left column: icon node */
        .phase-node {
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 2;
        }
        .phase-node-circle {
          width: 56px; height: 56px; border-radius: 50%;
          background: #fff; border: 2px solid var(--border-hard);
          display: flex; align-items: center; justify-content: center;
          color: var(--teal); flex-shrink: 0;
          transition: border-color var(--transition), background var(--transition);
        }
        .phase-block:hover .phase-node-circle {
          border-color: var(--teal); background: var(--teal-light);
        }

        /* right column: content */
        .phase-content { padding-top: 12px; }
        .phase-label {
          font-size: 11px; font-weight: 500; letter-spacing: .1em;
          text-transform: uppercase; color: var(--teal); margin-bottom: 6px;
        }
        .phase-title {
          font-family: var(--serif); font-size: clamp(26px, 3vw, 36px);
          font-weight: 400; line-height: 1.12; letter-spacing: -.015em;
          margin-bottom: 6px;
        }
        .phase-subtitle {
          font-size: 14px; color: var(--muted); margin-bottom: 28px; line-height: 1.6;
        }

        /* steps grid */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px; margin-bottom: 20px;
        }
        .step-card {
          background: #fff; border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 24px 22px;
          transition: border-color var(--transition), transform var(--transition);
        }
        .step-card:hover { border-color: var(--border-hard); transform: translateY(-2px); }
        .step-who {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 500; letter-spacing: .06em;
          text-transform: uppercase; padding: 4px 10px; border-radius: 100px;
          margin-bottom: 14px;
        }
        .step-who-dot { width: 6px; height: 6px; border-radius: 50%; }
        .step-label {
          font-size: 15px; font-weight: 500; margin-bottom: 8px; line-height: 1.3;
        }
        .step-body { font-size: 13px; line-height: 1.75; color: var(--muted); }

        /* note callout */
        .phase-note {
          display: flex; align-items: flex-start; gap: 10px;
          background: var(--stone); border-radius: var(--radius-md);
          padding: 14px 18px; font-size: 13px; color: var(--muted); line-height: 1.6;
        }
        .phase-note-icon { color: var(--teal); flex-shrink: 0; margin-top: 1px; }

        /* ── TRACKER VISUAL ── */
        .tracker-ui {
          background: #1A1A1A; border-radius: var(--radius-lg);
          padding: 24px; margin-bottom: 20px; font-family: var(--sans);
        }
        .tracker-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .tracker-logo { display: flex; align-items: center; gap: 8px; }
        .tracker-logo-mark {
          width: 28px; height: 28px; border-radius: 6px;
          background: var(--teal); display: flex; align-items: center; justify-content: center;
        }
        .tracker-logo-name { font-size: 13px; font-weight: 500; color: #fff; }
        .tracker-status {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: rgba(255,255,255,.45); font-weight: 500; letter-spacing: .06em;
        }
        .tracker-status-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22C55E;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
        .tracker-timer {
          font-family: var(--serif); font-size: 52px; font-weight: 600;
          color: #fff; letter-spacing: -.02em; text-align: center;
          padding: 20px 0 8px;
        }
        .tracker-session-label {
          text-align: center; font-size: 12px; color: rgba(255,255,255,.35);
          letter-spacing: .05em; text-transform: uppercase; margin-bottom: 24px;
        }
        .tracker-controls { display: flex; gap: 10px; justify-content: center; margin-bottom: 24px; }
        .tracker-btn {
          height: 44px; padding: 0 20px; border-radius: 100px;
          font-size: 13px; font-weight: 500; cursor: default;
          display: flex; align-items: center; gap: 6px; border: none;
        }
        .tracker-btn-start { background: var(--teal); color: #fff; }
        .tracker-btn-pause { background: rgba(255,255,255,.08); color: rgba(255,255,255,.6); }
        .tracker-btn-stop  { background: rgba(255,255,255,.08); color: rgba(255,255,255,.6); }
        .tracker-meta {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
        }
        .tracker-meta-item {
          background: rgba(255,255,255,.05); border-radius: 10px;
          padding: 12px 14px; border: 1px solid rgba(255,255,255,.06);
        }
        .tracker-meta-label { font-size: 10px; color: rgba(255,255,255,.3); letter-spacing: .06em; text-transform: uppercase; margin-bottom: 4px; }
        .tracker-meta-value { font-size: 15px; font-weight: 500; color: rgba(255,255,255,.85); }
        .tracker-meta-value.green { color: #22C55E; }

        /* ── FEE CALLOUT ── */
        .fee-callout {
          max-width: 1100px; margin: 0 auto 80px; padding: 0 5%;
        }
        .fee-callout-inner {
          background: var(--teal); border-radius: var(--radius-xl);
          padding: 60px 8%; display: grid;
          grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
        }
        .fee-headline {
          font-family: var(--serif); font-size: clamp(32px, 3.5vw, 46px);
          font-weight: 400; color: #fff; line-height: 1.12; letter-spacing: -.02em;
        }
        .fee-headline em { font-style: italic; opacity: .72; }
        .fee-breakdown { display: flex; flex-direction: column; gap: 16px; }
        .fee-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px; border-radius: var(--radius-md);
          background: rgba(255,255,255,.08);
        }
        .fee-row-label { font-size: 14px; color: rgba(255,255,255,.7); }
        .fee-row-value { font-size: 16px; font-weight: 500; color: #fff; }
        .fee-row-value.accent { color: #7EFBD0; }
        .fee-divider { height: 1px; background: rgba(255,255,255,.12); margin: 4px 0; }

        /* ── CTA ── */
        .cta-section {
          padding: 0 5% 100px; text-align: center;
        }
        .cta-inner {
          max-width: 620px; margin: 0 auto;
        }
        .cta-headline {
          font-family: var(--serif); font-size: clamp(36px, 4vw, 52px);
          font-weight: 400; line-height: 1.1; letter-spacing: -.02em; margin-bottom: 16px;
        }
        .cta-headline em { font-style: italic; color: var(--teal); }
        .cta-sub { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 36px; }
        .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .btn-outline {
          font-size: 14px; color: var(--ink); background: none;
          border: 1px solid rgba(20,20,20,.22); padding: 12px 26px;
          border-radius: 100px; cursor: pointer; text-decoration: none;
          transition: border-color var(--transition), background var(--transition);
        }
        .btn-outline:hover { border-color: var(--teal); background: var(--teal-light); }

        /* ── FOOTER ── */
        .footer {
          border-top: 1px solid var(--border); padding: 36px 5%;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-logo { font-size: 15px; font-weight: 500; }
        .footer-copy { font-size: 12px; color: var(--muted); }

        /* ── RESPONSIVE ── */
        @media (max-width: 860px) {
          .rail::before { left: calc(5% + 20px); }
          .phase-block { grid-template-columns: 40px 1fr; gap: 0 20px; }
          .phase-node-circle { width: 40px; height: 40px; }
          .steps-grid { grid-template-columns: 1fr; }
          .fee-callout-inner { grid-template-columns: 1fr; }
          .footer { flex-direction: column; gap: 12px; text-align: center; }
          .tracker-meta { grid-template-columns: 1fr 1fr; }
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
          {["About", "How It Works"].map((l) => (
            <Link
              key={l}
              href={`/${l.toLowerCase().replace(/ /g, "-")}`}
              aria-current={l === "How It Works" ? "page" : undefined}
            >
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
        <section className="hero" aria-labelledby="hiw-heading">
          <div className="hero-badge" role="note">8 phases · end-to-end</div>
          <h1 id="hiw-heading">
            From sign-up to<br />
            <em>getting paid</em>
          </h1>
          <p className="hero-sub">
            Every step — hiring, agreeing, working, reviewing — is built into the platform. No off-platform deals, no payment risk, no guesswork.
          </p>
        </section>

        {/* ── LEGEND ── */}
        <div className="legend" role="note" aria-label="Colour key for step ownership">
          {Object.entries(WHO_CONFIG).map(([key, val]) => (
            <div className="legend-item" key={key}>
              <span className="legend-dot" style={{ background: val.color }} aria-hidden="true" />
              {val.label}
            </div>
          ))}
        </div>

        {/* ── PHASE RAIL ── */}
        <div className="rail" role="list" aria-label="Platform workflow phases">

          {PHASES.map((phase) => (
            <div className="phase-block" key={phase.id} role="listitem">

              {/* Left: icon node */}
              <div className="phase-node" aria-hidden="true">
                <div className="phase-node-circle">{phase.icon}</div>
              </div>

              {/* Right: content */}
              <div className="phase-content">
                <p className="phase-label">{phase.phase}</p>
                <h2 className="phase-title">{phase.title}</h2>
                <p className="phase-subtitle">{phase.subtitle}</p>

                {/* Special tracker UI for phase 07 */}
                {phase.id === "tracker" && (
                  <div className="tracker-ui" role="img" aria-label="Desktop tracker app UI preview">
                    <div className="tracker-header">
                      <div className="tracker-logo">
                        <div className="tracker-logo-mark" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                        <span className="tracker-logo-name">FreelanceHub Tracker</span>
                      </div>
                      <div className="tracker-status">
                        <span className="tracker-status-dot" aria-hidden="true" />
                        ACTIVE SESSION
                      </div>
                    </div>
                    <div className="tracker-timer" aria-label="Session timer: 2 hours 14 minutes 38 seconds">02:14:38</div>
                    <div className="tracker-session-label">Project: Brand Identity Redesign</div>
                    <div className="tracker-controls" role="group" aria-label="Session controls">
                      <button className="tracker-btn tracker-btn-start" aria-disabled="true">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        Running
                      </button>
                      <button className="tracker-btn tracker-btn-pause" aria-label="Pause session">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        Pause
                      </button>
                      <button className="tracker-btn tracker-btn-stop" aria-label="Stop session">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                        Stop
                      </button>
                    </div>
                    <div className="tracker-meta">
                      <div className="tracker-meta-item">
                        <div className="tracker-meta-label">Activity</div>
                        <div className="tracker-meta-value green">87%</div>
                      </div>
                      <div className="tracker-meta-item">
                        <div className="tracker-meta-label">Idle</div>
                        <div className="tracker-meta-value">4 min</div>
                      </div>
                      <div className="tracker-meta-item">
                        <div className="tracker-meta-label">Screenshots</div>
                        <div className="tracker-meta-value">27</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Steps */}
                <div className="steps-grid">
                  {phase.steps.map((step, i) => {
                    const cfg = WHO_CONFIG[step.who];
                    return (
                      <div className="step-card" key={i}>
                        <div
                          className="step-who"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          <span
                            className="step-who-dot"
                            style={{ background: cfg.color }}
                            aria-hidden="true"
                          />
                          {cfg.label}
                        </div>
                        <p className="step-label">{step.label}</p>
                        <p className="step-body">{step.body}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Note */}
                {phase.note && (
                  <div className="phase-note" role="note">
                    <span className="phase-note-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </span>
                    {phase.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── FEE CALLOUT ── */}
        <div className="fee-callout" role="region" aria-labelledby="fee-heading">
          <div className="fee-callout-inner">
            <div>
              <h2 id="fee-heading" className="fee-headline">
                One flat fee.<br /><em>No surprises.</em>
              </h2>
            </div>
            <div className="fee-breakdown" aria-label="Payment breakdown example">
              <div className="fee-row">
                <span className="fee-row-label">Total project budget</span>
                <span className="fee-row-value">$2,000.00</span>
              </div>
              <div className="fee-divider" aria-hidden="true" />
              <div className="fee-row">
                <span className="fee-row-label">Platform fee (10%)</span>
                <span className="fee-row-value">− $200.00</span>
              </div>
              <div className="fee-row" style={{ background: "rgba(255,255,255,.14)" }}>
                <span className="fee-row-label" style={{ color: "#fff", fontWeight: 500 }}>Freelancer receives</span>
                <span className="fee-row-value accent">$1,800.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <section className="cta-section" aria-labelledby="cta-heading">
          <div className="cta-inner">
            <h2 id="cta-heading" className="cta-headline">
              Ready to start<br /><em>your journey?</em>
            </h2>
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
