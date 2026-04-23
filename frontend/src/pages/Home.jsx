import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

/* ─── Inline styles via a <style> tag injected once ─────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  :root {
    --sage:       #5C7A4E;
    --sage-light: #8BAD7A;
    --sage-pale:  #EFF4EB;
    --earth:      #8B6347;
    --earth-pale: #F5EDE4;
    --gold:       #C8963E;
    --gold-pale:  #FBF3E4;
    --cream:      #FAF7F2;
    --dark:       #1E1E1A;
    --muted:      #6B6860;
    --border:     rgba(92,122,78,0.18);
  }

  html { scroll-behavior: smooth; }
  body { background: var(--cream); color: var(--dark); font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes spinSlow {
    to { transform: rotate(360deg); }
  }

  .an-fade-up { animation: fadeUp 0.7s ease both; }
  .an-d1 { animation-delay: 0.10s; }
  .an-d2 { animation-delay: 0.20s; }
  .an-d3 { animation-delay: 0.30s; }
  .an-d4 { animation-delay: 0.40s; }
  .an-d5 { animation-delay: 0.55s; }
  .an-float { animation: floatY 5s ease-in-out infinite; }

  /* ── NAV ── */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(242, 242, 250, 0.92);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
    height: 64px; padding: 0 2.5rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.35rem; font-weight: 500;
    letter-spacing: 0.04em; color: var(--dark); text-decoration: none;
  }
  .nav-logo span { color: var(--sage); }
  .nav-links { display: flex; gap: 2rem; list-style: none; }
  .nav-links a {
    font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--muted); text-decoration: none; transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--sage); }
  .nav-cta {
    background: var(--sage); color: white; border: none;
    border-radius: 100px; padding: 0.55rem 1.4rem;
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
    cursor: pointer; letter-spacing: 0.04em; text-decoration: none;
    display: inline-flex; align-items: center;
    transition: background 0.2s, transform 0.15s;
  }
  .nav-cta:hover { background: var(--sage-light); transform: translateY(-1px); }
  .nav-mobile-toggle {
    display: none; background: none; border: none;
    cursor: pointer; flex-direction: column; gap: 5px; padding: 4px;
  }
  .nav-mobile-toggle span {
    width: 22px; height: 2px; background: var(--dark);
    border-radius: 2px; display: block; transition: 0.3s;
  }

  @media (max-width: 768px) {
    .nav-links, .nav-cta-desktop { display: none !important; }
    .nav-mobile-toggle { display: flex !important; }
  }

  /* ── HERO ── */
  .hero {
    min-height: calc(100vh - 64px);
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; gap: 5rem;
    padding: 5rem 4rem 5rem;
    position: relative; overflow: hidden;
  }
  .hero-blob-1 {
    position: absolute; top: -100px; right: -100px;
    width: 560px; height: 560px; border-radius: 50%;
    background: radial-gradient(circle, rgba(139,173,122,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-blob-2 {
    position: absolute; bottom: -80px; left: 20%;
    width: 340px; height: 340px; border-radius: 50%;
    background: radial-gradient(circle, rgba(200,150,62,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--sage-pale); border: 1px solid rgba(92,122,78,0.25);
    border-radius: 100px; padding: 0.35rem 1rem 0.35rem 0.5rem;
    margin-bottom: 1.5rem;
  }
  .hero-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sage); }
  .hero-badge span { font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--sage); font-weight: 500; }
  .hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.6rem, 4.5vw, 4rem);
    font-weight: 400; line-height: 1.1; letter-spacing: -0.01em; margin-bottom: 1.5rem;
  }
  .hero-title em { font-style: italic; color: var(--sage); }
  .hero-desc {
    font-size: 1.05rem; line-height: 1.75; color: var(--muted);
    margin-bottom: 2.5rem; max-width: 440px; font-weight: 300;
  }
  .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
  .btn-primary {
    background: var(--sage); color: white; border: none;
    border-radius: 100px; padding: 0.9rem 2rem;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    cursor: pointer; font-weight: 500; text-decoration: none;
    display: inline-flex; align-items: center; gap: 8px;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-primary:hover { background: #4a6a3e; transform: translateY(-2px); }
  .btn-secondary {
    background: transparent; color: var(--dark);
    border: 1px solid rgba(30,30,26,0.25); border-radius: 100px;
    padding: 0.9rem 2rem;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    cursor: pointer; font-weight: 400; text-decoration: none;
    display: inline-flex; align-items: center;
    transition: border-color 0.2s, color 0.2s, transform 0.15s;
  }
  .btn-secondary:hover { border-color: var(--sage); color: var(--sage); transform: translateY(-2px); }
  .hero-stats { display: flex; gap: 2.5rem; margin-top: 3rem; }
  .stat-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem; font-weight: 500; color: var(--dark); line-height: 1;
  }
  .stat-label { font-size: 0.78rem; color: var(--muted); letter-spacing: 0.04em; margin-top: 4px; }
  .stat-divider { width: 1px; background: var(--border); align-self: stretch; }

  /* Hero visual */
  .hero-visual { position: relative; display: flex; justify-content: center; align-items: center; }
  .hero-card-main {
    width: 280px; height: 360px; border-radius: 28px;
    background: linear-gradient(150deg, #deeece 0%, #c6dfb0 100%);
    border: 1px solid rgba(92,122,78,0.2);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .hero-card-main svg { width: 120px; opacity: 0.65; }
  .hero-card-main .card-label {
    position: absolute; bottom: 20px;
    font-family: 'Cormorant Garamond', serif; font-size: 1.05rem;
    color: #3a5c30; font-style: italic; letter-spacing: 0.03em;
  }
  .float-card {
    position: absolute; background: white; border-radius: 16px;
    border: 1px solid var(--border); padding: 0.85rem 1.1rem;
    box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    animation: floatY 5s ease-in-out infinite;
  }
  .float-card-1 { top: 10px; right: -40px; animation-delay: 0s; }
  .float-card-2 { bottom: 50px; left: -50px; animation-delay: 1.5s; }
  .float-card-3 { bottom: -24px; right: 10px; animation-delay: 2.8s; }
  .fc-label { font-size: 0.68rem; color: var(--muted); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px; }
  .fc-value { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 500; color: var(--dark); }
  .fc-pills { display: flex; gap: 4px; margin-top: 6px; }
  .fc-pill {
    font-size: 0.68rem; border-radius: 100px;
    padding: 2px 9px; font-weight: 500; letter-spacing: 0.03em;
  }
  .pill-v { background: #E8F3E0; color: #3a6b28; }
  .pill-p { background: #ECEAF8; color: #4e47a0; }
  .pill-k { background: #FDE8D8; color: #8b4513; }
  .fc-bar-wrap { width: 80px; height: 4px; background: var(--sage-pale); border-radius: 4px; margin-top: 6px; }
  .fc-bar { height: 4px; border-radius: 4px; background: var(--sage); width: 72%; }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding: 3rem 2rem 4rem; gap: 3rem; min-height: auto; }
    .hero-visual { order: -1; height: 320px; }
    .hero-card-main { width: 200px; height: 260px; }
    .float-card-1 { right: 20px; }
    .float-card-2 { left: 10px; }
    .float-card-3 { right: 40px; }
    .hero-stats { gap: 1.5rem; }
  }

  /* ── TRUST BAR ── */
  .trust-bar {
    background: var(--dark); padding: 1.1rem 2rem;
    display: flex; align-items: center; justify-content: center;
    gap: 3rem; flex-wrap: wrap; overflow: hidden;
  }
  .trust-item { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 0.82rem; letter-spacing: 0.04em; white-space: nowrap; }
  .trust-icon { font-size: 1rem; }
  .trust-divider { width: 1px; height: 18px; background: rgba(255,255,255,0.15); }

  /* ── DOSHAS ── */
  .section { padding: 6rem 4rem; }
  .section-sm { padding: 5rem 4rem; }
  .section-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--sage-pale); border: 1px solid rgba(92,122,78,0.2);
    border-radius: 100px; padding: 0.3rem 0.9rem;
    font-size: 0.72rem; letter-spacing: 0.07em; text-transform: uppercase;
    color: var(--sage); font-weight: 500; margin-bottom: 1.2rem;
  }
  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 400; line-height: 1.15; margin-bottom: 1rem;
  }
  .section-title em { font-style: italic; color: var(--sage); }
  .section-subtitle { font-size: 1rem; color: var(--muted); line-height: 1.7; max-width: 540px; font-weight: 300; }
  .section-header { text-align: center; max-width: 600px; margin: 0 auto 4rem; }
  .section-header .section-subtitle { margin: 0 auto; }

  .dosha-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1100px; margin: 0 auto; }
  .dosha-card {
    border-radius: 24px; padding: 2.5rem 2rem;
    border: 1px solid transparent; cursor: pointer;
    transition: transform 0.25s, box-shadow 0.25s;
    position: relative; overflow: hidden;
  }
  .dosha-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.09); }
  .dosha-card.vata  { background: #EDF5E8; border-color: rgba(92,122,78,0.2); }
  .dosha-card.pitta { background: #F3EFF9; border-color: rgba(120,110,190,0.2); }
  .dosha-card.kapha { background: #FDF0E6; border-color: rgba(200,150,62,0.2); }
  .dosha-icon { font-size: 2.5rem; margin-bottom: 1.2rem; }
  .dosha-name { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; font-weight: 500; margin-bottom: 0.4rem; }
  .dosha-card.vata  .dosha-name { color: #3a6b28; }
  .dosha-card.pitta .dosha-name { color: #4e47a0; }
  .dosha-card.kapha .dosha-name { color: #8b4513; }
  .dosha-elem { font-size: 0.75rem; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin-bottom: 1rem; }
  .dosha-desc { font-size: 0.9rem; color: var(--muted); line-height: 1.65; margin-bottom: 1.5rem; font-weight: 300; }
  .dosha-traits { list-style: none; }
  .dosha-traits li { font-size: 0.82rem; color: var(--muted); padding: 0.3rem 0; display: flex; align-items: center; gap: 8px; }
  .dosha-traits li::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--sage); flex-shrink: 0; }
  .dosha-card.pitta .dosha-traits li::before { background: #7873c0; }
  .dosha-card.kapha .dosha-traits li::before { background: var(--gold); }

  @media (max-width: 900px) {
    .dosha-grid { grid-template-columns: 1fr; max-width: 500px; }
    .section, .section-sm { padding: 4rem 1.5rem; }
  }

  /* ── HOW IT WORKS ── */
  .how-section { background: white; }
  .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; max-width: 1100px; margin: 0 auto; position: relative; }
  .steps-grid::before {
    content: ''; position: absolute; top: 2.5rem; left: 12.5%; right: 12.5%;
    height: 1px; background: var(--border); z-index: 0;
  }
  .step-card { text-align: center; padding: 0 1rem; position: relative; z-index: 1; }
  .step-num {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--sage); color: white;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 500;
    margin: 0 auto 1.2rem;
  }
  .step-title { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-weight: 500; margin-bottom: 0.6rem; }
  .step-desc { font-size: 0.85rem; color: var(--muted); line-height: 1.65; font-weight: 300; }

  @media (max-width: 768px) {
    .steps-grid { grid-template-columns: 1fr 1fr; }
    .steps-grid::before { display: none; }
  }
  @media (max-width: 480px) {
    .steps-grid { grid-template-columns: 1fr; }
  }

  /* ── INGREDIENTS ── */
  .ingredients-section { background: var(--dark); }
  .ingredients-section .section-tag { background: rgba(92,122,78,0.2); border-color: rgba(92,122,78,0.3); }
  .ingredients-section .section-title { color: white; }
  .ingredients-section .section-title em { color: var(--sage-light); }
  .ingredients-section .section-subtitle { color: rgba(255,255,255,0.55); }
  .ingredients-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.07); max-width: 1100px; margin: 0 auto; border-radius: 20px; overflow: hidden; }
  .ingredient-item { background: var(--dark); padding: 2.5rem 2rem; transition: background 0.2s; cursor: default; }
  .ingredient-item:hover { background: #2a2a24; }
  .ing-icon { font-size: 2rem; margin-bottom: 1rem; }
  .ing-name { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 500; color: white; margin-bottom: 0.5rem; }
  .ing-benefit { font-size: 0.8rem; color: rgba(255,255,255,0.45); line-height: 1.6; font-weight: 300; }
  .ing-badge { display: inline-block; margin-top: 0.8rem; background: rgba(92,122,78,0.25); color: var(--sage-light); border-radius: 100px; font-size: 0.7rem; padding: 3px 10px; letter-spacing: 0.04em; }

  @media (max-width: 768px) {
    .ingredients-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 480px) {
    .ingredients-grid { grid-template-columns: 1fr; }
  }

  /* ── TESTIMONIALS ── */
  .testimonials-section { background: var(--earth-pale); }
  .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1100px; margin: 0 auto; }
  .testimonial-card { background: white; border-radius: 20px; padding: 2rem; border: 1px solid var(--border); }
  .t-stars { color: var(--gold); font-size: 0.85rem; margin-bottom: 1rem; letter-spacing: 2px; }
  .t-text { font-size: 0.92rem; color: var(--muted); line-height: 1.7; margin-bottom: 1.5rem; font-weight: 300; font-style: italic; }
  .t-author { display: flex; align-items: center; gap: 12px; }
  .t-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--sage-pale); display: flex; align-items: center; justify-content: center; font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; color: var(--sage); font-weight: 500; }
  .t-name { font-size: 0.88rem; font-weight: 500; color: var(--dark); }
  .t-dosha { font-size: 0.75rem; color: var(--muted); letter-spacing: 0.04em; }

  @media (max-width: 768px) {
    .testimonials-grid { grid-template-columns: 1fr; max-width: 480px; }
  }

  /* ── CTA BANNER ── */
  .cta-banner {
    margin: 4rem; border-radius: 28px;
    background: linear-gradient(135deg, #3a5c30 0%, #5C7A4E 60%, #8BAD7A 100%);
    padding: 5rem 4rem; text-align: center; position: relative; overflow: hidden;
  }
  .cta-banner::before {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 280px; height: 280px; border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }
  .cta-banner::after {
    content: ''; position: absolute; bottom: -60px; left: -30px;
    width: 220px; height: 220px; border-radius: 50%;
    background: rgba(255,255,255,0.05);
  }
  .cta-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 400; color: white; margin-bottom: 1rem; line-height: 1.2; }
  .cta-title em { font-style: italic; color: rgba(255,255,255,0.7); }
  .cta-sub { font-size: 1rem; color: rgba(255,255,255,0.7); margin-bottom: 2.5rem; font-weight: 300; }
  .cta-btn { background: white; color: var(--sage); border: none; border-radius: 100px; padding: 1rem 2.5rem; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s, box-shadow 0.2s; }
  .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.2); }

  @media (max-width: 768px) {
    .cta-banner { margin: 2rem 1.5rem; padding: 3.5rem 2rem; }
  }

  /* ── FOOTER ── */
  .footer { background: var(--dark); padding: 4rem 4rem 2rem; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
  .footer-brand { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: white; margin-bottom: 1rem; }
  .footer-brand span { color: var(--sage-light); }
  .footer-tagline { font-size: 0.85rem; color: rgba(255,255,255,0.4); line-height: 1.7; font-weight: 300; max-width: 240px; }
  .footer-col-title { font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 1.2rem; font-weight: 500; }
  .footer-links { list-style: none; }
  .footer-links li { margin-bottom: 0.7rem; }
  .footer-links a { font-size: 0.85rem; color: rgba(255,255,255,0.45); text-decoration: none; transition: color 0.2s; }
  .footer-links a:hover { color: var(--sage-light); }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; flex-wrap: wrap; }
  .footer-copy { font-size: 0.78rem; color: rgba(255,255,255,0.3); }
  .footer-disclaimer { font-size: 0.72rem; color: rgba(255,255,255,0.25); line-height: 1.65; max-width: 560px; }
  .footer-disclaimer strong { color: rgba(255,255,255,0.35); }

  @media (max-width: 768px) {
    .footer { padding: 3rem 1.5rem 2rem; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .footer-bottom { flex-direction: column; }
  }
  @media (max-width: 480px) {
    .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
  }
`;

/* ── DATA ─────────────────────────────────────────────────────────────────── */
const DOSHAS = [
  {
    cls: 'vata', icon: '🌬️', name: 'Vata', element: 'Air · Space',
    desc: 'Light, dry, and mobile by nature. Vata skin tends to be thin, delicate, and prone to dryness and premature aging.',
    traits: ['Dry, rough, or flaky texture', 'Fine pores & visible veins', 'Tendency toward sensitivity'],
  },
  {
    cls: 'pitta', icon: '🔥', name: 'Pitta', element: 'Fire · Water',
    desc: 'Sharp and intense energy. Pitta skin is sensitive, prone to redness, inflammation, and reacts to heat or spicy foods.',
    traits: ['Redness, rosacea, or flushing', 'Combination to oily T-zone', 'Acne and breakout-prone'],
  },
  {
    cls: 'kapha', icon: '🌊', name: 'Kapha', element: 'Earth · Water',
    desc: 'Dense, stable, and nurturing energy. Kapha skin is thick, oily, and prone to congestion but ages gracefully.',
    traits: ['Oily, thick, and smooth', 'Enlarged pores & blackheads', 'Slow to react, resilient'],
  },
];

const STEPS = [
  { n: '1', title: 'Find Your Dosha', desc: 'Answer our evidence-based questionnaire to discover your unique mind-body constitution.' },
  { n: '2', title: 'Skin Analysis', desc: 'We assess your current skin condition, seasonal influences, and imbalances present.' },
  { n: '3', title: 'Custom Regimen', desc: 'Receive a fully personalised daily ritual with Ayurvedic herbs and meditation practices.' },
  { n: '4', title: 'Track Progress', desc: 'Monitor your skin\'s transformation over weeks and refine your regimen as needed.' },
];

const INGREDIENTS = [
  { icon: '🪷', name: 'Kumkumadi', benefit: 'Saffron-infused oil that brightens, evens tone, and reduces hyperpigmentation over time.', tag: 'Brightening' },
  { icon: '🌿', name: 'Neem', benefit: 'Potent antibacterial and anti-inflammatory herb, ideal for acne-prone and irritated skin.', tag: 'Clarifying' },
  { icon: '🫚', name: 'Ashwagandha', benefit: 'Adaptogenic root that combats stress-related skin aging and boosts collagen synthesis.', tag: 'Anti-aging' },
  { icon: '🌸', name: 'Rose & Sandalwood', benefit: 'Cooling and soothing duo that calms Pitta skin, reduces redness, and adds luminosity.', tag: 'Soothing' },
  { icon: '🍃', name: 'Brahmi', benefit: 'Ancient brain and skin tonic that supports cell renewal and reduces oxidative stress.', tag: 'Renewing' },
  { icon: '🫙', name: 'Turmeric', benefit: 'Powerhouse anti-inflammatory that tackles dark spots, uneven texture, and dullness.', tag: 'Radiance' },
];

const TESTIMONIALS = [
  { stars: 5, text: 'After years of struggling with rosacea, following my Pitta-balancing regimen for just 6 weeks made a visible difference. My skin feels calmer than it has in a decade.', name: 'Priya S.', dosha: 'Pitta Dominant' },
  { stars: 5, text: 'The dosha assessment was eye-opening. I never connected my dry, flaky skin to my Vata constitution. The recommended oils transformed my morning routine completely.', name: 'Amara K.', dosha: 'Vata Dominant' },
  { stars: 5, text: 'The meditation and breathwork recommendations alongside the skincare rituals genuinely changed how I approach self-care. Mind and skin both feel balanced.', name: 'Lena M.', dosha: 'Kapha-Pitta' },
];

/* ── COMPONENT ───────────────────────────────────────────────────────────── */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const styleInjected = useRef(false);

  useEffect(() => {
    if (styleInjected.current) return;
    const tag = document.createElement('style');
    tag.textContent = CSS;
    document.head.appendChild(tag);
    styleInjected.current = true;
  }, []);

  return (
    <div>
    
      {/* Mobile nav drawer */}
      {menuOpen && (
        <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)', padding: '1rem 2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {['#doshas','#how-it-works','#ingredients','#testimonials'].map((href, i) => (
            <a key={i} href={href} style={{ fontSize: '0.9rem', color: 'var(--muted)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
              {href.replace('#','').replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
            </a>
          ))}
          <Link to="/assessment" className="btn-primary" style={{ justifyContent: 'center' }}>Start Free Assessment →</Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-blob-1" />
        <div className="hero-blob-2" />

        <div>
          <div className="hero-badge an-fade-up">
            <div className="hero-badge-dot" />
            <span>Ancient Wisdom · Modern Science</span>
          </div>
          <h1 className="hero-title an-fade-up an-d1">
            Skin that <em>thrives</em><br />
            from the inside out
          </h1>
          <p className="hero-desc an-fade-up an-d2">
            Discover your unique Dosha and receive a personalised Ayurvedic skincare ritual—blending 5,000 years of botanical wisdom with evidence-informed wellness. Free, always.
          </p>
          <div className="hero-actions an-fade-up an-d3">
            <Link to="/assessment" className="btn-primary">Start Free Assessment →</Link>
            <a href="#how-it-works" className="btn-secondary">How it works</a>
          </div>
          <div className="hero-stats an-fade-up an-d4">
            {[['12k+','Skin assessments'],['94%','Report visible improvement'],['3','Dosha types covered']].map(([num, label], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: i > 0 ? '2.5rem' : 0 }}>
                {i > 0 && <div className="stat-divider" />}
                <div>
                  <div className="stat-num">{num}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card-main an-float">
            <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10 C20 30 10 60 30 90 C40 105 60 105 70 90 C90 60 80 30 50 10Z" fill="#4a7a38" opacity="0.7"/>
              <path d="M50 10 C50 40 50 70 50 100" stroke="#2d5020" strokeWidth="1.5" opacity="0.5"/>
              <path d="M50 40 C35 35 25 42 20 55" stroke="#2d5020" strokeWidth="1" opacity="0.4"/>
              <path d="M50 55 C68 50 75 40 72 28" stroke="#2d5020" strokeWidth="1" opacity="0.4"/>
            </svg>
            <span className="card-label">Your skin, balanced</span>
          </div>

          <div className="float-card float-card-1">
            <div className="fc-label">Your Dosha</div>
            <div className="fc-value">Vata-Pitta</div>
            <div className="fc-pills">
              <span className="fc-pill pill-v">Vata</span>
              <span className="fc-pill pill-p">Pitta</span>
            </div>
          </div>

          <div className="float-card float-card-2">
            <div className="fc-label">Skin Hydration</div>
            <div className="fc-value">↑ 38% in 4 wks</div>
            <div className="fc-bar-wrap"><div className="fc-bar" /></div>
          </div>

          <div className="float-card float-card-3">
            <div className="fc-label">Today's Ritual</div>
            <div className="fc-value">Morning ✓</div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="trust-bar">
        {[
          ['🌿', 'Botanically sourced'],
          ['🔬', 'Evidence-informed'],
          ['💚', '100% free, no account needed'],
          ['🛡️', 'No data sold — ever'],
          ['🧘', 'Mind + skin holistic approach'],
        ].map(([icon, label], i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: i < arr.length - 1 ? 0 : undefined }}>
            <span className="trust-item">
              <span className="trust-icon">{icon}</span> {label}
            </span>
            {i < arr.length - 1 && <span className="trust-divider" style={{ marginLeft: '3rem' }} />}
          </div>
        ))}
      </div>

      {/* ── DOSHAS ── */}
      <section className="section" id="doshas">
        <div className="section-header">
          <div className="section-tag">The Three Doshas</div>
          <h2 className="section-title">Find your <em>constitution</em></h2>
          <p className="section-subtitle">Ayurveda teaches that each person has a unique ratio of three bio-energies—Vata, Pitta, and Kapha—that shape your skin's needs.</p>
        </div>
        <div className="dosha-grid">
          {DOSHAS.map(d => (
            <div key={d.cls} className={`dosha-card ${d.cls}`}>
              <div className="dosha-icon">{d.icon}</div>
              <div className="dosha-name">{d.name}</div>
              <div className="dosha-elem">{d.element}</div>
              <p className="dosha-desc">{d.desc}</p>
              <ul className="dosha-traits">
                {d.traits.map(t => <li key={t}>{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/assessment" className="btn-primary">Discover my Dosha →</Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-sm how-section" id="how-it-works">
        <div className="section-header">
          <div className="section-tag">The Process</div>
          <h2 className="section-title">Your path to <em>balanced</em> skin</h2>
          <p className="section-subtitle">Four simple steps to a ritual that truly fits you—and the science to back it.</p>
        </div>
        <div className="steps-grid">
          {STEPS.map(s => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INGREDIENTS ── */}
      <section className="section ingredients-section" id="ingredients">
        <div className="section-header">
          <div className="section-tag">Key Botanicals</div>
          <h2 className="section-title">Nature's <em>pharmacy</em></h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.5)' }}>Six powerhouse ingredients at the heart of Ayurvedic skincare, chosen for your Dosha.</p>
        </div>
        <div className="ingredients-grid">
          {INGREDIENTS.map(ing => (
            <div key={ing.name} className="ingredient-item">
              <div className="ing-icon">{ing.icon}</div>
              <div className="ing-name">{ing.name}</div>
              <p className="ing-benefit">{ing.benefit}</p>
              <span className="ing-badge">{ing.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section testimonials-section" id="testimonials">
        <div className="section-header">
          <div className="section-tag">Real Stories</div>
          <h2 className="section-title">Skin <em>transformed</em></h2>
          <p className="section-subtitle">From dryness to redness to congestion—hear from people who found their balance.</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="testimonial-card">
              <div className="t-stars">{'★'.repeat(t.stars)}</div>
              <p className="t-text">"{t.text}"</p>
              <div className="t-author">
                <div className="t-avatar">{t.name[0]}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-dosha">{t.dosha}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <div className="cta-banner">
        <h2 className="cta-title">Ready to meet your <em>skin's true nature?</em></h2>
        <p className="cta-sub">Free. No account required. Results in under 5 minutes.</p>
        <Link to="/assessment" className="cta-btn">Begin Your Free Assessment →</Link>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">vara<span>veda</span></div>
            <p className="footer-tagline">Ancient Ayurvedic wisdom brought into your modern skincare ritual. Free, always.</p>
          </div>
          <div>
            <div className="footer-col-title">Explore</div>
            <ul className="footer-links">
              <li><a href="#doshas">The Three Doshas</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#ingredients">Key Botanicals</a></li>
              <li><Link to="/assessment" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Take Assessment</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Wellness</div>
            <ul className="footer-links">
              <li><a href="#">Meditation Guide</a></li>
              <li><a href="#">Seasonal Rituals</a></li>
              <li><a href="#">Diet & Doshas</a></li>
              <li><a href="#">Yoga for Skin</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">About</div>
            <ul className="footer-links">
              <li><a href="#">Our Philosophy</a></li>
              <li><a href="#">Research & Sources</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 VaraVeda. All rights reserved.</div>
          <div className="footer-disclaimer">
            <strong>Medical Disclaimer:</strong> Content is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider regarding any medical condition.
          </div>
        </div>
      </footer>
    </div>
  );
}