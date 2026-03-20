import { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import MafiaGame from "./lobby";

const DISCORD_CLIENT_ID = "1482384116937658528";
const DISCORD_REDIRECT_URI = encodeURIComponent(window.location.origin + "/lobby");
const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${DISCORD_REDIRECT_URI}&response_type=token&scope=identify`;

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Mono:wght@300;400;500&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --noir-black: #08080A; --noir-card: #111118; --noir-card2: #16161f;
      --noir-border: rgba(255,255,255,0.07); --noir-border-hover: rgba(255,255,255,0.14);
      --blood: #C0141C; --blood-dim: rgba(192,20,28,0.15); --blood-glow: rgba(192,20,28,0.35);
      --gold: #C9A84C; --text-bright: #F0EDE8; --text-mid: #9E9A94; --text-dim: #55524E;
      --emerald: #1DB36A; --sapphire: #2A7FD4; --amethyst: #8B5CF6;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--noir-black); color: var(--text-bright);
      font-family: 'Crimson Pro', Georgia, serif; min-height: 100vh;
      -webkit-font-smoothing: antialiased; overflow-x: hidden;
    }
    body::before {
      content: ''; position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none; z-index: 9999; opacity: 0.6;
    }
    .font-display { font-family: 'Playfair Display', Georgia, serif; }
    .font-mono    { font-family: 'DM Mono', monospace; }
    .font-body    { font-family: 'Crimson Pro', Georgia, serif; }

    /* ── Core keyframes ── */
    @keyframes fadeUp        { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn        { from { opacity:0; } to { opacity:1; } }
    @keyframes bloodDrip     { from { height:0; opacity:0; } to { opacity:0.5; } }
    @keyframes pulse         { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    @keyframes cardFloat     { 0%,100% { transform:translateY(0) rotate(-1.5deg); } 50% { transform:translateY(-12px) rotate(-1.5deg); } }
    @keyframes cardFloat2    { 0%,100% { transform:translateY(0) rotate(1.2deg); }  50% { transform:translateY(-8px) rotate(1.2deg); } }
    @keyframes spin          { to { transform: rotate(360deg); } }

    /* ── New keyframes ── */
    @keyframes drip {
      0%   { transform: scaleY(0) translateY(0); opacity: 0; transform-origin: top; }
      10%  { opacity: 0.6; transform: scaleY(0.1) translateY(0); transform-origin: top; }
      80%  { opacity: 0.4; transform: scaleY(1) translateY(0); transform-origin: top; }
      90%  { opacity: 0.3; }
      100% { opacity: 0; transform: scaleY(1) translateY(4px); transform-origin: top; }
    }
    @keyframes dropFall {
      0%   { transform: translateY(-10px) scale(1); opacity: 0.7; }
      100% { transform: translateY(100vh) scale(0.6); opacity: 0; }
    }
    @keyframes glitch1 {
      0%,90%,100% { clip-path: inset(0 0 100% 0); transform: translateX(0); }
      91%  { clip-path: inset(20% 0 50% 0); transform: translateX(-4px); }
      93%  { clip-path: inset(60% 0 10% 0); transform: translateX(4px); }
      95%  { clip-path: inset(40% 0 30% 0); transform: translateX(-2px); }
      97%  { clip-path: inset(0% 0 80% 0);  transform: translateX(3px); }
    }
    @keyframes glitch2 {
      0%,88%,100% { clip-path: inset(0 0 100% 0); transform: translateX(0); }
      89%  { clip-path: inset(10% 0 70% 0); transform: translateX(5px); color: #ff1a24; }
      91%  { clip-path: inset(50% 0 20% 0); transform: translateX(-3px); color: #2A7FD4; }
      94%  { clip-path: inset(30% 0 40% 0); transform: translateX(2px); }
    }
    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes floatParticle {
      0%   { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 0.8; }
      100% { transform: translateY(-120px) translateX(var(--drift, 20px)) rotate(360deg); opacity: 0; }
    }
    @keyframes emberFloat {
      0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
      50%  { transform: translateY(-60px) translateX(var(--x2, 15px)) scale(0.6); opacity: 0.5; }
      100% { transform: translateY(-120px) translateX(var(--x3, -10px)) scale(0.1); opacity: 0; }
    }
    @keyframes heartbeat {
      0%,100% { transform: scaleX(1); }
      10%      { transform: scaleX(1.02); }
      20%      { transform: scaleX(0.98); }
      30%      { transform: scaleX(1.015); }
      40%      { transform: scaleX(1); }
    }
    @keyframes lineTrace {
      0%   { stroke-dashoffset: 1000; opacity: 0; }
      5%   { opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: 1; }
    }
    @keyframes revealChar {
      from { opacity: 0; transform: translateY(8px) rotateX(40deg); filter: blur(4px); }
      to   { opacity: 1; transform: translateY(0) rotateX(0deg); filter: blur(0); }
    }
    @keyframes pillFloat {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-4px); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes vignetteFlicker {
      0%,100% { opacity: 0.7; }
      50%      { opacity: 0.9; }
    }
    @keyframes stepReveal {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes featureReveal {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes borderGlow {
      0%,100% { box-shadow: 0 0 0 1px rgba(192,20,28,0.0); }
      50%      { box-shadow: 0 0 0 1px rgba(192,20,28,0.4), 0 0 24px rgba(192,20,28,0.12); }
    }
    @keyframes navSlide {
      from { transform: translateY(-60px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    @keyframes footerFade {
      0%   { transform: translateY(0) scale(1); opacity: 0.15; filter: blur(8px); }
      100% { transform: translateY(-80px) scale(2.5); opacity: 0; filter: blur(20px); }
    }
    @keyframes ctaGlow {
      0%,100% { box-shadow: 0 0 0 0 rgba(192,20,28,0); }
      50%      { box-shadow: 0 0 60px 8px rgba(192,20,28,0.15); }
    }
    @keyframes textFlicker {
      0%,100% { opacity: 1; }
      92%      { opacity: 1; }
      93%      { opacity: 0.4; }
      94%      { opacity: 1; }
      96%      { opacity: 0.7; }
      97%      { opacity: 1; }
    }
    @keyframes runeRotate {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes footerFade {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .fade-up { animation: fadeUp 0.7s ease both; }
    .fade-in { animation: fadeIn 0.6s ease both; }
    .glass-card { background:var(--noir-card); border:1px solid var(--noir-border); border-radius:16px; backdrop-filter:blur(12px); }
    .btn-blood {
      background:var(--blood); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:10px;
      font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;
      cursor:pointer; transition:all 0.2s; box-shadow:0 4px 24px var(--blood-glow);
      position: relative; overflow: hidden;
    }
    .btn-blood::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
      background-size: 200% 100%; background-position: -200% center;
      transition: background-position 0.5s;
    }
    .btn-blood:hover::after { background-position: 200% center; }
    .btn-blood:hover { background:#d4161f; box-shadow:0 6px 32px var(--blood-glow); transform:translateY(-1px); }
    .btn-ghost {
      background:transparent; color:var(--text-mid); border:1px solid var(--noir-border); border-radius:10px;
      font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.15em; text-transform:uppercase;
      cursor:pointer; transition:all 0.2s;
    }
    .btn-ghost:hover { border-color:var(--noir-border-hover); color:var(--text-bright); }
    .btn-discord {
      background:#5865F2; color:white; border:1px solid rgba(255,255,255,0.12); border-radius:12px;
      font-family:'DM Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase;
      cursor:pointer; transition:all 0.25s; box-shadow:0 4px 24px rgba(88,101,242,0.4);
      display:flex; align-items:center; justify-content:center; gap:12px;
      position: relative; overflow: hidden;
    }
    .btn-discord::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.1) 50%, transparent 65%);
      background-size: 250% 100%; background-position: -200% center; transition: background-position 0.6s;
    }
    .btn-discord:hover::after { background-position: 200% center; }
    .btn-discord:hover { background:#4752c4; box-shadow:0 6px 36px rgba(88,101,242,0.55); transform:translateY(-2px); }
    .btn-discord:active { transform:translateY(0); }
    .screenshots-track {
      display:flex; gap:20px; overflow-x:auto; padding:12px 24px 24px;
      scrollbar-width:thin; scrollbar-color:rgba(192,20,28,0.4) transparent;
      cursor:grab; user-select:none;
    }
    .screenshots-track:active { cursor:grabbing; }
    .screenshots-track::-webkit-scrollbar { height:4px; }
    .screenshots-track::-webkit-scrollbar-track { background:transparent; }
    .screenshots-track::-webkit-scrollbar-thumb { background:rgba(192,20,28,0.4); border-radius:2px; }
    .screenshot-frame {
      flex-shrink:0; width:340px; border-radius:14px; overflow:hidden;
      border:1px solid var(--noir-border); background:var(--noir-card2);
      box-shadow:0 20px 60px rgba(0,0,0,0.6); transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s;
    }
    .screenshot-frame:hover {
      transform:translateY(-10px) scale(1.03) rotate(-0.5deg);
      box-shadow:0 36px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(192,20,28,0.25), 0 0 40px rgba(192,20,28,0.08);
    }
    .screenshot-frame img { width:100%; display:block; object-fit:cover; pointer-events:none; }
    .screenshot-chrome {
      background:#0d0d14; padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.05);
      display:flex; align-items:center; gap:6px;
    }
    .screenshot-dot { width:10px; height:10px; border-radius:50%; opacity:0.7; transition: opacity 0.2s; }
    .screenshot-frame:hover .screenshot-dot { opacity: 1; }
    .screenshot-bar {
      flex:1; height:18px; border-radius:4px; background:rgba(255,255,255,0.04); margin-left:8px;
      display:flex; align-items:center; justify-content:center;
    }
    .feature-card {
      background:var(--noir-card); border:1px solid var(--noir-border); border-radius:16px;
      padding:28px 24px; transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);
      position: relative; overflow: hidden;
    }
    .feature-card::before {
      content: ''; position: absolute; inset: 0; opacity: 0;
      background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(192,20,28,0.08) 0%, transparent 70%);
      transition: opacity 0.4s;
    }
    .feature-card:hover::before { opacity: 1; }
    .feature-card:hover {
      border-color:rgba(192,20,28,0.35); transform:translateY(-6px) scale(1.01);
      box-shadow:0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(192,20,28,0.12);
    }
    .role-pill {
      display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:100px;
      font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase;
      border:1px solid; white-space:nowrap;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s;
      cursor: default;
    }
    .role-pill:hover {
      transform: translateY(-3px) scale(1.05);
    }
    .section-divider {
      width:48px; height:1px;
      background:linear-gradient(to right, transparent, var(--blood), transparent);
      margin:0 auto 20px;
      animation: shimmer 3s ease infinite;
      background-size: 200% 100%;
    }

    /* Scroll-reveal classes */
    .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-left { opacity: 0; transform: translateX(-28px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal-left.visible { opacity: 1; transform: translateX(0); }
    .reveal-scale { opacity: 0; transform: scale(0.93); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1); }
    .reveal-scale.visible { opacity: 1; transform: scale(1); }

    @media (max-width:768px)  { .hide-mobile  { display:none !important; } .screenshot-frame { width:270px; } }
    @media (min-width:769px)  { .hide-desktop { display:none !important; } }

  `}</style>
);

// ─── Scanline overlay ─────────────────────────────────────────────────────────
function Scanline() {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998, overflow:'hidden' }}>
      <div style={{
        position:'absolute', left:0, right:0, height:'2px',
        background:'linear-gradient(to bottom, transparent, rgba(192,20,28,0.04), transparent)',
        animation:'scanline 8s linear infinite',
      }} />
    </div>
  );
}

// ─── Blood drip strip ─────────────────────────────────────────────────────────
function BloodDrips({ count = 18 }) {
  const drips = useRef([]);
  if (!drips.current.length) {
    drips.current = Array.from({ length: count }, (_, i) => ({
      left: `${3 + i * (94 / count)}%`,
      height: 20 + Math.random() * 80,
      delay: Math.random() * 6,
      dur: 3 + Math.random() * 4,
      width: 1 + Math.random(),
      dropSize: 4 + Math.random() * 5,
    }));
  }
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, pointerEvents:'none', zIndex:2 }}>
      {drips.current.map((d, i) => (
        <div key={i} style={{ position:'absolute', left:d.left, top:0, display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{
            width: d.width, background:'var(--blood)', borderRadius:'0 0 1px 1px',
            animation: `drip ${d.dur}s ease ${d.delay}s infinite`,
            height: d.height, opacity: 0,
          }} />
          <div style={{
            width: d.dropSize, height: d.dropSize * 1.3,
            background:'var(--blood)', borderRadius:'50% 50% 60% 60%',
            marginTop: -1, opacity: 0,
            animation: `drip ${d.dur}s ease ${d.delay + d.dur * 0.85}s infinite`,
            filter:'blur(0.5px)',
          }} />
        </div>
      ))}
    </div>
  );
}

// ─── Particle embers ─────────────────────────────────────────────────────────
function EmberParticles({ x, y, count = 6 }) {
  const embers = useRef([]);
  if (!embers.current.length) {
    embers.current = Array.from({ length: count }, (_, i) => ({
      x2: (Math.random() - 0.5) * 60,
      x3: (Math.random() - 0.5) * 40,
      dur: 1.5 + Math.random() * 2,
      delay: Math.random() * 1.5,
      size: 2 + Math.random() * 3,
      color: Math.random() > 0.5 ? 'var(--blood)' : 'var(--gold)',
    }));
  }
  return (
    <div style={{ position:'absolute', left:x, top:y, pointerEvents:'none' }}>
      {embers.current.map((e, i) => (
        <div key={i} style={{
          position:'absolute', width:e.size, height:e.size, borderRadius:'50%',
          background:e.color, filter:'blur(1px)',
          '--x2': `${e.x2}px`, '--x3': `${e.x3}px`,
          animation:`emberFloat ${e.dur}s ease ${e.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Floating ambient particles ───────────────────────────────────────────────
function AmbientParticles() {
  const particles = useRef([]);
  if (!particles.current.length) {
    particles.current = Array.from({ length: 30 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top:  `${20 + Math.random() * 70}%`,
      size: 1 + Math.random() * 2.5,
      dur:  4 + Math.random() * 8,
      delay: Math.random() * 8,
      drift: `${(Math.random()-0.5) * 50}px`,
      color: [
        'rgba(192,20,28,0.6)', 'rgba(201,168,76,0.4)',
        'rgba(139,92,246,0.4)', 'rgba(42,127,212,0.3)',
      ][Math.floor(Math.random() * 4)],
    }));
  }
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1, overflow:'hidden' }}>
      {particles.current.map((p, i) => (
        <div key={i} style={{
          position:'absolute', left:p.left, top:p.top,
          width:p.size, height:p.size, borderRadius:'50%',
          background:p.color, filter:'blur(0.5px)',
          '--drift': p.drift,
          animation:`floatParticle ${p.dur}s ease ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Heartbeat line ───────────────────────────────────────────────────────────
function HeartbeatLine() {
  return (
    <div style={{ width:'100%', overflow:'hidden', padding:'0 24px', pointerEvents:'none' }}>
      <svg viewBox="0 0 800 60" preserveAspectRatio="none" style={{ width:'100%', height:60, display:'block' }}>
        <path
          d="M0,30 L120,30 L140,30 L150,8 L165,52 L180,15 L192,42 L200,30 L250,30 L265,30 L275,5 L290,55 L305,12 L318,45 L328,30 L420,30 L435,30 L445,10 L458,50 L470,18 L482,42 L490,30 L600,30 L615,30 L625,8 L638,52 L650,15 L662,42 L670,30 L800,30"
          fill="none" stroke="rgba(192,20,28,0.35)" strokeWidth="1.5"
          strokeDasharray="1000" strokeDashoffset="1000"
          style={{ animation:'lineTrace 4s ease 0.5s both' }}
        />
        <path
          d="M0,30 L120,30 L140,30 L150,8 L165,52 L180,15 L192,42 L200,30 L250,30 L265,30 L275,5 L290,55 L305,12 L318,45 L328,30 L420,30 L435,30 L445,10 L458,50 L470,18 L482,42 L490,30 L600,30 L615,30 L625,8 L638,52 L650,15 L662,42 L670,30 L800,30"
          fill="none" stroke="rgba(192,20,28,0.08)" strokeWidth="6"
          strokeDasharray="1000" strokeDashoffset="1000"
          style={{ animation:'lineTrace 4s ease 0.5s both' }}
        />
      </svg>
    </div>
  );
}

// ─── Glitch text ─────────────────────────────────────────────────────────────
function GlitchText({ children, style = {} }) {
  return (
    <span style={{ position:'relative', display:'inline-block', ...style }}>
      {children}
      <span aria-hidden style={{
        position:'absolute', inset:0, color:'#ff1a24', pointerEvents:'none',
        animation:'glitch1 7s ease infinite', clipPath:'inset(0 0 100% 0)',
      }}>{children}</span>
      <span aria-hidden style={{
        position:'absolute', inset:0, color:'var(--sapphire)', pointerEvents:'none',
        animation:'glitch2 7s ease 0.3s infinite', clipPath:'inset(0 0 100% 0)',
      }}>{children}</span>
    </span>
  );
}

// ─── Smoke puff ───────────────────────────────────────────────────────────────
function SmokePuffs() {
  const puffs = useRef([]);
  if (!puffs.current.length) {
    puffs.current = Array.from({ length: 5 }, (_, i) => ({
      left: `${10 + i * 20}%`,
      size: 40 + Math.random() * 40,
      dur: 5 + Math.random() * 4,
      delay: i * 1.2,
    }));
  }
  return (
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:120, pointerEvents:'none', overflow:'hidden' }}>
      {puffs.current.map((p, i) => (
        <div key={i} style={{
          position:'absolute', left:p.left, bottom:0,
          width:p.size, height:p.size, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(192,20,28,0.06) 0%, transparent 70%)',
          animation:`smokeRise ${p.dur}s ease ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.delay || 0;
          setTimeout(() => e.target.classList.add('visible'), Number(delay));
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const DiscordIcon = ({ size=20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);
const SkullIcon  = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a9 9 0 0 1 9 9c0 3.18-1.65 5.97-4.14 7.6L16 21H8l-.86-2.4A9 9 0 0 1 3 11a9 9 0 0 1 9-9z"/><path d="M9 17v2M15 17v2M9 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0M13 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/></svg>;
const ShieldIcon = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const SearchIcon = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const ZapIcon    = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const UsersIcon  = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MoonIcon   = ({size=18}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

// ─── Screenshot frame ─────────────────────────────────────────────────────────
function ScreenshotFrame({ src, label, index }) {
  return (
    <div className="screenshot-frame reveal-scale" data-delay={index * 80}>
      <div className="screenshot-chrome">
        <div className="screenshot-dot" style={{ background: '#ff5f57' }} />
        <div className="screenshot-dot" style={{ background: '#febc2e' }} />
        <div className="screenshot-dot" style={{ background: '#28c840' }} />
        <div className="screenshot-bar">
          <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
            mafia.app / {label}
          </span>
        </div>
      </div>
      <img src={src} alt={label} draggable={false} />
    </div>
  );
}

const SCREENSHOTS = [
  { src: '/screenshots/night.png',  label: 'night' },
  { src: '/screenshots/dawn.png',   label: 'dawn' },
  { src: '/screenshots/day.png',    label: 'day' },
  { src: '/screenshots/role.png',   label: 'role-reveal' },
  { src: '/screenshots/lobby.png',  label: 'lobby' },
];

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({ onEnter }) {
  useScrollReveal();
  const trackRef   = useRef(null);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollLeft = useRef(0);
  const heroRef    = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax
  useEffect(() => {
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x: nx, y: ny });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const onMouseDown = (e) => { isDragging.current = true; startX.current = e.pageX - trackRef.current.offsetLeft; scrollLeft.current = trackRef.current.scrollLeft; };
  const onMouseMove = (e) => { if (!isDragging.current) return; const x = e.pageX - trackRef.current.offsetLeft; trackRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.2; };
  const onMouseUp   = ()  => { isDragging.current = false; };

  const roles = [
    { label: 'Mafia',       color: 'var(--blood)',    icon: <SkullIcon /> },
    { label: 'Godfather',   color: 'var(--blood)',    icon: <SkullIcon /> },
    { label: 'Doctor',      color: 'var(--emerald)',  icon: <ShieldIcon /> },
    { label: 'Detective',   color: 'var(--sapphire)', icon: <SearchIcon /> },
    { label: 'Sheriff',     color: 'var(--emerald)',  icon: <SearchIcon /> },
    { label: 'Arsonist',    color: 'var(--amethyst)', icon: <ZapIcon /> },
    { label: 'Jester',      color: 'var(--gold)',     icon: <MoonIcon /> },
    { label: 'Vigilante',   color: 'var(--amethyst)', icon: <ZapIcon /> },
    { label: 'Bodyguard',   color: '#D97706',          icon: <ShieldIcon /> },
    { label: 'Blackmailer', color: 'var(--blood)',    icon: <SkullIcon /> },
    { label: '+ 10 more',   color: 'var(--text-dim)', icon: null },
  ];

  const features = [
    { icon: <UsersIcon />,  accent: 'var(--blood)',    title: 'Up to 40 Players',   desc: 'Host sprawling games with large groups. Every seat has a role, every night has a target.' },
    { icon: <MoonIcon />,   accent: 'var(--sapphire)', title: 'Real-Time Gameplay', desc: 'Powered by live sync — votes, night actions, and investigations resolve instantly across all devices.' },
    { icon: <SkullIcon />,  accent: 'var(--amethyst)', title: '20 Unique Roles',    desc: 'From the scheming Blackmailer to the suicidal Jester, every game is a different cast of suspects.' },
    { icon: <SearchIcon />, accent: 'var(--emerald)',  title: 'Deep Investigation', desc: 'Trackers follow footsteps. Lookouts watch houses. Spies intercept mafia plans.' },
    { icon: <ZapIcon />,    accent: '#D97706',          title: 'Risky Guesses',      desc: "Name someone's exact role during the day. Correct? They die. Wrong? You do." },
    { icon: <ShieldIcon />, accent: 'var(--blood)',    title: 'Noir Atmosphere',    desc: 'Blood-red dawn screens, last wills read aloud, role cards that flip in candlelight.' },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <GlobalStyles />
      <Scanline />
      <AmbientParticles />

      {/* Ambient glows — parallax */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse 80% 50% at ${50 + mousePos.x * 8}% ${30 + mousePos.y * 8}%, rgba(192,20,28,0.07) 0%, transparent 60%),
                     radial-gradient(ellipse 60% 40% at ${80 + mousePos.x * -6}% ${80 + mousePos.y * -4}%, rgba(139,92,246,0.06) 0%, transparent 60%)`,
        transition: 'background 0.1s',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)',
        animation: 'vignetteFlicker 6s ease-in-out infinite',
      }} />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,10,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        animation: 'navSlide 0.6s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'var(--blood)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(192,20,28,0.5)', color: 'white',
            animation: 'borderGlow 3s ease-in-out infinite',
          }}>
            <SkullIcon size={14} />
          </div>
          <span className="font-display" style={{ fontSize: 17, animation:'textFlicker 12s ease infinite' }}>Mafia</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-ghost hide-mobile" style={{ padding: '8px 18px' }} onClick={() => document.getElementById('how-to-play')?.scrollIntoView({ behavior: 'smooth' })}>How to Play</button>
          <button className="btn-blood" style={{ padding: '9px 20px' }} onClick={onEnter}>Play Now</button>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', zIndex: 3, textAlign: 'center' }}>
        {/* Blood drips from top */}
        <BloodDrips count={22} />
        <SmokePuffs />

        {/* Parallax orbs */}
        <div style={{
          position:'absolute', width:600, height:600, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(192,20,28,0.04) 0%, transparent 70%)',
          left:'50%', top:'50%',
          transform:`translate(calc(-50% + ${mousePos.x * 20}px), calc(-50% + ${mousePos.y * 20}px))`,
          transition:'transform 0.3s ease-out', pointerEvents:'none',
        }} />

        <div className="fade-up" style={{ animationDelay: '0ms' }}>
          <span style={{
            fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase',
            color:'var(--blood)', background:'rgba(192,20,28,0.1)',
            border:'1px solid rgba(192,20,28,0.25)', borderRadius:100,
            padding:'5px 16px', display:'inline-block', marginBottom:32,
            animation:'borderGlow 3s ease-in-out infinite, textFlicker 15s ease infinite',
          }}>
            The Night Has Begun
          </span>
        </div>

        <h1 className="font-display fade-up" style={{ fontSize:'clamp(52px, 10vw, 104px)', fontWeight:900, lineHeight:0.9, letterSpacing:'-0.02em', marginBottom:8, animationDelay:'80ms' }}>Trust No</h1>
        <h1 className="font-display fade-up" style={{
          fontSize:'clamp(52px, 10vw, 104px)', fontWeight:900, fontStyle:'italic', lineHeight:0.9,
          letterSpacing:'-0.02em', marginBottom:40, animationDelay:'140ms',
          background:'linear-gradient(135deg, var(--blood) 0%, #ff4d55 50%, var(--blood) 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          position:'relative',
        }}>
          <GlitchText>One.</GlitchText>
        </h1>

        <p className="font-body fade-up" style={{ fontSize:'clamp(17px, 2.5vw, 22px)', color:'var(--text-mid)', maxWidth:560, lineHeight:1.6, fontStyle:'italic', marginBottom:48, animationDelay:'200ms', animation:'fadeUp 0.7s ease 200ms both, textFlicker 20s ease 5s infinite' }}>
          A real-time social deduction game where the Mafia hides in plain sight. Deduce, deceive, and survive — or die trying.
        </p>

        <div className="fade-up" style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', animationDelay:'280ms' }}>
          <button className="btn-blood" style={{ padding:'14px 32px', fontSize:12 }} onClick={onEnter}>
            Enter the Game
            <EmberParticles x="50%" y="100%" count={4} />
          </button>
          <button className="btn-ghost" style={{ padding:'14px 28px' }} onClick={() => document.getElementById('screenshots')?.scrollIntoView({ behavior:'smooth' })}>See Screenshots</button>
        </div>

        {/* Role pills */}
        <div className="fade-up" style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:64, maxWidth:640, animationDelay:'360ms' }}>
          {roles.map((r, idx) => (
            <span key={r.label} className="role-pill" style={{
              color:r.color, borderColor:r.color+'30', background:r.color+'0a',
              animationDelay:`${360 + idx * 40}ms`,
              animation:`fadeUp 0.5s ease ${360 + idx * 40}ms both, pillFloat ${3 + idx * 0.3}s ease ${idx * 0.2}s infinite`,
            }}>
              {r.icon && <span style={{ opacity:0.8 }}>{r.icon}</span>}
              {r.label}
            </span>
          ))}
        </div>

        {/* Floating cards — parallax */}
        <div className="hide-mobile" style={{
          position:'absolute', right:'max(40px, 8vw)', top:'50%',
          width:90, height:130, borderRadius:14,
          background:'linear-gradient(135deg, #16161f, #0e0c14)',
          border:'1px solid rgba(192,20,28,0.2)',
          boxShadow:'0 20px 60px rgba(0,0,0,0.8)',
          display:'flex', alignItems:'center', justifyContent:'center',
          animation:'cardFloat 5s ease-in-out infinite',
          color:'var(--blood)', opacity:0.7,
          transform:`translateY(-50%) translateX(${mousePos.x * -15}px) translateY(${mousePos.y * -10}px)`,
          transition:'transform 0.4s ease-out',
        }}>
          <SkullIcon size={24} />
          <div style={{ position:'absolute', inset:0, borderRadius:14, background:'radial-gradient(circle at 50% 0%, rgba(192,20,28,0.15), transparent 60%)' }} />
        </div>
        <div className="hide-mobile" style={{
          position:'absolute', left:'max(40px, 8vw)', top:'45%',
          width:76, height:110, borderRadius:12,
          background:'linear-gradient(135deg, #16161f, #0e0c14)',
          border:'1px solid rgba(42,127,212,0.2)',
          boxShadow:'0 20px 60px rgba(0,0,0,0.8)',
          display:'flex', alignItems:'center', justifyContent:'center',
          animation:'cardFloat2 6s ease-in-out infinite',
          color:'var(--sapphire)', opacity:0.5,
          transform:`translateY(-50%) translateX(${mousePos.x * 12}px) translateY(${mousePos.y * 8}px)`,
          transition:'transform 0.5s ease-out',
        }}>
          <SearchIcon size={20} />
        </div>

        {/* Extra floating card */}
        <div className="hide-mobile" style={{
          position:'absolute', right:'max(160px, 16vw)', top:'25%',
          width:56, height:80, borderRadius:10,
          background:'linear-gradient(135deg, #16161f, #0e0c14)',
          border:'1px solid rgba(201,168,76,0.15)',
          display:'flex', alignItems:'center', justifyContent:'center',
          animation:'cardFloat2 7s ease-in-out 1s infinite',
          color:'var(--gold)', opacity:0.35,
          transform:`translateX(${mousePos.x * -8}px) translateY(${mousePos.y * 6}px)`,
          transition:'transform 0.6s ease-out',
        }}>
          <MoonIcon size={16} />
        </div>

        {/* Scroll hint */}
        <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, animation:'pulse 2s ease-in-out infinite' }}>
          <span style={{ fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-dim)' }}>Scroll</span>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="var(--text-dim)" strokeWidth="1.5"><rect x="1" y="1" width="10" height="18" rx="5"/><path d="M6 5v4" strokeLinecap="round"/></svg>
        </div>
      </section>

      {/* Heartbeat separator */}
      <div style={{ position:'relative', zIndex:3, padding:'0' }}>
        <HeartbeatLine />
      </div>

      {/* Screenshots */}
      <section id="screenshots" style={{ padding:'80px 0', position:'relative', zIndex:3 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-divider reveal" />
            <h2 className="font-display reveal" data-delay="100" style={{ fontSize:'clamp(28px, 4vw, 42px)', marginBottom:12 }}>The City Never Sleeps</h2>
            <p className="font-body reveal" data-delay="180" style={{ color:'var(--text-mid)', fontSize:18, fontStyle:'italic' }}>Every night is a crime scene. Every day is a trial.</p>
          </div>
        </div>
        <div ref={trackRef} className="screenshots-track" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
          {SCREENSHOTS.map((s, i) => <ScreenshotFrame key={i} src={s.src} label={s.label} index={i} />)}
        </div>
        <p style={{ textAlign:'center', fontFamily:'DM Mono', fontSize:9, color:'var(--text-dim)', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:4, padding:'0 24px' }}>
          Drag to scroll
        </p>
      </section>

      {/* Heartbeat separator 2 */}
      <div style={{ position:'relative', zIndex:3 }}>
        <HeartbeatLine />
      </div>

      {/* How to Play */}
      <section id="how-to-play" style={{ padding:'80px 24px', position:'relative', zIndex:3 }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div className="section-divider reveal" />
            <h2 className="font-display reveal" data-delay="80" style={{ fontSize:'clamp(28px, 4vw, 42px)', marginBottom:12 }}>How It Works</h2>
            <p className="font-body reveal" data-delay="160" style={{ color:'var(--text-mid)', fontSize:18, fontStyle:'italic' }}>Simple to learn. Impossible to master.</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {[
              { phase:'01', label:'Roles Assigned', color:'var(--gold)',     desc:'Each player receives a secret role card. Mafia know each other. The town does not.' },
              { phase:'02', label:'Night Falls',    color:'var(--amethyst)', desc:'Every player acts in secret — the Mafia picks a target, the Doctor heals, the Detective investigates.' },
              { phase:'03', label:'Dawn Breaks',    color:'var(--blood)',    desc:"Deaths are revealed at dawn. Wills are read. The town begins to piece together last night's events." },
              { phase:'04', label:'Town Debates',   color:'var(--sapphire)', desc:'Players argue, accuse, and vote to execute a suspect. Jesters hope to be lynched. Mafia deflects.' },
              { phase:'05', label:'Victory',        color:'var(--emerald)',  desc:'Town wins by eliminating all Mafia. Mafia wins by outnumbering town. Neutrals have their own dark agendas.' },
            ].map((step, i) => (
              <div key={i} className="reveal" data-delay={i * 90} style={{
                display:'flex', gap:24, alignItems:'flex-start',
                padding:'24px 0', borderBottom:i < 4 ? '1px solid var(--noir-border)' : 'none',
              }}>
                <div style={{
                  flexShrink:0, width:48, height:48, borderRadius:12,
                  border:`1px solid ${step.color}30`, background:`${step.color}08`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.3s',
                }}>
                  <span style={{ fontFamily:'DM Mono', fontSize:11, color:step.color }}>{step.phase}</span>
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize:22, marginBottom:6 }}>{step.label}</h3>
                  <p className="font-body" style={{ color:'var(--text-mid)', fontSize:16, lineHeight:1.6, fontStyle:'italic' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'80px 24px', position:'relative', zIndex:3 }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div className="section-divider reveal" />
            <h2 className="font-display reveal" data-delay="80" style={{ fontSize:'clamp(28px, 4vw, 42px)', marginBottom:12 }}>Built for the Table</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card reveal-scale" data-delay={i * 70}>
                <div style={{
                  width:40, height:40, borderRadius:10, border:`1px solid ${f.accent}30`,
                  background:`${f.accent}0c`, display:'flex', alignItems:'center',
                  justifyContent:'center', color:f.accent, marginBottom:16,
                  transition:'transform 0.3s, box-shadow 0.3s',
                }}>
                  {f.icon}
                </div>
                <h3 className="font-display" style={{ fontSize:20, marginBottom:8 }}>{f.title}</h3>
                <p className="font-body" style={{ color:'var(--text-mid)', fontSize:15, lineHeight:1.65, fontStyle:'italic' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 24px 120px', position:'relative', zIndex:3 }}>
        <div style={{ maxWidth:640, margin:'0 auto', textAlign:'center' }}>
          <div className="reveal-scale" style={{
            background:'var(--noir-card)', border:'1px solid rgba(192,20,28,0.2)',
            borderRadius:24, padding:'clamp(36px, 6vw, 64px)',
            position:'relative', overflow:'hidden',
            animation:'ctaGlow 4s ease-in-out infinite',
          }}>
            <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(192,20,28,0.08) 0%, transparent 70%)' }} />
            {/* Animated corner runes */}
            <div style={{ position:'absolute', top:12, right:12, width:32, height:32, opacity:0.15, animation:'runeRotate 8s linear infinite', color:'var(--blood)' }}>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1"><polygon points="16,2 30,30 2,30"/></svg>
            </div>
            <div style={{ position:'absolute', bottom:12, left:12, width:24, height:24, opacity:0.1, animation:'runeRotate 12s linear reverse infinite', color:'var(--gold)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
            </div>
            <div style={{ position:'relative' }}>
              <p style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--blood)', marginBottom:20, animation:'textFlicker 10s ease 2s infinite' }}>The City Awaits</p>
              <h2 className="font-display" style={{ fontSize:'clamp(28px, 4vw, 40px)', marginBottom:16, lineHeight:1.1 }}>
                Are you the killer,<br /><span style={{ fontStyle:'italic', color:'var(--text-mid)' }}>or the detective?</span>
              </h2>
              <p className="font-body" style={{ color:'var(--text-mid)', fontSize:17, fontStyle:'italic', marginBottom:32, lineHeight:1.6 }}>Log in with Discord and join a game in seconds.</p>
              <button className="btn-discord" style={{ width:'100%', padding:'15px 24px', fontSize:13, borderRadius:12 }} onClick={onEnter}>
                <DiscordIcon size={22} />Sign In with Discord
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop:'1px solid var(--noir-border)', padding:'28px 32px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:12, position:'relative', zIndex:3,
        animation:'footerFade 0.8s ease both',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--blood)' }}>
          <SkullIcon size={14} />
          <span className="font-display" style={{ fontSize:14, color:'var(--text-dim)' }}>Mafia</span>
        </div>
        <p style={{ fontFamily:'DM Mono', fontSize:9, color:'var(--text-dim)', letterSpacing:'0.1em', animation:'textFlicker 18s ease 7s infinite' }}>THE CITY NEVER FORGETS</p>
      </footer>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onBack }) {
  const [hovering, setHovering] = useState(false);
  const handleDiscordLogin = () => { window.location.href = DISCORD_OAUTH_URL; };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <GlobalStyles />
      <AmbientParticles />
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(88,101,242,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 20% 80%, rgba(192,20,28,0.05) 0%, transparent 60%)' }} />

      <nav style={{ padding:'20px 28px', display:'flex', alignItems:'center', gap:10, position:'relative', zIndex:10, animation:'navSlide 0.6s ease both' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:8, background:'transparent', border:'none', cursor:'pointer', color:'var(--text-dim)', fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', transition:'color 0.2s', padding:0 }} onMouseEnter={e => e.currentTarget.style.color='var(--text-mid)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-dim)'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <span style={{ color:'var(--text-dim)', opacity:0.4 }}>·</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:22, height:22, borderRadius:6, background:'var(--blood)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 12px rgba(192,20,28,0.4)', color:'white', animation:'borderGlow 3s ease-in-out infinite' }}><SkullIcon size={12} /></div>
          <span className="font-display" style={{ fontSize:15 }}>Mafia</span>
        </div>
      </nav>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 24px', position:'relative', zIndex:1 }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          <div className="glass-card fade-up" style={{ padding:'clamp(32px, 6vw, 52px)', textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(to right, transparent, rgba(88,101,242,0.4), transparent)', animation:'shimmer 3s ease infinite', backgroundSize:'200% 100%' }} />
            <BloodDrips count={6} />
            <div style={{ width:64, height:64, borderRadius:18, background:'rgba(88,101,242,0.1)', border:'1px solid rgba(88,101,242,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', boxShadow:'0 8px 32px rgba(88,101,242,0.15)', color:'#5865F2', animation:'borderGlow 3s ease-in-out infinite' }}>
              <DiscordIcon size={28} />
            </div>
            <h1 className="font-display" style={{ fontSize:32, marginBottom:8, lineHeight:1.1 }}>Enter the City</h1>
            <p className="font-body" style={{ color:'var(--text-mid)', fontSize:17, fontStyle:'italic', lineHeight:1.6, marginBottom:36 }}>
              Sign in with Discord to join a game. Your username becomes your alias — choose your enemies wisely.
            </p>
            <button className="btn-discord" style={{ width:'100%', padding:'15px 20px', fontSize:13, borderRadius:12, marginBottom:20, transform:hovering ? 'translateY(-2px)' : 'translateY(0)' }} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onClick={handleDiscordLogin}>
              <DiscordIcon size={22} />Continue with Discord
            </button>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--noir-border)', borderRadius:10, padding:'14px 16px', textAlign:'left' }}>
              <p style={{ fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:10 }}>What we access</p>
              {[
                { icon:'👤', text:'Your Discord username (used as your in-game alias)' },
                { icon:'🔒', text:'Read-only. We never post on your behalf.' },
                { icon:'🚫', text:'No email, no DMs, no server access.' },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:i < 2 ? 8 : 0 }}>
                  <span style={{ fontSize:13, flexShrink:0, marginTop:1 }}>{item.icon}</span>
                  <span className="font-body" style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ textAlign:'center', fontFamily:'DM Mono', fontSize:9, color:'var(--text-dim)', letterSpacing:'0.08em', marginTop:20, lineHeight:1.7, animation:'fadeIn 1s ease 0.8s both' }}>
            By signing in you agree to not cheat, not metagame,<br />and to accept your role with dignity.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Discord Callback ─────────────────────────────────────────────────────────
function DiscordCallback({ onSuccess }) {
  const [status, setStatus] = useState('loading');
  const [error, setError]   = useState('');

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    if (!accessToken) { setStatus('error'); setError('No access token received from Discord.'); return; }
    fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => {
        if (data.code) throw new Error(data.message || 'Discord API error');
        localStorage.setItem('discord_username', data.username);
        localStorage.setItem('discord_id', data.id);
        if (data.avatar) localStorage.setItem('discord_avatar', data.avatar);
        localStorage.setItem('discord_token', accessToken);
        onSuccess?.(data);
      })
      .catch(err => { setStatus('error'); setError(err.message || 'Authentication failed.'); });
  }, []);

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--noir-black)', flexDirection:'column', gap:16 }}>
      <GlobalStyles />
      {status === 'loading' ? (
        <>
          <div style={{ width:40, height:40, borderRadius:'50%', border:'2px solid rgba(88,101,242,0.2)', borderTop:'2px solid #5865F2', animation:'spin 0.8s linear infinite' }} />
          <p style={{ fontFamily:'DM Mono', fontSize:11, color:'var(--text-dim)', letterSpacing:'0.15em', textTransform:'uppercase' }}>Verifying identity...</p>
        </>
      ) : (
        <div style={{ background:'var(--noir-card)', border:'1px solid rgba(192,20,28,0.3)', borderRadius:16, padding:'32px 40px', textAlign:'center', maxWidth:380, animation:'fadeUp 0.5s ease both' }}>
          <p style={{ color:'var(--blood)', fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.1em', marginBottom:10 }}>Authentication Failed</p>
          <p style={{ color:'var(--text-mid)', fontSize:15, fontStyle:'italic' }}>{error}</p>
          <button className="btn-ghost" style={{ marginTop:20, padding:'10px 24px', width:'100%' }} onClick={() => window.location.href = '/'}>Return Home</button>
        </div>
      )}
    </div>
  );
}

// ─── Route wrappers ───────────────────────────────────────────────────────────
function LandingRoute()  { const nav = useNavigate(); return <LandingPage onEnter={() => nav('/login')} />; }
function LoginRoute()    { const nav = useNavigate(); return <LoginPage onBack={() => nav('/')} />; }
function CallbackRoute() { const nav = useNavigate(); return <DiscordCallback onSuccess={() => nav('/lobby')} />; }

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<LandingRoute />} />
        <Route path="/login"            element={<LoginRoute />} />
        <Route path="/discord-callback" element={<CallbackRoute />} />
        <Route path="/lobby"            element={<MafiaGame />} />
        <Route path="*"                 element={<LandingRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
