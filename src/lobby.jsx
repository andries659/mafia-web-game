import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Skull, Cross, Search, Moon, Sun, 
  MessageSquare, Users, Crown, Check, Shield, AlertCircle, Target, Zap, Ghost, Sword, ChevronDown
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, updateDoc, onSnapshot, arrayUnion, getDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBfkGWX6ZdxVXl-hKOvdVQf-dCELcvxSlc",
  authDomain: "mafia-game-1b827.firebaseapp.com",
  projectId: "mafia-game-1b827",
  storageBucket: "mafia-game-1b827.firebasestorage.app",
  messagingSenderId: "519375967006",
  appId: "1:519375967006:web:1a5def7e6a82710f94af0f",
  measurementId: "G-7SQNKCDMFB"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mafia-default-app';

const getGameRef = (gameCode) => doc(db, 'artifacts', appId, 'public', 'data', 'mafia_games', gameCode.toUpperCase());

const MAFIA_ROLES = ['mafia', 'godfather', 'framer', 'kidnapper', 'janitor'];
const isMafiaRole = (role) => MAFIA_ROLES.includes(role);

const AVATARS = [
  { id: 'fedora',    label: 'The Don',       svg: `<circle cx="50" cy="50" r="50" fill="#1a0a0a"/><ellipse cx="50" cy="64" rx="22" ry="18" fill="#c8a882"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#d4b896"/><ellipse cx="43" cy="53" rx="5" ry="6" fill="#8a6a4a"/><ellipse cx="57" cy="53" rx="5" ry="6" fill="#8a6a4a"/><circle cx="43" cy="53" r="3" fill="#1a1008"/><circle cx="57" cy="53" r="3" fill="#1a1008"/><path d="M44 64 Q50 69 56 64" stroke="#a07850" stroke-width="1.5" fill="none" stroke-linecap="round"/><rect x="28" y="30" width="44" height="8" rx="3" fill="#1a1008"/><path d="M22 38 Q50 32 78 38" stroke="#0d0806" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M36 38 Q50 24 64 38" fill="#141010"/>` },
  { id: 'veil',      label: 'The Ghost',     svg: `<circle cx="50" cy="50" r="50" fill="#0a0a1a"/><ellipse cx="50" cy="64" rx="22" ry="18" fill="#e8dcc8"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#f0e8d8"/><ellipse cx="43" cy="53" rx="4" ry="5" fill="#6a8aaa"/><ellipse cx="57" cy="53" rx="4" ry="5" fill="#6a8aaa"/><circle cx="43" cy="53" r="2.5" fill="#0a1018"/><circle cx="57" cy="53" r="2.5" fill="#0a1018"/><path d="M45 65 Q50 68 55 65" stroke="#c0a888" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M28 30 Q50 18 72 30 Q70 50 50 48 Q30 50 28 30Z" fill="#f0f0f0" opacity="0.9"/><path d="M30 40 Q50 55 70 40" stroke="rgba(180,180,200,0.3)" stroke-width="2" fill="none"/>` },
  { id: 'detective', label: 'The Eye',       svg: `<circle cx="50" cy="50" r="50" fill="#0a100a"/><ellipse cx="50" cy="64" rx="22" ry="18" fill="#c8a872"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#d4b888"/><path d="M37 52 Q43 47 49 52" stroke="#604820" stroke-width="1.8" fill="none"/><path d="M51 52 Q57 47 63 52" stroke="#604820" stroke-width="1.8" fill="none"/><ellipse cx="43" cy="54" rx="4" ry="5" fill="#4a6830"/><ellipse cx="57" cy="54" rx="4" ry="5" fill="#4a6830"/><circle cx="43" cy="54" r="2.5" fill="#0a1008"/><circle cx="57" cy="54" r="2.5" fill="#0a1008"/><path d="M45 65 Q50 69 55 65" stroke="#a07848" stroke-width="1.5" fill="none"/><rect x="30" y="30" width="40" height="10" rx="4" fill="#4a3010"/><path d="M24 40 Q50 35 76 40" stroke="#3a2008" stroke-width="5" fill="none" stroke-linecap="round"/>` },
  { id: 'scar',      label: 'The Knife',     svg: `<circle cx="50" cy="50" r="50" fill="#120808"/><ellipse cx="50" cy="64" rx="22" ry="18" fill="#b89070"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#c4a080"/><ellipse cx="43" cy="53" rx="5" ry="6" fill="#784830"/><ellipse cx="57" cy="53" rx="5" ry="6" fill="#784830"/><circle cx="43" cy="53" r="3" fill="#100806"/><circle cx="57" cy="53" r="3" fill="#100806"/><path d="M44 65 Q50 70 56 65" stroke="#985840" stroke-width="1.5" fill="none"/><path d="M60 40 Q62 54 60 66" stroke="#900000" stroke-width="2.5" fill="none" opacity="0.65" stroke-linecap="round"/><path d="M32 28 Q34 35 32 45" stroke="#1a1010" stroke-width="8" stroke-linecap="round" fill="none"/>` },
  { id: 'beret',     label: 'The Artist',    svg: `<circle cx="50" cy="50" r="50" fill="#080a10"/><ellipse cx="50" cy="64" rx="22" ry="18" fill="#d4b090"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#e0c0a0"/><ellipse cx="43" cy="53" rx="4" ry="5" fill="#5a4080"/><ellipse cx="57" cy="53" rx="4" ry="5" fill="#5a4080"/><circle cx="43" cy="53" r="2.5" fill="#080810"/><circle cx="57" cy="53" r="2.5" fill="#080810"/><path d="M44 65 Q50 70 56 65" stroke="#b08060" stroke-width="1.5" fill="none"/><ellipse cx="52" cy="28" rx="23" ry="13" fill="#1a1040"/><circle cx="66" cy="23" r="4" fill="#2a2060"/>` },
  { id: 'widow',     label: 'The Widow',     svg: `<circle cx="50" cy="50" r="50" fill="#08080a"/><ellipse cx="50" cy="64" rx="22" ry="18" fill="#e0c8b0"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#eed8c0"/><ellipse cx="43" cy="53" rx="4" ry="5" fill="#804858"/><ellipse cx="57" cy="53" rx="4" ry="5" fill="#804858"/><circle cx="43" cy="53" r="2.5" fill="#080608"/><circle cx="57" cy="53" r="2.5" fill="#080608"/><path d="M43 66 Q50 62 57 66" stroke="#c04060" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 26 Q50 14 72 26 L68 42 Q50 50 32 42Z" fill="#101010"/><path d="M50 50 L48 72 L52 72Z" fill="#101010" opacity="0.5"/>` },
  { id: 'priest',    label: 'The Priest',    svg: `<circle cx="50" cy="50" r="50" fill="#080810"/><ellipse cx="50" cy="64" rx="22" ry="18" fill="#d8c8b4"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#e4d4c0"/><ellipse cx="43" cy="53" rx="4" ry="5" fill="#506880"/><ellipse cx="57" cy="53" rx="4" ry="5" fill="#506880"/><circle cx="43" cy="53" r="2.5" fill="#080810"/><circle cx="57" cy="53" r="2.5" fill="#080810"/><path d="M44 65 Q50 69 56 65" stroke="#a89070" stroke-width="1.5" fill="none"/><rect x="30" y="18" width="40" height="22" rx="2" fill="#101018"/><rect x="44" y="22" width="12" height="3" rx="1" fill="#f0e0c0" opacity="0.5"/><rect x="47" y="19" width="6" height="9" rx="1" fill="#f0e0c0" opacity="0.4"/>` },
  { id: 'captain',   label: 'The Captain',  svg: `<circle cx="50" cy="50" r="50" fill="#080a0a"/><ellipse cx="50" cy="64" rx="22" ry="18" fill="#c0a880"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#ceb490"/><ellipse cx="43" cy="53" rx="5" ry="6" fill="#406080"/><ellipse cx="57" cy="53" rx="5" ry="6" fill="#406080"/><circle cx="43" cy="53" r="3" fill="#080a10"/><circle cx="57" cy="53" r="3" fill="#080a10"/><path d="M44 65 Q50 70 56 65" stroke="#906840" stroke-width="1.5" fill="none"/><path d="M26 40 Q50 28 74 40 L72 44 Q50 34 28 44Z" fill="#162030"/><rect x="32" y="26" width="36" height="16" rx="3" fill="#1a2838"/><circle cx="50" cy="32" r="3" fill="#d4a820" opacity="0.8"/>` },
  { id: 'mask',      label: 'The Mask',     svg: `<circle cx="50" cy="50" r="50" fill="#0a080a"/><ellipse cx="50" cy="60" rx="22" ry="20" fill="#c8a870"/><ellipse cx="50" cy="51" rx="20" ry="18" fill="#e0c8a0"/><ellipse cx="38" cy="47" rx="8" ry="10" fill="#f0e0c0" stroke="#c0a060" stroke-width="1"/><ellipse cx="62" cy="47" rx="8" ry="10" fill="#f0e0c0" stroke="#c0a060" stroke-width="1"/><ellipse cx="38" cy="47" rx="5" ry="7" fill="#101010"/><ellipse cx="62" cy="47" rx="5" ry="7" fill="#101010"/><path d="M28 47 L36 45" stroke="#c0a060" stroke-width="1.5"/><path d="M64 45 L72 47" stroke="#c0a060" stroke-width="1.5"/><path d="M42 62 Q50 59 58 62" stroke="#a07040" stroke-width="1.5" fill="none"/>` },
  { id: 'glasses',   label: 'The Scholar',  svg: `<circle cx="50" cy="50" r="50" fill="#080a08"/><ellipse cx="50" cy="64" rx="22" ry="18" fill="#c8b090"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#d4bc9c"/><circle cx="43" cy="53" r="7" fill="none" stroke="#403020" stroke-width="2"/><circle cx="57" cy="53" r="7" fill="none" stroke="#403020" stroke-width="2"/><ellipse cx="43" cy="53" rx="5" ry="5" fill="#203840" opacity="0.7"/><ellipse cx="57" cy="53" rx="5" ry="5" fill="#203840" opacity="0.7"/><circle cx="44" cy="51" r="1.5" fill="rgba(255,255,255,0.25)"/><circle cx="58" cy="51" r="1.5" fill="rgba(255,255,255,0.25)"/><line x1="36" y1="51" x2="28" y2="53" stroke="#403020" stroke-width="1.5"/><line x1="64" y1="51" x2="72" y2="53" stroke="#403020" stroke-width="1.5"/><path d="M44 65 Q50 69 56 65" stroke="#a08860" stroke-width="1.5" fill="none"/><path d="M35 36 Q50 28 65 36 Q62 43 50 41 Q38 43 35 36Z" fill="#201808"/>` },
  { id: 'curls',     label: 'The Dancer',   svg: `<circle cx="50" cy="50" r="50" fill="#0a0808"/><ellipse cx="50" cy="64" rx="22" ry="18" fill="#d8a888"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#e4b898"/><ellipse cx="43" cy="53" rx="4" ry="5" fill="#804848"/><ellipse cx="57" cy="53" rx="4" ry="5" fill="#804848"/><circle cx="43" cy="53" r="2.5" fill="#100808"/><circle cx="57" cy="53" r="2.5" fill="#100808"/><path d="M43 66 Q50 62 57 66" stroke="#c06060" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 32 Q24 20 30 16 Q38 26 36 40" fill="#200808"/><path d="M72 32 Q76 20 70 16 Q62 26 64 40" fill="#200808"/><path d="M30 28 Q50 18 70 28 Q68 44 50 46 Q32 44 30 28Z" fill="#2a1010"/>` },
  { id: 'bald',      label: 'The Enforcer', svg: `<circle cx="50" cy="50" r="50" fill="#100808"/><ellipse cx="50" cy="60" rx="24" ry="20" fill="#b89068"/><ellipse cx="50" cy="51" rx="20" ry="22" fill="#c8a078"/><ellipse cx="43" cy="51" rx="6" ry="7" fill="#684028"/><ellipse cx="57" cy="51" rx="6" ry="7" fill="#684028"/><circle cx="43" cy="51" r="4" fill="#100806"/><circle cx="57" cy="51" r="4" fill="#100806"/><path d="M44 64 Q50 60 56 64" stroke="#d04040" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M30 28 Q50 16 70 28 Q68 37 50 35 Q32 37 30 28Z" fill="#181008"/>` },
];

function Avatar({ avatarId, size = 40, dead = false, style = {} }) {
  const av = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, filter: dead ? 'grayscale(100%) brightness(0.35)' : 'none', transition: 'filter 0.4s ease', ...style }}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={size} height={size} dangerouslySetInnerHTML={{ __html: av.svg }} />
    </div>
  );
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
    :root {
      --noir-black: #08080A; --noir-deep: #0D0C10; --noir-card: #111118;
      --noir-border: rgba(255,255,255,0.06); --noir-border-hover: rgba(255,255,255,0.14);
      --blood: #C0141C; --blood-dim: rgba(192,20,28,0.15); --blood-glow: rgba(192,20,28,0.35);
      --gold: #C9A84C; --gold-dim: rgba(201,168,76,0.15); --text-bright: #F0EDE8;
      --text-mid: #9E9A94; --text-dim: #55524E;
      --emerald: #1DB36A; --sapphire: #2A7FD4; --amethyst: #8B5CF6; --amber: #D97706; --orange: #EA580C;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, #root { background: var(--noir-black); min-height: 100vh; font-family: 'Crimson Pro', Georgia, serif; color: var(--text-bright); }
    .font-display { font-family: 'Playfair Display', Georgia, serif; }
    .font-mono-custom { font-family: 'DM Mono', monospace; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
    .noise::after { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 9999; opacity: 0.4; }
    .glass-card { background: var(--noir-card); border: 1px solid var(--noir-border); border-radius: 16px; }
    .glass-card-hover:hover { border-color: var(--noir-border-hover); background: #13131C; }
    .blood-glow { box-shadow: 0 0 30px var(--blood-glow), 0 0 60px rgba(192,20,28,0.1); }
    .btn-blood { background: var(--blood); color: white; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.2s ease; position: relative; overflow: hidden; }
    .btn-blood::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%); }
    .btn-blood::after { content: ''; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%); background-size: 250% 100%; background-position: -200% center; transition: background-position 0.55s ease; }
    .btn-blood:hover::after { background-position: 200% center; }
    .btn-blood:hover { background: #D41820; transform: translateY(-1px); box-shadow: 0 8px 24px var(--blood-glow); }
    .btn-blood:active { transform: translateY(0); }
    .btn-ghost { background: transparent; color: var(--text-mid); font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; border: 1px solid var(--noir-border); cursor: pointer; transition: all 0.2s ease; }
    .btn-ghost:hover { border-color: var(--noir-border-hover); color: var(--text-bright); }
    .btn-sapphire { background: var(--sapphire); color: white; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.2s ease; position: relative; overflow: hidden; }
    .btn-sapphire::after { content: ''; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%); background-size: 250% 100%; background-position: -200% center; transition: background-position 0.55s ease; }
    .btn-sapphire:hover::after { background-position: 200% center; }
    .btn-sapphire:hover { background: #3A8FE4; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(42,127,212,0.4); }
    .noir-input { background: rgba(255,255,255,0.03); border: 1px solid var(--noir-border); color: var(--text-bright); font-family: 'Crimson Pro', serif; font-size: 16px; transition: all 0.25s ease; outline: none; }
    .noir-input::placeholder { color: var(--text-dim); }
    .noir-input:focus { border-color: rgba(192,20,28,0.4); background: rgba(192,20,28,0.05); box-shadow: 0 0 0 3px rgba(192,20,28,0.08); }
    .player-card { background: rgba(255,255,255,0.02); border: 1px solid var(--noir-border); border-radius: 10px; transition: all 0.2s ease; }
    .player-card:hover { border-color: var(--noir-border-hover); background: rgba(255,255,255,0.04); }
    .role-badge { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; }
    .phase-bar { background: var(--noir-card); border-bottom: 1px solid var(--noir-border); }
    .log-death { background: rgba(192,20,28,0.08); border-left: 2px solid var(--blood); }
    .log-normal { background: rgba(255,255,255,0.02); border-left: 2px solid rgba(255,255,255,0.1); }
    .chat-me { background: rgba(192,20,28,0.2); border: 1px solid rgba(192,20,28,0.3); }
    .chat-other { background: rgba(255,255,255,0.05); border: 1px solid var(--noir-border); }
    .chat-dead { background: rgba(255,255,255,0.03); border: 1px solid var(--noir-border); opacity: 0.6; }
    .chat-mafia-me { background: rgba(192,20,28,0.3); border: 1px solid rgba(192,20,28,0.5); }
    .chat-mafia-other { background: rgba(192,20,28,0.1); border: 1px solid rgba(192,20,28,0.25); }
    .divider-text { display: flex; align-items: center; gap: 12px; color: var(--text-dim); font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; }
    .divider-text::before, .divider-text::after { content: ''; flex: 1; height: 1px; background: var(--noir-border); }
    .stepper { display: flex; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid var(--noir-border); border-radius: 8px; overflow: hidden; }
    .stepper button { width: 32px; height: 32px; background: transparent; border: none; color: var(--text-mid); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .stepper button:hover { background: rgba(255,255,255,0.06); color: var(--text-bright); }
    .stepper span { width: 36px; text-align: center; font-family: 'DM Mono', monospace; font-size: 13px; color: var(--text-bright); border-left: 1px solid var(--noir-border); border-right: 1px solid var(--noir-border); }

    /* ── Sidebar: must not overflow the viewport ── */
    .desktop-sidebar {
      width: 300px; min-width: 300px;
      border-left: 1px solid var(--noir-border);
      display: flex; flex-direction: column;
      /* Do NOT set overflow-y here — children handle their own scroll */
      min-height: 0; /* critical for flex children to shrink */
    }

    /* ── Chat scroll container: scrolls ONLY inside itself ── */
    .chat-scroll-area {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      /* never bigger than the remaining sidebar space */
      min-height: 0;
    }

    .drawer-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 200; }
    .drawer-panel { position: fixed; bottom: 0; left: 0; right: 0; height: 80vh; background: var(--noir-card); border-top: 1px solid var(--noir-border); border-radius: 20px 20px 0 0; z-index: 201; display: flex; flex-direction: column; transform: translateY(100%); transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1); }
    .drawer-panel.open { transform: translateY(0); }
    .drawer-handle { width: 36px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; margin: 12px auto 8px; flex-shrink: 0; }
    .fab { display: none; position: fixed; bottom: 24px; right: 20px; width: 52px; height: 52px; border-radius: 50%; background: var(--noir-card); border: 1px solid var(--noir-border); align-items: center; justify-content: center; cursor: pointer; z-index: 150; box-shadow: 0 4px 20px rgba(0,0,0,0.5); transition: all 0.2s; }
    .fab:hover { border-color: var(--noir-border-hover); transform: scale(1.08); }
    .fab-mafia { border-color: rgba(192,20,28,0.4) !important; box-shadow: 0 4px 20px rgba(192,20,28,0.3) !important; }

    /* ── Keyframes ── */
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes spinnerMorph { 0% { border-radius: 50%; transform: rotate(0deg); } 50% { border-radius: 30%; transform: rotate(180deg) scale(1.1); } 100% { border-radius: 50%; transform: rotate(360deg); } }
    @keyframes pulse-blood { 0%, 100% { box-shadow: 0 0 0 0 rgba(192,20,28,0.4); } 50% { box-shadow: 0 0 0 8px rgba(192,20,28,0); } }
    .pulse-blood { animation: pulse-blood 2s ease infinite; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 0.4s ease forwards; }
    @keyframes skullBreathe { 0%,100% { transform: scale(1); box-shadow: 0 0 40px rgba(192,20,28,0.4), 0 0 80px rgba(192,20,28,0.15); } 50% { transform: scale(1.04); box-shadow: 0 0 56px rgba(192,20,28,0.65), 0 0 110px rgba(192,20,28,0.25); } }
    @keyframes skullIconFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 33% { transform: translateY(-3px) rotate(-3deg); } 66% { transform: translateY(-1px) rotate(2deg); } }
    @keyframes avatarPop { 0% { opacity: 0; transform: scale(0.7) translateY(8px); } 70% { transform: scale(1.06) translateY(-2px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes orbDrift { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-20px) scale(1.05); } 66% { transform: translate(-15px,15px) scale(0.97); } }
    @keyframes phaseBannerSlide { from { opacity: 0; transform: translateY(-60px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes phaseLabelPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
    @keyframes fogDrift { 0% { transform: translateX(-10%) scaleX(1); opacity: 0.07; } 50% { transform: translateX(5%) scaleX(1.04); opacity: 0.12; } 100% { transform: translateX(-10%) scaleX(1); opacity: 0.07; } }
    @keyframes fogDrift2 { 0% { transform: translateX(5%) scaleX(1); opacity: 0.05; } 50% { transform: translateX(-8%) scaleX(1.06); opacity: 0.09; } 100% { transform: translateX(5%) scaleX(1); opacity: 0.05; } }
    @keyframes playerCardIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes logEntrySlide { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes bubbleInLeft { from { opacity: 0; transform: translateX(-12px) scale(0.94); } to { opacity: 1; transform: translateX(0) scale(1); } }
    @keyframes bubbleInRight { from { opacity: 0; transform: translateX(12px) scale(0.94); } to { opacity: 1; transform: translateX(0) scale(1); } }
    @keyframes voteGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); } 50% { box-shadow: 0 0 0 6px rgba(201,168,76,0.25); } }
    @keyframes winIconPop { 0% { opacity: 0; transform: scale(0.3) rotate(-20deg); } 60% { transform: scale(1.15) rotate(4deg); } 80% { transform: scale(0.95) rotate(-2deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }
    @keyframes winTitleReveal { 0% { opacity: 0; letter-spacing: 0.3em; filter: blur(8px); } 100% { opacity: 1; letter-spacing: -0.01em; filter: blur(0); } }
    @keyframes playerRowIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes startBtnPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(192,20,28,0); } 50% { box-shadow: 0 0 0 8px rgba(192,20,28,0.18); } }
    @keyframes roleGlowBreathe { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
    @keyframes checkBounce { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.3); opacity: 1; } 80% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
    @keyframes bloodDrip { 0% { transform: scaleY(0); transform-origin: top; opacity: 0; } 30% { opacity: 1; } 100% { transform: scaleY(1); transform-origin: top; opacity: 1; } }
    @keyframes bloodPuddle { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); opacity: 0.7; } 100% { transform: scale(1); opacity: 0.5; } }
    @keyframes skullPulse { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes dawnFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes dawnSlideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes dawnSlideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes nameReveal { 0% { opacity: 0; letter-spacing: 0.5em; filter: blur(8px); } 100% { opacity: 1; letter-spacing: 0.04em; filter: blur(0); } }
    @keyframes willFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes peacefulGlow { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
    @keyframes vignetteIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes aliveDot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
    .night-fog-1 { position: fixed; bottom: 0; left: -10%; right: -10%; height: 260px; background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(60,0,80,0.12) 0%, transparent 70%); pointer-events: none; z-index: 0; animation: fogDrift 14s ease-in-out infinite; }
    .night-fog-2 { position: fixed; bottom: 0; left: -15%; right: -15%; height: 180px; background: radial-gradient(ellipse 70% 50% at 40% 100%, rgba(20,0,60,0.1) 0%, transparent 70%); pointer-events: none; z-index: 0; animation: fogDrift2 18s ease-in-out infinite; }
    .phase-bar { animation: phaseBannerSlide 0.45s cubic-bezier(0.22,1,0.36,1) both; }
    @media (max-width: 768px) { .desktop-sidebar { display: none !important; } .fab { display: flex; } .drawer-overlay.open { display: block; } }
    @media (min-width: 769px) { .fab { display: none !important; } }
  `}</style>
);

export default function MafiaGame() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [gameCode, setGameCode] = useState('');
  const defaultName = localStorage.getItem('discord_username') || '';
  const [playerName, setPlayerName] = useState(defaultName);
  const [selectedAvatar, setSelectedAvatar] = useState('fedora');
  const [error, setError] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { setError("Failed to authenticate."); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
    return () => unsubscribe();
  }, []);

  if (authLoading) return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: '100vh', background: 'var(--noir-black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.06)', borderTop: '2px solid var(--blood)', borderRight: '2px solid rgba(192,20,28,0.4)', animation: 'spinnerMorph 1.2s cubic-bezier(0.5,0,0.5,1) infinite' }} />
          <span style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: '0.2em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Connecting</span>
        </div>
      </div>
    </>
  );

  const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  const handleCreateGame = async () => {
    if (!playerName.trim()) return setError("Enter your name to continue.");
    const code = generateCode();
    try {
      await setDoc(getGameRef(code), {
        code, hostId: user.uid, status: 'lobby', phaseNum: 1, winner: null,
        settings: { mafia:0,godfather:0,framer:0,kidnapper:0,janitor:0,doctor:0,detective:0,sheriff:0,vigilante:0,bodyguard:0,jester:0,escort:0,mayor:0,tracker:0,lookout:0,veteran:0,blackmailer:0,spy:0,arsonist:0,medium:0 },
        players: { [user.uid]: { id:user.uid, name:playerName, avatarId:selectedAvatar, role:'unassigned', isAlive:true, hasUsedAbility:false } },
        actions:{}, guesses:{}, messages:[], mafiaMessages:[], wills:{}, dawnSeen:{}, logs:[], investigations:{}
      });
      setGameCode(code);
    } catch (err) { setError("Failed to create game."); }
  };

  const handleJoinGame = async (inputCode) => {
    if (!playerName.trim()) return setError("Enter your name to continue.");
    const code = inputCode.toUpperCase();
    try {
      const gameSnap = await getDoc(getGameRef(code));
      if (!gameSnap.exists()) return setError("No game found with that code.");
      if (gameSnap.data().status !== 'lobby') return setError("This game has already started.");
      if (Object.keys(gameSnap.data().players || {}).length >= 40) return setError("This game is full.");
      await setDoc(getGameRef(code), { players: { [user.uid]: { id:user.uid, name:playerName, avatarId:selectedAvatar, role:'unassigned', isAlive:true, hasUsedAbility:false } } }, { merge: true });
      setGameCode(code);
    } catch (err) { setError("Failed to join game."); }
  };

  return (
    <>
      <GlobalStyles />
      <div className="noise" style={{ minHeight: '100vh', background: 'var(--noir-black)' }}>
        {!gameCode
          ? <MainMenu playerName={playerName} setPlayerName={setPlayerName} selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar} onCreate={handleCreateGame} onJoin={handleJoinGame} error={error} setError={setError} />
          : <GameRoom user={user} gameCode={gameCode} onLeave={() => setGameCode('')} />
        }
      </div>
    </>
  );
}

// ─── Main Menu ────────────────────────────────────────────────────────────────
function MainMenu({ playerName, setPlayerName, selectedAvatar, setSelectedAvatar, onCreate, onJoin, error, setError }) {
  const [joinCode, setJoinCode] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(192,20,28,0.08) 0%, transparent 70%)' }}>
      <div style={{ position:'fixed', top:'8%', left:'12%', width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle, rgba(192,20,28,0.07) 0%, transparent 70%)', pointerEvents:'none', animation:'orbDrift 18s ease-in-out infinite' }} />
      <div style={{ position:'fixed', bottom:'18%', right:'8%', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(42,127,212,0.06) 0%, transparent 70%)', pointerEvents:'none', animation:'orbDrift 24s ease-in-out 6s infinite reverse' }} />
      <div className="fade-up" style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:80, height:80, marginBottom:24, background:'var(--blood)', borderRadius:20, animation:'skullBreathe 3.5s ease-in-out infinite' }}>
            <div style={{ animation:'skullIconFloat 4s ease-in-out infinite' }}><Skull size={36} color="white" strokeWidth={1.5} /></div>
          </div>
          <h1 className="font-display" style={{ fontSize:56, fontWeight:900, color:'var(--text-bright)', letterSpacing:'-0.02em', lineHeight:1 }}>Mafia</h1>
          <p style={{ marginTop:8, color:'var(--text-dim)', fontFamily:'Crimson Pro', fontStyle:'italic', fontSize:16 }}>Trust no one. Survive the night.</p>
        </div>
        <div className="glass-card" style={{ padding:32 }}>
          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(192,20,28,0.1)', border:'1px solid rgba(192,20,28,0.25)', borderRadius:10, padding:'12px 16px', marginBottom:24, color:'#F87171', fontSize:14, animation:'fadeUp 0.3s ease both' }}>
              <AlertCircle size={14} /><span>{error}</span>
            </div>
          )}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:12 }}>Choose Your Character</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, marginBottom:10 }}>
              {AVATARS.map((av, idx) => (
                <button key={av.id} onClick={() => setSelectedAvatar(av.id)} title={av.label} style={{ padding:0, borderRadius:14, cursor:'pointer', border:'none', background:'none', outline:selectedAvatar===av.id?'2px solid var(--blood)':'2px solid rgba(255,255,255,0.06)', outlineOffset:2, transition:'outline 0.15s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', transform:selectedAvatar===av.id?'scale(1.1)':'scale(1)', animation:mounted?`avatarPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${idx*35}ms both`:'none', aspectRatio:'1/1', overflow:'hidden', display:'block', width:'100%' }} onMouseEnter={e=>{if(selectedAvatar!==av.id)e.currentTarget.style.transform='scale(1.06)';}} onMouseLeave={e=>{if(selectedAvatar!==av.id)e.currentTarget.style.transform='scale(1)';}}>
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }} dangerouslySetInnerHTML={{ __html: av.svg }} />
                </button>
              ))}
            </div>
            {selectedAvatar && <p style={{ fontFamily:'Crimson Pro', fontStyle:'italic', fontSize:13, color:'var(--text-dim)', textAlign:'center' }}>{AVATARS.find(a=>a.id===selectedAvatar)?.label}</p>}
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:8 }}>Your Alias</label>
            <input type="text" value={playerName} onChange={(e)=>{setPlayerName(e.target.value);setError('');}} placeholder="Enter your name..." maxLength={15} className="noir-input" style={{ width:'100%', padding:'12px 16px', borderRadius:10 }} />
          </div>
          <button onClick={onCreate} className="btn-blood" style={{ width:'100%', padding:'14px 20px', borderRadius:10, marginBottom:20, fontWeight:500, animation:'startBtnPulse 3s ease-in-out infinite' }}>Create New Game</button>
          <div className="divider-text" style={{ marginBottom:20 }}>or join existing</div>
          <div style={{ display:'flex', gap:10 }}>
            <input type="text" value={joinCode} onChange={(e)=>{setJoinCode(e.target.value.toUpperCase());setError('');}} placeholder="CODE" maxLength={4} className="noir-input font-mono-custom" style={{ width:90, padding:'12px 14px', borderRadius:10, textAlign:'center', letterSpacing:'0.3em', fontSize:14 }} />
            <button onClick={()=>onJoin(joinCode)} className="btn-sapphire" style={{ flex:1, padding:'12px 16px', borderRadius:10 }}>Join Game</button>
          </div>
        </div>
        <p style={{ textAlign:'center', marginTop:20, color:'var(--text-dim)', fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.1em' }}>3–40 PLAYERS • MULTIPLE ROLES • LIVE MULTIPLAYER</p>
      </div>
    </div>
  );
}

// ─── Game Room ────────────────────────────────────────────────────────────────
function GameRoom({ user, gameCode, onLeave }) {
  const [game, setGame] = useState(null);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('chat');

  // Unread counts as simple state — incremented by the snapshot, cleared on open
  const [unread, setUnread] = useState(0);
  const [unreadMafia, setUnreadMafia] = useState(0);

  // Refs for values the snapshot callback reads synchronously (avoids stale closures)
  const prevMsgLen      = useRef(null);   // last known town message count
  const prevMafiaMsgLen = useRef(null);   // last known mafia message count

  // drawerOpenRef / drawerTabRef track mobile drawer state for the snapshot
  const drawerOpenRef = useRef(false);
  const drawerTabRef  = useRef('chat');

  // NEW: on desktop the sidebar chat is always visible — track that separately
  // We check window width synchronously inside the snapshot so no stale closure issue
  const isDesktop = () => window.innerWidth >= 769;

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      getGameRef(gameCode),
      (snap) => {
        if (!snap.exists()) { setError("Game has been deleted."); return; }
        const data = snap.data();
        setGame(data);

        const msgLen      = (data.messages      || []).length;
        const mafiaMsgLen = (data.mafiaMessages  || []).length;

        if (prevMsgLen.current === null) {
          // Very first snapshot — establish baseline, nothing is "new"
          prevMsgLen.current      = msgLen;
          prevMafiaMsgLen.current = mafiaMsgLen;
          return;
        }

        // --- Town chat unread ---
        if (msgLen > prevMsgLen.current) {
          const newCount = msgLen - prevMsgLen.current;
          prevMsgLen.current = msgLen;

          // Town chat is visible when:
          //   • Desktop sidebar is showing (always open on ≥769px), OR
          //   • Mobile drawer is open on the 'chat' tab
          const townChatVisible =
            isDesktop() ||
            (drawerOpenRef.current && drawerTabRef.current === 'chat');

          if (!townChatVisible) {
            setUnread(u => u + newCount);
          }
        }

        // --- Mafia chat unread ---
        if (mafiaMsgLen > prevMafiaMsgLen.current) {
          const newCount = mafiaMsgLen - prevMafiaMsgLen.current;
          prevMafiaMsgLen.current = mafiaMsgLen;

          // Mafia chat is only ever visible in the mobile drawer (tab 'mafia')
          // — on desktop it's in the sidebar which is always visible
          const mafiaChatVisible =
            isDesktop() ||
            (drawerOpenRef.current && drawerTabRef.current === 'mafia');

          if (!mafiaChatVisible) {
            setUnreadMafia(u => u + newCount);
          }
        }
      },
      (err) => { console.error("Snapshot error:", err); setError("Connection lost."); }
    );
    return () => unsub();
  }, [user, gameCode]);

  const openDrawer = (tab) => {
    drawerTabRef.current  = tab;
    drawerOpenRef.current = true;
    setDrawerTab(tab);
    setDrawerOpen(true);
    if (tab === 'chat')  setUnread(0);
    if (tab === 'mafia') setUnreadMafia(0);
  };
  const closeDrawer = () => {
    drawerOpenRef.current = false;
    setDrawerOpen(false);
  };

  const transitioning = useRef(false);
  useEffect(() => {
    if (!game || !user || game.hostId !== user.uid) return;
    if (['lobby','game_over'].includes(game.status)) return;
    const alivePlayers = Object.values(game.players).filter(p => p.isAlive);
    const actionsCount = Object.keys(game.actions || {}).length;
    if (actionsCount > 0 && actionsCount === alivePlayers.length && !transitioning.current) {
      transitioning.current = true;
      handlePhaseTransition(game, alivePlayers).finally(() => { transitioning.current = false; });
    }
  }, [game?.actions, game?.status, user?.uid]);

  const handlePhaseTransition = async (currentGame, alivePlayers) => {
    const { status, actions, players, phaseNum, guesses = {} } = currentGame;
    let updates = { actions: {} };
    let newLogs = [];
    let updatedPlayers = Object.fromEntries(Object.entries(players).map(([k,v]) => [k,{...v}]));
    let newWinner = null;

    if (status === 'role_reveal') {
      updates.status = 'night'; updates.actions = {};
      newLogs.push(`Night ${phaseNum} begins. The city goes dark.`);
    } else if (status === 'night') {
      Object.entries(guesses).forEach(([guesserId, guessData]) => {
        const { targetId, guessedRole } = guessData;
        const target = updatedPlayers[targetId]; const guesser = updatedPlayers[guesserId];
        if (!target?.isAlive || !guesser?.isAlive) return;
        if (target.role === guessedRole) {
          updatedPlayers[targetId].isAlive = false;
          newLogs.push(`${guesser.name} correctly identified ${target.name} as ${guessedRole}. ${target.name} is executed.`);
          if (target.role === 'jester') { newWinner = 'jester'; newLogs.push(`The Jester's gambit succeeds!`); }
        } else {
          updatedPlayers[guesserId].isAlive = false;
          newLogs.push(`${guesser.name} guessed wrong — and paid with their life.`);
        }
      });
      newWinner = newWinner || checkWinCondition(updatedPlayers);
      if (newWinner) {
        updates.status='game_over'; updates.winner=newWinner; updates.players=updatedPlayers; updates.logs=arrayUnion(...newLogs);
        await updateDoc(getGameRef(gameCode), updates); return;
      }
      let mafiaTargets={}, docTarget=null, bgTarget=null, vigTarget=null;
      let blockedPlayers=new Set(), framedPlayers=new Set();
      let doused=new Set(Object.keys(players).filter(k=>players[k].doused));
      let veteranAlerted=false, janitorKill=null;
      Object.entries(actions).forEach(([uid,action]) => {
        if (action==='skip'||action==='sleep'||!updatedPlayers[uid]?.isAlive) return;
        const role=players[uid].role;
        if (role==='escort'||role==='kidnapper') { blockedPlayers.add(action); if(role==='kidnapper') newLogs.push(`${players[action]?.name} was held captive through the night.`); }
      });
      Object.entries(actions).forEach(([uid,action]) => {
        if (action==='skip'||action==='sleep'||action==='alert'||action==='ignite'||action==='spy_passive') return;
        if (blockedPlayers.has(uid)) return;
        const role=players[uid].role;
        if (role==='veteran'&&action==='alert'&&!players[uid].hasUsedAbility) { veteranAlerted=true; updatedPlayers[uid].hasUsedAbility=true; }
        if (role==='framer') framedPlayers.add(action);
        if (role==='arsonist'&&action!=='ignite') { doused.add(action); updatedPlayers[action]={...updatedPlayers[action],doused:true}; }
      });
      if (veteranAlerted) {
        const vetUid=Object.keys(players).find(k=>players[k].role==='veteran');
        Object.entries(actions).forEach(([uid,action]) => { if(action===vetUid&&uid!==vetUid&&updatedPlayers[uid]?.isAlive){ updatedPlayers[uid].isAlive=false; newLogs.push(`${players[uid].name} was shot by the Veteran.`); } });
      }
      Object.keys(players).filter(k=>players[k].role==='arsonist').forEach(arsonistUid => {
        if (actions[arsonistUid]==='ignite'&&!blockedPlayers.has(arsonistUid)&&updatedPlayers[arsonistUid]?.isAlive) {
          let burnCount=0;
          Object.keys(updatedPlayers).forEach(uid => { if(updatedPlayers[uid].doused&&updatedPlayers[uid].isAlive){ updatedPlayers[uid].isAlive=false; burnCount++; newLogs.push(`${players[uid].name} was burned alive.`); } });
          if (burnCount===0) newLogs.push(`The Arsonist ignited — but no one was doused.`);
        }
      });
      Object.entries(actions).forEach(([uid,action]) => {
        if (action==='skip'||action==='sleep'||action==='alert'||action==='ignite'||action==='spy_passive') return;
        if (blockedPlayers.has(uid)) return;
        const role=players[uid].role;
        if (isMafiaRole(role)&&role!=='framer'&&role!=='kidnapper') { mafiaTargets[action]=(mafiaTargets[action]||0)+1; if(role==='janitor') janitorKill=action; }
        else if (role==='doctor') docTarget=action;
        else if (role==='bodyguard') bgTarget=action;
        else if (role==='vigilante'&&!players[uid].hasUsedAbility) vigTarget=action;
      });
      if (vigTarget&&updatedPlayers[vigTarget]?.isAlive) {
        updatedPlayers[vigTarget].isAlive=false;
        const vigUid=Object.keys(players).find(k=>players[k].role==='vigilante');
        if (vigUid) updatedPlayers[vigUid].hasUsedAbility=true;
        newLogs.push(`${players[vigTarget].name} was shot by the Vigilante.`);
      }
      let finalMafiaTarget=null, maxVotes=0;
      Object.entries(mafiaTargets).forEach(([target,count]) => { if(count>maxVotes){ maxVotes=count; finalMafiaTarget=target; } });
      if (finalMafiaTarget&&updatedPlayers[finalMafiaTarget]?.isAlive) {
        const isProtected=finalMafiaTarget===docTarget, isBodyguarded=finalMafiaTarget===bgTarget;
        if (isBodyguarded) {
          const attackers=Object.entries(actions).filter(([uid,action])=>isMafiaRole(players[uid].role)&&action===finalMafiaTarget);
          if (attackers.length>0){ updatedPlayers[attackers[0][0]].isAlive=false; newLogs.push(`The Bodyguard protected ${players[finalMafiaTarget].name} and sacrificed themselves.`); }
        } else if (!isProtected) {
          updatedPlayers[finalMafiaTarget].isAlive=false;
          if (janitorKill===finalMafiaTarget){ newLogs.push(`Someone was found dead at dawn. The body was cleaned — role unknown.`); updates[`janitoredRole.${finalMafiaTarget}`]=players[finalMafiaTarget].role; }
          else newLogs.push(`${players[finalMafiaTarget].name} was found dead at dawn.`);
        } else newLogs.push(`Someone was attacked, but the Doctor saved them.`);
      }
      Object.entries(actions).forEach(([uid,action]) => {
        if (blockedPlayers.has(uid)) return;
        const role=players[uid].role;
        if (role==='detective'&&action!=='skip'&&action!=='sleep'){ const targetRole=players[action]?.role; const isFramed=framedPlayers.has(action); const targetIsMafia=isFramed?true:isMafiaRole(targetRole); updates[`investigations.${uid}`]={target:action,isMafia:targetIsMafia,result:targetIsMafia?'SUSPICIOUS':'NOT SUSPICIOUS',phase:phaseNum}; }
        if (role==='sheriff'&&action!=='skip'&&action!=='sleep'){ const targetRole=players[action]?.role; const isFramed=framedPlayers.has(action); const exactRole=(isFramed&&!isMafiaRole(targetRole))?'Framed — appears Mafia':targetRole; updates[`investigations.${uid}`]={target:action,isMafia:isMafiaRole(targetRole)||isFramed,result:exactRole?.toUpperCase(),phase:phaseNum}; }
        if (role==='tracker'&&action!=='skip'&&action!=='sleep'){ const targetAction=actions[action]; const wasBlocked=blockedPlayers.has(action); const visited=!wasBlocked&&targetAction&&targetAction!=='skip'&&targetAction!=='sleep'&&targetAction!=='spy_passive'?players[targetAction]?.name:'nobody'; updates[`investigations.${uid}`]={target:action,isMafia:false,result:`Visited: ${visited}`,phase:phaseNum}; }
        if (role==='lookout'&&action!=='skip'&&action!=='sleep'){ const visitors=Object.entries(actions).filter(([vid,vaction])=>vaction===action&&vid!==uid&&!blockedPlayers.has(vid)&&vaction!=='spy_passive').map(([vid])=>players[vid]?.name).filter(Boolean); updates[`investigations.${uid}`]={target:action,isMafia:false,result:visitors.length?`Visited by: ${visitors.join(', ')}`:'No visitors',phase:phaseNum}; }
        if (role==='spy'){ const specialActions=new Set(['skip','sleep','alert','ignite','spy_passive']); const mafiaActions=Object.entries(actions).filter(([vid])=>isMafiaRole(players[vid]?.role)&&updatedPlayers[vid]?.isAlive).map(([vid,vaction])=>{ const targetName=specialActions.has(vaction)?`(${vaction})`:(players[vaction]?.name||'?'); return `${players[vid]?.name} targeted ${targetName}`; }).join('; '); updates[`investigations.${uid}`]={target:null,isMafia:false,result:mafiaActions||'Mafia did not act tonight',phase:phaseNum}; }
        if (role==='blackmailer'&&action!=='skip'&&action!=='sleep') updates[`blackmailed`]={target:action,phase:phaseNum};
      });
      if (newLogs.length===0) newLogs.push("The night passes without incident. The city breathes.");
      const nightDeaths=Object.keys(updatedPlayers).filter(uid=>!updatedPlayers[uid].isAlive&&players[uid].isAlive);
      updates.status='day'; updates.players=updatedPlayers; updates.logs=arrayUnion(...newLogs); updates.nightDeaths=nightDeaths; updates.dawnSeen={}; updates.guesses={};
      newWinner=checkWinCondition(updatedPlayers);
    } else if (status==='day') {
      let votes={};
      Object.entries(actions).forEach(([uid,target]) => { if(target!=='skip'&&target!=='sleep'){ const weight=players[uid]?.role==='mayor'?3:1; votes[target]=(votes[target]||0)+weight; } });
      let lynched=null, maxVotes=0;
      Object.entries(votes).forEach(([target,count]) => { if(count>maxVotes){ maxVotes=count; lynched=target; } });
      const isTie=Object.values(votes).filter(v=>v===maxVotes).length>1;
      if (lynched&&!isTie&&updatedPlayers[lynched]?.isAlive){ updatedPlayers[lynched].isAlive=false; newLogs.push(`The crowd votes to execute ${players[lynched].name}.`); if(players[lynched].role==='jester'){newWinner='jester';newLogs.push(`${players[lynched].name} was the Jester — their scheme succeeded!`);} }
      else newLogs.push(`The vote ends in deadlock. No one is executed.`);
      updates.status='night'; updates.phaseNum=phaseNum+1; updates.players=updatedPlayers; updates.logs=arrayUnion(...newLogs);
      newWinner=checkWinCondition(updatedPlayers);
    }
    if (newWinner){ updates.status='game_over'; updates.winner=newWinner; updates.logs=arrayUnion(`The game ends. The ${newWinner} claim victory.`); }
    try { await updateDoc(getGameRef(gameCode), updates); } catch(e) { console.error("Phase transition failed",e); }
  };

  const checkWinCondition = (playersObj) => {
    const alive=Object.values(playersObj).filter(p=>p.isAlive);
    const aliveMafia=alive.filter(p=>isMafiaRole(p.role)).length;
    const aliveArsonist=alive.filter(p=>p.role==='arsonist').length;
    if (alive.filter(p=>p.role==='jester').length>0&&alive.length===1&&alive[0].role==='jester') return 'jester';
    if (aliveArsonist>0&&alive.every(p=>p.role==='arsonist')) return 'arsonist';
    if (aliveMafia===0&&aliveArsonist===0) return 'village';
    const aliveNonMafia=alive.filter(p=>!isMafiaRole(p.role)).length;
    if (aliveMafia>0&&aliveMafia>=aliveNonMafia) return 'mafia';
    return null;
  };

  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <p style={{ color:'#F87171', fontSize:18 }}>{error}</p>
      <button onClick={onLeave} className="btn-ghost" style={{ padding:'10px 20px', borderRadius:8 }}>Return to Menu</button>
    </div>
  );
  if (!game) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{ width:32, height:32, border:'2px solid rgba(255,255,255,0.08)', borderTop:'2px solid var(--blood)', animation:'spinnerMorph 1.2s cubic-bezier(0.5,0,0.5,1) infinite' }} />
        <span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.2em', color:'var(--text-dim)', textTransform:'uppercase' }}>Loading game</span>
      </div>
    </div>
  );

  const me=game.players[user.uid];
  const isHost=game.hostId===user.uid;
  const showAside=['night','day'].includes(game.status);
  const isMafia=me?isMafiaRole(me.role):false;
  const mafiaAllies=isMafia?Object.values(game.players).filter(p=>isMafiaRole(p.role)&&p.id!==me.id):[];
  const hasMafiaChat=isMafia&&mafiaAllies.length>0;
  const roleColor={ mafia:'var(--blood)', doctor:'var(--emerald)', detective:'var(--sapphire)', jester:'var(--amethyst)', vigilante:'var(--orange)', bodyguard:'var(--amber)', villager:'var(--text-mid)', unassigned:'var(--text-dim)' }[me?.role]||'var(--text-dim)';
  const phaseLabel={ lobby:'Lobby', role_reveal:'Role Reveal', night:`Night ${game.phaseNum}`, day:`Day ${game.phaseNum}`, game_over:'Game Over' }[game.status]||game.status;

  const renderPhase = () => {
    switch (game.status) {
      case 'lobby':       return <Lobby game={game} isHost={isHost} user={user} />;
      case 'role_reveal': return <RoleReveal game={game} me={me} user={user} />;
      case 'night':       return <NightPhase key={`night-${game.phaseNum}`} game={game} me={me} user={user} />;
      case 'day':         return <DayPhase key={`day-${game.phaseNum}`} game={game} me={me} user={user} />;
      case 'game_over':   return <GameOver game={game} me={me} onLeave={onLeave} />;
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <header className="phase-bar" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(12px)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div className="font-mono-custom" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--noir-border)', borderRadius:8, padding:'5px 14px', fontSize:14, letterSpacing:'0.3em', color:'var(--text-bright)', fontWeight:500 }}>{game.code}</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {game.status==='night'&&<div style={{ animation:'aliveDot 2s ease-in-out infinite' }}><Moon size={14} color="var(--amethyst)" /></div>}
            {game.status==='day'&&<div style={{ animation:'skullIconFloat 4s ease-in-out infinite' }}><Sun size={14} color="var(--gold)" /></div>}
            <span style={{ fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.1em', color:'var(--text-mid)', textTransform:'uppercase', animation:['night','day'].includes(game.status)?'phaseLabelPulse 3s ease-in-out infinite':'none' }}>{phaseLabel}</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span className="role-badge" style={{ background:`${roleColor}18`, border:`1px solid ${roleColor}40`, color:roleColor }}>{me?.role}</span>
          <span style={{ color:'var(--text-mid)', fontSize:15 }}>{me?.name}</span>
          {isHost&&<div style={{ animation:'skullIconFloat 4s ease-in-out infinite' }}><Crown size={14} color="var(--gold)" /></div>}
        </div>
      </header>

      {/* 
        KEY FIX: main must have overflow:hidden so the sidebar doesn't grow the page.
        The sidebar uses display:flex + flex-direction:column + min-height:0 so its
        children (PlayerList + ChatBox) can scroll internally.
      */}
      <main style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>
        <div style={{ flex:1, padding:'20px', overflowY:'auto', minWidth:0 }}>
          {renderPhase()}
        </div>
        {showAside && (
          <aside className="desktop-sidebar">
            <PlayerList game={game} me={me} />
            {/* ChatBox fills remaining height and scrolls internally */}
            <ChatBox game={game} me={me} user={user} isMafiaChat={false} />
            {hasMafiaChat && <ChatBox game={game} me={me} user={user} isMafiaChat={true} />}
          </aside>
        )}
      </main>

      {showAside && (
        <>
          {hasMafiaChat && (
            <button className="fab fab-mafia" onClick={() => openDrawer('mafia')} style={{ bottom:88 }} title="Famiglia">
              <Skull size={20} color="var(--blood)" />
              {unreadMafia > 0 && <span style={{ position:'absolute', top:6, right:6, width:9, height:9, borderRadius:'50%', background:'var(--blood)', boxShadow:'0 0 0 2px var(--noir-black)', animation:'pulse-blood 1.5s ease infinite' }} />}
            </button>
          )}
          <button className="fab" onClick={() => openDrawer('chat')} style={{ bottom:24 }} title="Town Square">
            <MessageSquare size={20} color={unread>0?'var(--text-bright)':'var(--text-mid)'} />
            {unread > 0 && <span style={{ position:'absolute', top:6, right:6, width:9, height:9, borderRadius:'50%', background:'var(--blood)', boxShadow:'0 0 0 2px var(--noir-black)', animation:'pulse-blood 1.5s ease infinite' }} />}
          </button>
          <div className={`drawer-overlay${drawerOpen?' open':''}`} onClick={closeDrawer} />
          <div className={`drawer-panel${drawerOpen?' open':''}`}>
            <div className="drawer-handle" onClick={closeDrawer} style={{ cursor:'pointer' }} />
            <div style={{ display:'flex', borderBottom:'1px solid var(--noir-border)', flexShrink:0 }}>
              {[
                { id:'players', label:'Players', icon:<Users size={11} style={{ display:'inline', marginRight:5 }} /> },
                { id:'chat',    label:'Town',    icon:<MessageSquare size={11} style={{ display:'inline', marginRight:5 }} />, badge:unread },
                ...(hasMafiaChat?[{ id:'mafia', label:'Famiglia', icon:<Skull size={11} style={{ display:'inline', marginRight:5 }} />, badge:unreadMafia, isMafia:true }]:[]),
              ].map(tab => (
                <button key={tab.id} onClick={() => { drawerTabRef.current=tab.id; setDrawerTab(tab.id); if(tab.id==='chat') setUnread(0); if(tab.id==='mafia') setUnreadMafia(0); }} style={{ flex:1, padding:'12px 8px', background:'transparent', border:'none', cursor:'pointer', fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:drawerTab===tab.id?(tab.isMafia?'var(--blood)':'var(--text-bright)'):(tab.isMafia?'rgba(192,20,28,0.45)':'var(--text-dim)'), borderBottom:drawerTab===tab.id?`2px solid ${tab.isMafia?'var(--blood)':'var(--text-bright)'}`:'2px solid transparent', transition:'color 0.2s, border-color 0.2s' }}>
                  {tab.icon}{tab.label}
                  {tab.badge>0&&<span style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background:'var(--blood)', marginLeft:5, verticalAlign:'middle', animation:'pulse-blood 1.5s ease infinite' }} />}
                </button>
              ))}
            </div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
              {drawerTab==='players'&&<PlayerList game={game} me={me} />}
              {drawerTab==='chat'&&<ChatBox game={game} me={me} user={user} isMafiaChat={false} />}
              {drawerTab==='mafia'&&hasMafiaChat&&<ChatBox game={game} me={me} user={user} isMafiaChat={true} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Lobby, RoleReveal, NightPhase, DayPhase, GameOver ───────────────────────
// (unchanged from previous version — only pasting the ones that existed before)

function Lobby({ game, isHost, user }) {
  const playersList = Object.values(game.players);
  const [openCategory, setOpenCategory] = useState(null);
  const [visiblePlayers, setVisiblePlayers] = useState(new Set());
  useEffect(() => { playersList.forEach((p,idx) => { setTimeout(() => setVisiblePlayers(prev => new Set([...prev,p.id])), idx*80); }); }, [playersList.length]);

  const handleSettingsChange = async (role, increment) => {
    const newCount = game.settings[role] + increment;
    if (newCount < 0) return;
    await updateDoc(getGameRef(game.code), { [`settings.${role}`]: newCount });
  };
  const handleStartGame = async () => {
    const totalSpecial = Object.values(game.settings).reduce((a,b)=>a+b,0);
    if (playersList.length < totalSpecial+1) { alert(`Need at least ${totalSpecial+1} players for current settings.`); return; }
    let roles=[];
    Object.entries(game.settings).forEach(([role,count]) => { for(let i=0;i<count;i++) roles.push(role); });
    while (roles.length < playersList.length) roles.push('villager');
    roles.sort(()=>Math.random()-0.5);
    let updatedPlayers={...game.players};
    playersList.forEach((p,idx) => { updatedPlayers[p.id].role=roles[idx]; });
    await updateDoc(getGameRef(game.code), { status:'role_reveal', players:updatedPlayers });
  };

  const roleCategories = [
    { id:'mafia', label:'Mafia Roles', color:'var(--blood)', icon:<Skull size={13} color="var(--blood)"/>, desc:'Work together in secret to eliminate the town at night.',
      roles:[{role:'mafia',label:'Mafia',icon:<Skull size={15} color="var(--blood)"/>,color:'var(--blood)',hint:'Kill one townsfolk each night.'},{role:'godfather',label:'Godfather',icon:<Skull size={15} color="#8B0000"/>,color:'#8B0000',hint:'Appears innocent to detectives.'},{role:'framer',label:'Framer',icon:<Sword size={15} color="var(--blood)"/>,color:'var(--blood)',hint:'Makes an innocent appear as mafia.'},{role:'kidnapper',label:'Kidnapper',icon:<Moon size={15} color="var(--blood)"/>,color:'var(--blood)',hint:"Blocks a player's night action."},{role:'janitor',label:'Janitor',icon:<Skull size={15} color="var(--blood)"/>,color:'var(--blood)',hint:"Hides the role of the kill victim."}]},
    { id:'town', label:'Villager Roles', color:'var(--sapphire)', icon:<Users size={13} color="var(--sapphire)"/>, desc:'Identify and eliminate the mafia through votes and investigation.',
      roles:[{role:'doctor',label:'Doctor',icon:<Cross size={15} color="var(--emerald)"/>,color:'var(--emerald)',hint:'Protect one player each night.'},{role:'sheriff',label:'Sheriff',icon:<Search size={15} color="var(--emerald)"/>,color:'var(--emerald)',hint:"Learns exact role of target."},{role:'detective',label:'Detective',icon:<Search size={15} color="var(--sapphire)"/>,color:'var(--sapphire)',hint:'Learns if target is suspicious.'},{role:'tracker',label:'Tracker',icon:<Target size={15} color="var(--sapphire)"/>,color:'var(--sapphire)',hint:'Sees who a target visits.'},{role:'lookout',label:'Lookout',icon:<Moon size={15} color="var(--sapphire)"/>,color:'var(--sapphire)',hint:'Sees who visits a chosen player.'},{role:'spy',label:'Spy',icon:<Search size={15} color="var(--sapphire)"/>,color:'var(--sapphire)',hint:'Passively sees all mafia actions.'},{role:'vigilante',label:'Vigilante',icon:<Zap size={15} color="var(--orange)"/>,color:'var(--orange)',hint:'One-shot kill a suspect.'},{role:'bodyguard',label:'Bodyguard',icon:<Shield size={15} color="var(--amber)"/>,color:'var(--amber)',hint:'Dies protecting a target.'},{role:'escort',label:'Escort',icon:<Ghost size={15} color="var(--amethyst)"/>,color:'var(--amethyst)',hint:"Blocks a player's night action."},{role:'mayor',label:'Mayor',icon:<Crown size={15} color="var(--gold)"/>,color:'var(--gold)',hint:'Vote counts triple.'},{role:'veteran',label:'Veteran',icon:<Shield size={15} color="var(--gold)"/>,color:'var(--gold)',hint:'Once: alert and kill all visitors.'},{role:'medium',label:'Medium',icon:<Ghost size={15} color="var(--amethyst)"/>,color:'var(--amethyst)',hint:'Can talk to dead players.'}]},
    { id:'neutral', label:'Neutral Roles', color:'var(--amethyst)', icon:<Ghost size={13} color="var(--amethyst)"/>, desc:'Play by their own rules with unique win conditions.',
      roles:[{role:'jester',label:'Jester',icon:<Ghost size={15} color="var(--amethyst)"/>,color:'var(--amethyst)',hint:'Win by tricking the town into lynching you.'},{role:'arsonist',label:'Arsonist',icon:<Zap size={15} color="var(--orange)"/>,color:'var(--orange)',hint:'Douse players then ignite.'},{role:'blackmailer',label:'Blackmailer',icon:<Skull size={15} color="var(--blood)"/>,color:'var(--blood)',hint:'Silence a player each night.'}]},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:960, margin:'0 auto' }}>
      <div style={{ textAlign:'center', padding:'20px 0', animation:'fadeUp 0.5s ease both' }}>
        <h2 className="font-display" style={{ fontSize:32, color:'var(--text-bright)', fontWeight:700, marginBottom:6 }}>Gathering</h2>
        <p style={{ color:'var(--text-dim)', fontStyle:'italic' }}>Waiting for players to assemble</p>
      </div>
      <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
        <div className="glass-card" style={{ flex:1, minWidth:280, padding:24, animation:'fadeUp 0.5s ease 0.1s both' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)', display:'flex', alignItems:'center', gap:8 }}><Users size={12}/> Players</h3>
            <span style={{ fontFamily:'DM Mono', fontSize:11, color:'var(--text-dim)', background:'rgba(255,255,255,0.05)', border:'1px solid var(--noir-border)', borderRadius:6, padding:'2px 10px' }}>{playersList.length} joined</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:8 }}>
            {playersList.map(p => (
              <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--noir-border)', borderRadius:10, padding:'10px 14px', opacity:visiblePlayers.has(p.id)?1:0, transform:visiblePlayers.has(p.id)?'translateX(0)':'translateX(-12px)', transition:'opacity 0.35s ease, transform 0.35s ease' }}>
                <Avatar avatarId={p.avatarId} size={32}/>
                <span style={{ fontSize:15, color:'var(--text-bright)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{p.name}</span>
                {p.id===game.hostId&&<div style={{ animation:'skullIconFloat 4s ease-in-out infinite' }}><Crown size={11} color="var(--gold)" style={{ flexShrink:0 }}/></div>}
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card" style={{ width:'100%', flexBasis:280, flexShrink:0, padding:24, animation:'fadeUp 0.5s ease 0.2s both' }}>
          <h3 style={{ fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:16 }}>Role Setup</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {roleCategories.map(cat => {
              const isOpen=openCategory===cat.id;
              const activeInCat=cat.roles.filter(r=>game.settings[r.role]>0).length;
              return (
                <div key={cat.id} style={{ borderRadius:12, border:`1px solid ${isOpen?cat.color+'28':'var(--noir-border)'}`, transition:'border-color 0.25s, box-shadow 0.25s', boxShadow:isOpen?`0 0 20px ${cat.color}08`:'none' }}>
                  <button onClick={()=>setOpenCategory(isOpen?null:cat.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:isOpen?`${cat.color}0a`:'rgba(255,255,255,0.02)', border:'none', cursor:'pointer', transition:'background 0.2s', borderRadius:isOpen?'11px 11px 0 0':11 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:7, flex:1 }}>{cat.icon}<span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:isOpen?cat.color:'var(--text-mid)', transition:'color 0.2s' }}>{cat.label}</span></span>
                    {activeInCat>0&&<span style={{ fontFamily:'DM Mono', fontSize:9, color:cat.color, background:`${cat.color}18`, border:`1px solid ${cat.color}30`, borderRadius:4, padding:'1px 6px' }}>{activeInCat} active</span>}
                    <ChevronDown size={12} color="var(--text-dim)" style={{ transform:isOpen?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)', flexShrink:0 }}/>
                  </button>
                  <div style={{ maxHeight:isOpen?'400px':'0px', overflow:'hidden', transition:'max-height 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
                    <div style={{ padding:'4px 10px 10px' }}>
                      <p style={{ fontFamily:'Crimson Pro', fontStyle:'italic', fontSize:12, color:'var(--text-dim)', marginBottom:8, paddingLeft:4 }}>{cat.desc}</p>
                      <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:'232px', overflowY:'auto', WebkitOverflowScrolling:'touch', paddingRight:2 }}>
                        {cat.roles.map(({role,label,icon,color,hint}) => (
                          <div key={role} style={{ borderRadius:9, padding:'9px 11px', background:game.settings[role]>0?`${color}0c`:'transparent', border:`1px solid ${game.settings[role]>0?color+'20':'transparent'}`, transition:'all 0.2s ease' }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:hint?3:0 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>{icon}<span style={{ fontSize:14, color:game.settings[role]>0?'var(--text-bright)':'var(--text-mid)', transition:'color 0.2s' }}>{label}</span></div>
                              {isHost?(<div className="stepper"><button onClick={()=>handleSettingsChange(role,-1)}>−</button><span>{game.settings[role]}</span><button onClick={()=>handleSettingsChange(role,1)}>+</button></div>):(<span className="font-mono-custom" style={{ fontSize:13, color:'var(--text-bright)', minWidth:20, textAlign:'right' }}>{game.settings[role]}</span>)}
                            </div>
                            {hint&&<p style={{ fontFamily:'DM Mono', fontSize:9, color:'var(--text-dim)', letterSpacing:'0.05em', paddingLeft:23, lineHeight:1.4 }}>{hint}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ height:1, background:'var(--noir-border)', margin:'20px 0' }}/>
          {isHost?(<button onClick={handleStartGame} className="btn-blood" style={{ width:'100%', padding:'13px 20px', borderRadius:10, animation:'startBtnPulse 2.5s ease-in-out infinite' }}>Begin the Night</button>):(<div style={{ textAlign:'center', padding:'12px 16px', background:'rgba(255,255,255,0.02)', borderRadius:10, border:'1px solid var(--noir-border)' }}><span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.1em', color:'var(--text-dim)', textTransform:'uppercase' }}>Awaiting host</span></div>)}
        </div>
      </div>
    </div>
  );
}

function RoleReveal({ game, me, user }) {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hasReadied = !!game.actions[user.uid];
  useEffect(() => { const t=setTimeout(()=>setFlipped(true),800); return ()=>clearTimeout(t); },[]);
  useEffect(() => { if(!flipped) return; const t=setTimeout(()=>setRevealed(true),700); return ()=>clearTimeout(t); },[flipped]);
  const handleReady = async () => { await updateDoc(getGameRef(game.code), { [`actions.${user.uid}`]:'ready' }); };
  const roleConfig = {
    villager:{icon:<User size={56} strokeWidth={1}/>,color:'#9E9A94',label:'Villager',motto:'Trust your instincts.',desc:"Find the mafia through debate and deduction."},
    mafia:{icon:<Skull size={56} strokeWidth={1}/>,color:'#C0141C',label:'Mafia',motto:'The city is yours to take.',desc:"Eliminate the innocents one by one. Kill each night."},
    godfather:{icon:<Skull size={56} strokeWidth={1}/>,color:'#8B0000',label:'Godfather',motto:'Untouchable.',desc:"Lead the mafia. Appear innocent to detectives."},
    framer:{icon:<Sword size={56} strokeWidth={1}/>,color:'#C0141C',label:'Framer',motto:'Guilt is a matter of perception.',desc:"Frame innocents as mafia each night."},
    kidnapper:{icon:<Moon size={56} strokeWidth={1}/>,color:'#C0141C',label:'Kidnapper',motto:'Silence the threats.',desc:"Kidnap a player each night, blocking their action."},
    janitor:{icon:<Skull size={56} strokeWidth={1}/>,color:'#C0141C',label:'Janitor',motto:'Leave no trace.',desc:"Hide your kill victim's role at dawn."},
    doctor:{icon:<Cross size={56} strokeWidth={1}/>,color:'#1DB36A',label:'Doctor',motto:'Life is in your hands.',desc:"Protect someone from death each night."},
    sheriff:{icon:<Search size={56} strokeWidth={1}/>,color:'#1DB36A',label:'Sheriff',motto:'No one escapes the law.',desc:"Interrogate one person per night. Learn their exact role."},
    detective:{icon:<Search size={56} strokeWidth={1}/>,color:'#2A7FD4',label:'Detective',motto:'The truth is always buried.',desc:"Investigate someone each night for mafia ties."},
    tracker:{icon:<Target size={56} strokeWidth={1}/>,color:'#2A7FD4',label:'Tracker',motto:'Everyone leaves a trail.',desc:"Follow someone each night to see who they visited."},
    lookout:{icon:<Moon size={56} strokeWidth={1}/>,color:'#2A7FD4',label:'Lookout',motto:'Nothing escapes your watch.',desc:"Watch a house each night to see who comes and goes."},
    spy:{icon:<Search size={56} strokeWidth={1}/>,color:'#2A7FD4',label:'Spy',motto:'Knowledge is the real weapon.',desc:"Each night you automatically learn who the mafia targeted."},
    vigilante:{icon:<Zap size={56} strokeWidth={1}/>,color:'#EA580C',label:'Vigilante',motto:'One shot. Make it count.',desc:"You carry one bullet. Use it wisely."},
    bodyguard:{icon:<Shield size={56} strokeWidth={1}/>,color:'#D97706',label:'Bodyguard',motto:'Take the hit. Save the rest.',desc:"Guard someone — sacrifice yourself to kill their attacker."},
    escort:{icon:<Ghost size={56} strokeWidth={1}/>,color:'#8B5CF6',label:'Escort',motto:'Keep them busy.',desc:"Completely block a player's night action."},
    mayor:{icon:<Crown size={56} strokeWidth={1}/>,color:'#C9A84C',label:'Mayor',motto:'Your word is law.',desc:"Your vote counts triple. No night action."},
    veteran:{icon:<Shield size={56} strokeWidth={1}/>,color:'#C9A84C',label:'Veteran',motto:'Shoot first, ask later.',desc:"Once per game: go on alert and kill anyone who visits."},
    blackmailer:{icon:<Skull size={56} strokeWidth={1}/>,color:'#C0141C',label:'Blackmailer',motto:'Silence is golden.',desc:"Blackmail a player each night — they cannot speak the next day."},
    medium:{icon:<Ghost size={56} strokeWidth={1}/>,color:'#8B5CF6',label:'Medium',motto:'The dead still speak.',desc:"Communicate with eliminated players at night."},
    jester:{icon:<Ghost size={56} strokeWidth={1}/>,color:'#8B5CF6',label:'Jester',motto:'Die laughing.',desc:"Deceive the village into executing you. That's your win condition."},
    arsonist:{icon:<Zap size={56} strokeWidth={1}/>,color:'#EA580C',label:'Arsonist',motto:'Watch it all burn.',desc:"Douse players with gasoline each night, then ignite them all."},
  };
  const info=roleConfig[me.role]||roleConfig.villager;
  const mafiaAllies=Object.values(game.players).filter(p=>isMafiaRole(p.role)&&p.id!==me.id);
  const cardBackPattern=`url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20L20 0M-5 5L5-5M15 25L25 15' stroke='rgba(255,255,255,0.04)' stroke-width='1.5'/%3E%3C/svg%3E")`;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'70vh', padding:'20px 16px' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:revealed?`radial-gradient(ellipse 70% 50% at 50% 40%, ${info.color}14 0%, transparent 70%)`:'transparent', transition:'background 1.2s ease', animation:revealed?'roleGlowBreathe 4s ease-in-out infinite':'none' }}/>
      <p style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:36, opacity:revealed?1:0, transition:'opacity 0.6s ease 0.3s' }}>Your Role Has Been Assigned</p>
      <div style={{ perspective:'1000px', width:'100%', maxWidth:360, marginBottom:36 }}>
        <div style={{ position:'relative', width:'100%', paddingBottom:'145%', transformStyle:'preserve-3d', transform:flipped?'rotateY(180deg)':'rotateY(0deg)', transition:'transform 0.75s cubic-bezier(0.4,0.2,0.2,1)' }}>
          <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', borderRadius:20, background:'#0e0c10', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 30px 80px rgba(0,0,0,0.7)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden' }} onClick={()=>!flipped&&setFlipped(true)}>
            <div style={{ position:'absolute', inset:0, backgroundImage:cardBackPattern }}/>
            <div style={{ position:'absolute', inset:12, borderRadius:12, border:'1px solid rgba(201,168,76,0.15)' }}/>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(192,20,28,0.12)', border:'1px solid rgba(192,20,28,0.3)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 40px rgba(192,20,28,0.2)', animation:'skullBreathe 3.5s ease-in-out infinite' }}>
              <div style={{ animation:'skullIconFloat 4s ease-in-out infinite' }}><Skull size={36} color="rgba(192,20,28,0.8)" strokeWidth={1.2}/></div>
            </div>
            <p style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(255,255,255,0.15)', marginTop:20, position:'relative' }}>Mafia</p>
          </div>
          <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:'rotateY(180deg)', borderRadius:20, background:`linear-gradient(155deg, #13101a 0%, #0d0c10 50%, ${info.color}0d 100%)`, border:`1px solid ${info.color}25`, boxShadow:`0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${info.color}15`, display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 28px', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:16, left:18, fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:14, color:`${info.color}60`, textTransform:'uppercase' }}>{info.label[0]}</div>
            <div style={{ position:'absolute', bottom:16, right:18, fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:14, color:`${info.color}60`, textTransform:'uppercase', transform:'rotate(180deg)' }}>{info.label[0]}</div>
            <div style={{ position:'absolute', inset:10, borderRadius:12, border:`1px solid ${info.color}12`, pointerEvents:'none' }}/>
            <div style={{ width:90, height:90, borderRadius:'50%', flexShrink:0, background:`radial-gradient(circle, ${info.color}20 0%, ${info.color}06 70%)`, border:`1px solid ${info.color}35`, boxShadow:`0 0 50px ${info.color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22, marginTop:8, color:info.color, animation:revealed?'roleGlowBreathe 3s ease-in-out infinite':'none' }}>{info.icon}</div>
            <h1 className="font-display" style={{ fontSize:38, fontWeight:900, textTransform:'capitalize', color:info.color, letterSpacing:'0.02em', marginBottom:6, lineHeight:1, textShadow:`0 0 30px ${info.color}50` }}>{info.label}</h1>
            <p style={{ fontFamily:'Crimson Pro', fontStyle:'italic', fontSize:14, color:`${info.color}80`, marginBottom:18, letterSpacing:'0.03em' }}>"{info.motto}"</p>
            <div style={{ width:'100%', height:1, marginBottom:18, background:`linear-gradient(90deg, transparent, ${info.color}30, transparent)` }}/>
            <div style={{ display:'flex', gap:14, alignItems:'flex-start', width:'100%', marginBottom:16 }}>
              <Avatar avatarId={me.avatarId} size={44} style={{ border:`2px solid ${info.color}30`, flexShrink:0 }}/>
              <p style={{ color:'var(--text-mid)', fontSize:14, lineHeight:1.65, fontFamily:'Crimson Pro', flex:1 }}>{info.desc}</p>
            </div>
            {isMafiaRole(me.role)&&(
              <div style={{ width:'100%', background:'rgba(192,20,28,0.08)', border:'1px solid rgba(192,20,28,0.2)', borderRadius:10, padding:'10px 14px' }}>
                <span style={{ fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--blood)', display:'block', marginBottom:8 }}>Your Famiglia</span>
                {mafiaAllies.length>0?(<div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{mafiaAllies.map(p=>(<div key={p.id} style={{ display:'flex', alignItems:'center', gap:6 }}><Avatar avatarId={p.avatarId} size={24} style={{ border:'1px solid rgba(192,20,28,0.4)' }}/><span style={{ fontSize:13, color:'#F87171' }}>{p.name}</span></div>))}</div>):(<span style={{ fontSize:13, color:'rgba(248,113,113,0.6)', fontStyle:'italic' }}>You act alone.</span>)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ width:'100%', maxWidth:360, opacity:revealed?1:0, transform:revealed?'translateY(0)':'translateY(12px)', transition:'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s' }}>
        <button onClick={handleReady} disabled={hasReadied} className={hasReadied?'':'btn-blood'} style={{ width:'100%', padding:'14px 20px', borderRadius:12, ...(hasReadied?{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--noir-border)', color:'var(--text-dim)', cursor:'not-allowed', fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase' }:{ animation:'startBtnPulse 2.5s ease-in-out infinite' }) }}>
          {hasReadied?(<span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><span style={{ animation:'checkBounce 0.4s cubic-bezier(0.34,1.56,0.64,1) both', display:'flex' }}><Check size={14}/></span>Waiting for others...</span>):'I Understand My Role'}
        </button>
      </div>
    </div>
  );
}

function NightPhase({ game, me, user }) {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [willText, setWillText] = useState(game.wills?.[user.uid]||'');
  const [willSaved, setWillSaved] = useState(false);
  const hasActed = !!game.actions[user.uid];
  const alivePlayers = Object.values(game.players).filter(p=>p.isAlive);
  const handleSaveWill = async () => { await updateDoc(getGameRef(game.code),{[`wills.${user.uid}`]:willText}); setWillSaved(true); setTimeout(()=>setWillSaved(false),2000); };
  const handleAction = async (overrideTarget) => {
    const passiveRoles=['villager','jester','mayor','medium'];
    let actionPayload=overrideTarget??selectedTarget??'skip';
    if (!me.isAlive||passiveRoles.includes(me.role)) actionPayload='sleep';
    await updateDoc(getGameRef(game.code),{[`actions.${user.uid}`]:actionPayload});
  };
  useEffect(() => { const passiveNightRoles=['villager','jester','mayor','medium']; if(!me.isAlive||passiveNightRoles.includes(me.role)){if(!hasActed)handleAction();} },[]);
  const passiveNightRoles=['villager','jester','mayor','medium'];
  const roleAccentColor={ mafia:'var(--blood)',godfather:'var(--blood)',framer:'var(--blood)',kidnapper:'var(--blood)',janitor:'var(--blood)',doctor:'var(--emerald)',sheriff:'var(--emerald)',medium:'var(--emerald)',detective:'var(--sapphire)',tracker:'var(--sapphire)',lookout:'var(--sapphire)',spy:'var(--sapphire)',vigilante:'var(--orange)',arsonist:'var(--orange)',bodyguard:'var(--amber)',escort:'var(--amethyst)',veteran:'var(--gold)' }[me.role]||'var(--text-mid)';
  if (!me.isAlive||passiveNightRoles.includes(me.role)) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:16 }}>
      <div className="night-fog-1"/><div className="night-fog-2"/>
      <div className="glass-card fade-up" style={{ maxWidth:380, width:'100%', padding:40, textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ animation:'skullIconFloat 5s ease-in-out infinite', marginBottom:20, display:'inline-block' }}><Moon size={40} color="var(--amethyst)" strokeWidth={1}/></div>
        <h2 className="font-display" style={{ fontSize:28, marginBottom:12 }}>Night Falls</h2>
        <p style={{ color:'var(--text-mid)', fontSize:16, fontStyle:'italic', marginBottom:24 }}>{!me.isAlive?"The dead watch from the shadows.":"Rest. The others move in darkness."}</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'var(--text-dim)' }}>
          <div style={{ width:14, height:14, border:'1px solid rgba(255,255,255,0.1)', borderTop:'1px solid var(--amethyst)', borderRadius:'50%', animation:'spinnerMorph 1.4s cubic-bezier(0.5,0,0.5,1) infinite' }}/>
          <span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase' }}>Waiting for dawn</span>
        </div>
      </div>
      {me.isAlive&&(
        <div className="glass-card fade-up" style={{ maxWidth:380, width:'100%', padding:24, position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)' }}>📜 Last Will</span>
            <button onClick={handleSaveWill} style={{ padding:'4px 12px', borderRadius:6, cursor:'pointer', background:willSaved?'rgba(29,179,106,0.15)':'rgba(255,255,255,0.04)', border:`1px solid ${willSaved?'rgba(29,179,106,0.4)':'var(--noir-border)'}`, color:willSaved?'var(--emerald)':'var(--text-dim)', fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.2s' }}>{willSaved?'✓ Saved':'Save'}</button>
          </div>
          <textarea value={willText} onChange={e=>setWillText(e.target.value)} placeholder="Write your last words..." maxLength={400} className="noir-input" style={{ width:'100%', padding:'8px 12px', borderRadius:8, resize:'vertical', minHeight:70, fontSize:14, lineHeight:1.5, fontStyle:'italic' }}/>
        </div>
      )}
    </div>
  );
  const instruction={ mafia:"Choose your mark for tonight.", godfather:"Order the hit.", framer:"Frame someone as mafia.", kidnapper:"Kidnap someone, blocking their action.", janitor:"Choose the kill target — you will hide their role.", doctor:"Who will you protect from harm?", detective:"Investigate a suspect.", sheriff:"Interrogate someone — you'll learn their exact role.", vigilante:"One bullet. Choose wisely.", bodyguard:"Guard someone with your life.", escort:"Distract someone, blocking their night action.", tracker:"Follow someone — see who they visit.", lookout:"Watch a house — see who visits.", spy:"You automatically spy on mafia movements tonight.", veteran:me.hasUsedAbility?"You've used your alert. Watch and wait.":"Go on alert to kill anyone who visits you.", arsonist:"Douse someone — or ignite all doused targets." }[me.role];
  const filterPlayers=isMafiaRole(me.role)?alivePlayers.filter(p=>!isMafiaRole(p.role)):alivePlayers.filter(p=>p.id!==user.uid);
  const isSpecialAction=['veteran','arsonist','spy','blackmailer'].includes(me.role);
  return (
    <div style={{ maxWidth:700, margin:'0 auto', position:'relative' }}>
      <div className="night-fog-1"/><div className="night-fog-2"/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', padding:'20px 0 28px', animation:'fadeUp 0.4s ease both' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ animation:'aliveDot 2s ease-in-out infinite' }}><Moon size={18} color="var(--amethyst)" strokeWidth={1.5}/></div>
            <span style={{ fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-dim)' }}>Night Phase</span>
          </div>
          <h2 style={{ fontSize:22, color:roleAccentColor, fontStyle:'italic' }}>{instruction}</h2>
        </div>
        <div className="glass-card" style={{ padding:24, animation:'fadeUp 0.4s ease 0.1s both' }}>
          {hasActed?(
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:52, height:52, borderRadius:'50%', background:'rgba(29,179,106,0.12)', border:'1px solid rgba(29,179,106,0.3)', marginBottom:16, animation:'checkBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}><Check size={22} color="var(--emerald)"/></div>
              <p style={{ fontSize:18, marginBottom:6 }}>Action locked in.</p>
              <p style={{ color:'var(--text-dim)', fontStyle:'italic', fontSize:15, marginBottom:24 }}>Waiting for others to act...</p>
              <div style={{ textAlign:'left', marginTop:8 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)' }}>📜 Last Will</span>
                  <button onClick={handleSaveWill} style={{ padding:'4px 12px', borderRadius:6, cursor:'pointer', background:willSaved?'rgba(29,179,106,0.15)':'rgba(255,255,255,0.04)', border:`1px solid ${willSaved?'rgba(29,179,106,0.4)':'var(--noir-border)'}`, color:willSaved?'var(--emerald)':'var(--text-dim)', fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.2s' }}>{willSaved?'✓ Saved':'Save'}</button>
                </div>
                <textarea value={willText} onChange={e=>setWillText(e.target.value)} placeholder="Write your last words..." maxLength={400} className="noir-input" style={{ width:'100%', padding:'8px 12px', borderRadius:8, resize:'vertical', minHeight:70, fontSize:14, lineHeight:1.5, fontStyle:'italic' }}/>
              </div>
            </div>
          ):isSpecialAction?(<div style={{ display:'flex', flexDirection:'column', gap:12, padding:'16px 0' }}>
            {me.role==='veteran'&&!me.hasUsedAbility&&<button className="btn-blood" style={{ padding:'14px', borderRadius:10, fontSize:15, animation:'startBtnPulse 2s ease-in-out infinite' }} onClick={()=>handleAction('alert')}>🔫 Go On Alert (kills all visitors tonight)</button>}
            {me.role==='veteran'&&me.hasUsedAbility&&<p style={{ textAlign:'center', color:'var(--text-dim)', fontStyle:'italic', padding:'20px 0' }}>Your alert has been used.</p>}
            {me.role==='arsonist'&&(<>
              <button className="btn-blood" style={{ padding:'14px', borderRadius:10, fontSize:15 }} onClick={()=>handleAction('ignite')}>🔥 Ignite All Doused Targets</button>
              <p style={{ textAlign:'center', fontFamily:'DM Mono', fontSize:10, color:'var(--text-dim)', letterSpacing:'0.1em' }}>— or pick a player below to douse them —</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:10 }}>
                {alivePlayers.filter(p=>p.id!==user.uid).map((p,idx)=>(<button key={p.id} onClick={()=>setSelectedTarget(p.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'12px 8px', cursor:'pointer', borderRadius:10, position:'relative', border:`1px solid ${selectedTarget===p.id?'rgba(234,88,12,0.6)':'var(--noir-border)'}`, background:selectedTarget===p.id?'rgba(234,88,12,0.12)':'rgba(255,255,255,0.02)', transition:'all 0.2s', transform:selectedTarget===p.id?'scale(1.04)':'scale(1)', animation:`playerCardIn 0.3s ease ${idx*40}ms both` }}><Avatar avatarId={p.avatarId} size={36}/><span style={{ fontSize:13, color:'var(--text-mid)' }}>{p.name}</span>{p.doused&&<span style={{ position:'absolute', top:4, right:6, fontSize:12 }}>🔥</span>}</button>))}
              </div>
              {selectedTarget&&!['skip','ignite'].includes(selectedTarget)&&<button onClick={()=>handleAction(selectedTarget)} className="btn-blood" style={{ padding:'13px', borderRadius:10, fontSize:14, animation:'fadeUp 0.2s ease both' }}>Douse {alivePlayers.find(p=>p.id===selectedTarget)?.name}</button>}
            </>)}
            {me.role==='spy'&&(<div style={{ textAlign:'center', padding:'20px 0', display:'flex', flexDirection:'column', gap:12 }}><p style={{ color:'var(--text-mid)', fontStyle:'italic', lineHeight:1.6 }}>You automatically intercept mafia communications tonight.</p><button className="btn-sapphire" style={{ padding:'13px 24px', borderRadius:10 }} onClick={()=>handleAction('spy_passive')}>Begin Surveillance</button></div>)}
            {me.role==='blackmailer'&&(<><p style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.1em', color:'var(--text-dim)', textAlign:'center' }}>Choose who to silence tomorrow</p><div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:10 }}>{alivePlayers.filter(p=>p.id!==user.uid).map((p,idx)=>(<button key={p.id} onClick={()=>setSelectedTarget(p.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'12px 8px', cursor:'pointer', borderRadius:10, border:`1px solid ${selectedTarget===p.id?'rgba(192,20,28,0.6)':'var(--noir-border)'}`, background:selectedTarget===p.id?'rgba(192,20,28,0.1)':'rgba(255,255,255,0.02)', transition:'all 0.2s', transform:selectedTarget===p.id?'scale(1.04)':'scale(1)', animation:`playerCardIn 0.3s ease ${idx*40}ms both` }}><Avatar avatarId={p.avatarId} size={36}/><span style={{ fontSize:13, color:'var(--text-mid)' }}>{p.name}</span></button>))}</div></>)}
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button onClick={()=>handleAction('skip')} className="btn-ghost" style={{ flex:1, padding:'12px', borderRadius:10 }}>Skip</button>
              {me.role==='blackmailer'&&selectedTarget&&<button onClick={()=>handleAction(selectedTarget)} className="btn-blood" style={{ flex:2, padding:'12px', borderRadius:10, animation:'fadeUp 0.2s ease both' }}>Silence {alivePlayers.find(p=>p.id===selectedTarget)?.name}</button>}
            </div>
          </div>):(
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:10, marginBottom:20 }}>
                {filterPlayers.map((p,idx)=>(<button key={p.id} onClick={()=>setSelectedTarget(p.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'14px 10px', cursor:'pointer', borderRadius:10, border:`1px solid ${selectedTarget===p.id?`${roleAccentColor}50`:'var(--noir-border)'}`, background:selectedTarget===p.id?`${roleAccentColor}10`:'rgba(255,255,255,0.02)', transition:'all 0.2s cubic-bezier(0.34,1.56,0.64,1)', transform:selectedTarget===p.id?'scale(1.04) translateY(-2px)':'scale(1)', animation:`playerCardIn 0.35s ease ${idx*45}ms both` }}>
                  <div style={{ borderRadius:'50%', border:selectedTarget===p.id?`2px solid ${roleAccentColor}`:'2px solid transparent', transition:'border-color 0.15s ease, box-shadow 0.2s', boxShadow:selectedTarget===p.id?`0 0 12px ${roleAccentColor}40`:'none', padding:1 }}><Avatar avatarId={p.avatarId} size={36}/></div>
                  <span style={{ fontSize:14, color:selectedTarget===p.id?'var(--text-bright)':'var(--text-mid)', textAlign:'center' }}>{p.name}</span>
                </button>))}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>handleAction('skip')} className="btn-ghost" style={{ flex:1, padding:'12px 16px', borderRadius:10 }}>Skip</button>
                <button onClick={()=>handleAction(selectedTarget)} disabled={!selectedTarget} className={selectedTarget?'btn-blood':''} style={{ flex:2, padding:'12px 16px', borderRadius:10, ...(!selectedTarget?{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--noir-border)', color:'var(--text-dim)', cursor:'not-allowed', fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase' }:{ animation:'startBtnPulse 2s ease-in-out infinite' }) }}>Confirm Target</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DayPhase({ game, me, user }) {
  const [selectedVote, setSelectedVote] = useState(null);
  const [guessTarget, setGuessTarget] = useState(null);
  const [guessedRole, setGuessedRole] = useState('');
  const [willText, setWillText] = useState(game.wills?.[user.uid]||'');
  const [willSaved, setWillSaved] = useState(false);
  const hasVoted=!!game.actions[user.uid], hasGuessed=!!game.guesses?.[user.uid];
  const alivePlayers=Object.values(game.players).filter(p=>p.isAlive);
  const hasDismissedDawn=!!game.dawnSeen?.[user.uid], nightDeaths=game.nightDeaths||[];
  const handleVote=async()=>{await updateDoc(getGameRef(game.code),{[`actions.${user.uid}`]:selectedVote||'skip'});};
  const handleGuess=async()=>{if(!guessTarget||!guessedRole)return;await updateDoc(getGameRef(game.code),{[`guesses.${user.uid}`]:{targetId:guessTarget,guessedRole}});};
  const handleSaveWill=async()=>{await updateDoc(getGameRef(game.code),{[`wills.${user.uid}`]:willText});setWillSaved(true);setTimeout(()=>setWillSaved(false),2000);};
  const handleDismissDawn=async()=>{await updateDoc(getGameRef(game.code),{[`dawnSeen.${user.uid}`]:true});};
  const myInvestigation=game.investigations?.[user.uid];
  const showInvestigation=['detective','sheriff','tracker','lookout','spy'].includes(me.role)&&myInvestigation&&myInvestigation.phase===game.phaseNum;
  const availableRoles=['villager','mafia','godfather','framer','kidnapper','janitor','doctor','sheriff','detective','tracker','lookout','spy','vigilante','bodyguard','escort','mayor','veteran','medium','jester','arsonist','blackmailer'];
  const roleTagColor={ villager:'var(--text-dim)',mafia:'var(--blood)',godfather:'var(--blood)',framer:'var(--blood)',kidnapper:'var(--blood)',janitor:'var(--blood)',blackmailer:'var(--blood)',doctor:'var(--emerald)',sheriff:'var(--emerald)',detective:'var(--sapphire)',tracker:'var(--sapphire)',lookout:'var(--sapphire)',spy:'var(--sapphire)',vigilante:'var(--orange)',arsonist:'var(--orange)',bodyguard:'var(--amber)',mayor:'var(--amber)',veteran:'var(--amber)',escort:'var(--amethyst)',medium:'var(--amethyst)',jester:'var(--amethyst)' };

  if (!hasDismissedDawn&&game.hasOwnProperty('nightDeaths')) {
    const deathDetails=nightDeaths.map(uid=>({uid,player:game.players[uid],will:game.wills?.[uid]||null}));
    const isPeaceful=nightDeaths.length===0;
    return (
      <div style={{ position:'fixed', inset:0, zIndex:500, background:isPeaceful?'radial-gradient(ellipse at 50% 40%, rgba(40,40,60,0.8) 0%, rgba(10,10,20,0.9) 50%, #000 80%)':'radial-gradient(ellipse at 50% 30%, rgba(100,0,0,0.6) 0%, rgba(30,0,0,0.8) 40%, #000 80%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.8) 100%)', pointerEvents:'none', animation:'vignetteIn 1s ease forwards' }}/>
        {!isPeaceful&&(
          <div style={{ position:'absolute', top:0, left:0, right:0, display:'flex', justifyContent:'space-around', pointerEvents:'none' }}>
            {[0,1,2,3,4,5,6].map(i=>(<div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}><div style={{ width:1.5+(i%3)*0.5, height:`${50+(i*17)%60}px`, background:'linear-gradient(to bottom, var(--blood), rgba(192,20,28,0.3))', animation:`bloodDrip ${0.7+(i*0.12)}s ease ${0.2+(i*0.09)}s both`, opacity:0.5+(i%3)*0.1, borderRadius:'0 0 2px 2px' }}/><div style={{ width:5+(i%3)*2, height:6+(i%3)*2.5, background:'var(--blood)', borderRadius:'50% 50% 60% 60%', marginTop:-1, opacity:0, animation:`bloodPuddle 0.5s ease ${0.9+(i*0.12)}s both`, filter:'blur(0.5px)' }}/></div>))}
          </div>
        )}
        <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:600, padding:'0 20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          {isPeaceful?(<>
            <div style={{ animation:'peacefulGlow 1s ease 0.3s both', opacity:0 }}><Moon size={52} color="rgba(139,92,246,0.7)" strokeWidth={1} style={{ marginBottom:24, display:'block', margin:'0 auto 24px', animation:'skullIconFloat 5s ease-in-out infinite' }}/></div>
            <h1 className="font-display" style={{ fontSize:'clamp(36px,8vw,64px)', fontWeight:900, color:'rgba(200,195,220,0.9)', textAlign:'center', marginBottom:12, animation:'dawnSlideDown 1s ease 0.6s both', opacity:0 }}>A Quiet Night</h1>
            <p style={{ fontFamily:'Crimson Pro', fontStyle:'italic', fontSize:20, color:'rgba(150,145,165,0.8)', textAlign:'center', marginBottom:40, animation:'dawnSlideUp 1s ease 1s both', opacity:0 }}>Dawn breaks. The city stirs. Nobody was harmed.</p>
          </>):(<>
            <div style={{ animation:'dawnFadeIn 0.6s ease 0.1s both', opacity:0, marginBottom:20 }}><span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(192,20,28,0.6)' }}>Dawn — Night {game.phaseNum-1}</span></div>
            <div style={{ animation:'dawnSlideDown 0.8s ease 0.3s both', opacity:0, textAlign:'center', marginBottom:8 }}><h1 className="font-display" style={{ fontSize:'clamp(28px,7vw,56px)', fontWeight:900, color:'#F0EDE8', lineHeight:1.1 }}>{deathDetails.length===1?'A body was found.':`${deathDetails.length} bodies were found.`}</h1></div>
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:16, marginTop:28, marginBottom:8 }}>
              {deathDetails.map(({uid,player,will},idx)=>(<div key={uid} style={{ animation:`dawnSlideUp 0.7s ease ${0.7+idx*0.25}s both`, opacity:0, background:'rgba(0,0,0,0.5)', border:'1px solid rgba(192,20,28,0.25)', borderRadius:16, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, padding:'18px 22px', background:'rgba(192,20,28,0.08)', borderBottom:will?'1px solid rgba(192,20,28,0.15)':'none' }}>
                  <div style={{ flexShrink:0, animation:`skullPulse 0.6s ease ${1+idx*0.25}s both`, opacity:0, border:'2px solid rgba(192,20,28,0.4)', borderRadius:'50%', padding:2 }}><Avatar avatarId={player?.avatarId} size={44} dead={true}/></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h2 className="font-display" style={{ fontSize:26, fontWeight:700, color:'#F0EDE8', letterSpacing:'0.04em', animation:`nameReveal 0.8s ease ${1.1+idx*0.25}s both`, opacity:0 }}>{player.name}</h2>
                    <span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(192,20,28,0.7)' }}>was the {player.role}</span>
                  </div>
                </div>
                {will?(<div style={{ margin:16, padding:'16px 18px', background:'rgba(240,230,200,0.06)', border:'1px solid rgba(240,230,200,0.15)', borderRadius:4, animation:`willFadeIn 0.8s ease ${1.4+idx*0.25}s both`, opacity:0 }}><p style={{ fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(240,230,200,0.4)', marginBottom:10 }}>Last Will &amp; Testament</p><p style={{ fontFamily:'Crimson Pro', fontStyle:'italic', fontSize:16, lineHeight:1.7, color:'rgba(240,230,200,0.75)', whiteSpace:'pre-wrap' }}>"{will}"</p></div>):(<div style={{ padding:'12px 22px' }}><p style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.1em', color:'rgba(255,255,255,0.2)', fontStyle:'italic' }}>No will was left behind.</p></div>)}
              </div>))}
            </div>
          </>)}
          <button onClick={handleDismissDawn} style={{ marginTop:32, animation:`dawnFadeIn 0.6s ease ${isPeaceful?1.6:1.8+deathDetails.length*0.25}s both`, opacity:0, padding:'12px 36px', borderRadius:10, cursor:'pointer', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', color:'var(--text-mid)', fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', transition:'all 0.2s' }} onMouseEnter={e=>{e.target.style.background='rgba(255,255,255,0.1)';e.target.style.color='var(--text-bright)';}} onMouseLeave={e=>{e.target.style.background='rgba(255,255,255,0.06)';e.target.style.color='var(--text-mid)';}}>Enter the day</button>
        </div>
      </div>
    );
  }

  if (!me.isAlive) return (<div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}><div className="glass-card fade-up" style={{ maxWidth:380, width:'100%', padding:40, textAlign:'center' }}><div style={{ animation:'skullIconFloat 4s ease-in-out infinite', display:'inline-block', marginBottom:20 }}><Skull size={40} color="var(--text-dim)" strokeWidth={1}/></div><h2 className="font-display" style={{ fontSize:28, marginBottom:12, color:'var(--text-dim)' }}>You Are Dead</h2><p style={{ color:'var(--text-dim)', fontSize:16, fontStyle:'italic' }}>Observe the living make their mistakes.</p></div></div>);

  return (
    <div style={{ maxWidth:700, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
      <div className="glass-card" style={{ padding:24, animation:'fadeUp 0.4s ease both' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}><div style={{ animation:'skullIconFloat 4s ease-in-out infinite' }}><Sun size={16} color="var(--gold)" strokeWidth={1.5}/></div><span style={{ fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)' }}>Morning Report</span></div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {game.logs.slice(-5).map((log,i)=>{const isDeath=log.includes('killed')||log.includes('dead')||log.includes('executed')||log.includes('found dead')||log.includes('shot')||log.includes('burned'); return (<div key={i} className={isDeath?'log-death':'log-normal'} style={{ padding:'10px 14px', borderRadius:8, animation:`logEntrySlide 0.35s ease ${i*60}ms both` }}><p style={{ color:isDeath?'#FCA5A5':'var(--text-mid)', fontSize:15, fontStyle:'italic' }}>{log}</p></div>);})}
        </div>
        {showInvestigation&&(<div style={{ marginTop:14, background:'rgba(42,127,212,0.08)', border:'1px solid rgba(42,127,212,0.2)', borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'flex-start', gap:12, animation:'fadeUp 0.4s ease 0.3s both' }}><Search size={16} color="var(--sapphire)" style={{ marginTop:2, flexShrink:0 }}/><div><span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--sapphire)', display:'block', marginBottom:4 }}>{me.role==='spy'?'Mafia Intel':me.role==='tracker'?'Tracking Report':me.role==='lookout'?'Lookout Report':me.role==='sheriff'?'Interrogation Result':'Investigation Result'}</span><p style={{ fontSize:15, color:'var(--text-mid)' }}>{myInvestigation.target&&<><strong style={{ color:'var(--text-bright)' }}>{game.players[myInvestigation.target]?.name}</strong>{' is '}</>}<strong style={{ color:myInvestigation.isMafia?'var(--blood)':'var(--emerald)', fontFamily:'DM Mono', fontSize:13, letterSpacing:'0.05em' }}>{myInvestigation.result||(myInvestigation.isMafia?'SUSPICIOUS':'NOT SUSPICIOUS')}</strong></p></div></div>)}
      </div>
      <div className="glass-card" style={{ padding:24, animation:'fadeUp 0.4s ease 0.1s both' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:14 }}>📜</span><span style={{ fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)' }}>Last Will</span></div><button onClick={handleSaveWill} style={{ padding:'5px 14px', borderRadius:6, cursor:'pointer', background:willSaved?'rgba(29,179,106,0.15)':'rgba(255,255,255,0.04)', border:`1px solid ${willSaved?'rgba(29,179,106,0.4)':'var(--noir-border)'}`, color:willSaved?'var(--emerald)':'var(--text-dim)', fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.2s' }}>{willSaved?'✓ Saved':'Save'}</button></div>
        <textarea value={willText} onChange={e=>setWillText(e.target.value)} placeholder="Write your final words, suspicions, or evidence here..." maxLength={400} className="noir-input" style={{ width:'100%', padding:'10px 14px', borderRadius:10, resize:'vertical', minHeight:80, fontSize:15, lineHeight:1.6, fontStyle:'italic' }}/>
        <p style={{ textAlign:'right', fontFamily:'DM Mono', fontSize:9, color:'var(--text-dim)', marginTop:4 }}>{willText.length}/400</p>
      </div>
      {!hasGuessed&&me.isAlive&&(<div className="glass-card" style={{ padding:24, animation:'fadeUp 0.4s ease 0.15s both' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}><Target size={16} color="var(--amethyst)"/><span style={{ fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--amethyst)' }}>Risky Guess</span></div>
        <p style={{ color:'var(--text-dim)', fontSize:14, fontStyle:'italic', marginBottom:16 }}>Correctly name someone's role and they die. Guess wrong and you do.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:8, marginBottom:12 }}>
          {alivePlayers.filter(p=>p.id!==me.id).map((p,idx)=>(<button key={p.id} onClick={()=>setGuessTarget(p.id)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:8, cursor:'pointer', background:guessTarget===p.id?'rgba(139,92,246,0.12)':'rgba(255,255,255,0.02)', border:`1px solid ${guessTarget===p.id?'rgba(139,92,246,0.4)':'var(--noir-border)'}`, color:guessTarget===p.id?'var(--text-bright)':'var(--text-mid)', transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)', transform:guessTarget===p.id?'scale(1.04)':'scale(1)', animation:`playerCardIn 0.3s ease ${idx*35}ms both` }}><User size={13}/><span style={{ fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span></button>))}
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          {availableRoles.map(role=>{const c=roleTagColor[role]||'var(--text-dim)'; return (<button key={role} onClick={()=>setGuessedRole(role)} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, textTransform:'capitalize', cursor:'pointer', transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)', background:guessedRole===role?`${c}20`:'rgba(255,255,255,0.03)', border:`1px solid ${guessedRole===role?`${c}60`:'var(--noir-border)'}`, color:guessedRole===role?c:'var(--text-dim)', fontFamily:'DM Mono', transform:guessedRole===role?'scale(1.06)':'scale(1)' }}>{role}</button>);})}
        </div>
        <button onClick={handleGuess} disabled={!guessTarget||!guessedRole} style={{ width:'100%', padding:'11px 16px', borderRadius:10, fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', cursor:(!guessTarget||!guessedRole)?'not-allowed':'pointer', background:(!guessTarget||!guessedRole)?'rgba(255,255,255,0.03)':'rgba(139,92,246,0.8)', border:`1px solid ${(!guessTarget||!guessedRole)?'var(--noir-border)':'rgba(139,92,246,0.5)'}`, color:(!guessTarget||!guessedRole)?'var(--text-dim)':'white', transition:'all 0.2s', animation:(!guessTarget||!guessedRole)?'none':'startBtnPulse 2s ease-in-out infinite' }}>{guessedRole&&guessTarget?`Accuse ${game.players[guessTarget]?.name} of being ${guessedRole}`:'Select target & role'}</button>
      </div>)}
      {hasGuessed&&(<div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:10, padding:'12px 16px', animation:'fadeUp 0.3s ease both' }}><span style={{ animation:'checkBounce 0.4s cubic-bezier(0.34,1.56,0.64,1) both', display:'flex' }}><Check size={14} color="var(--amethyst)"/></span><span style={{ color:'var(--amethyst)', fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase' }}>Accusation filed — revealed at nightfall</span></div>)}
      <div className="glass-card" style={{ padding:24, animation:'fadeUp 0.4s ease 0.2s both' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}><Shield size={16} color="var(--text-dim)"/><span style={{ fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)' }}>Village Tribunal</span></div>
        {hasVoted?(<div style={{ textAlign:'center', padding:'28px 0' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:44, height:44, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', marginBottom:14, animation:'checkBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both, voteGlow 2.5s ease-in-out infinite' }}><Check size={20} color="var(--gold)"/></div>
          <p style={{ fontSize:17, marginBottom:4 }}>Vote registered.</p>
          <p style={{ color:'var(--text-dim)', fontSize:14, fontStyle:'italic', marginBottom:20 }}>Waiting for the village to decide...</p>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center' }}>{Object.entries(game.actions).filter(([,v])=>v!=='sleep'&&v!=='skip').map(([uid],i)=>(<span key={uid} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--noir-border)', borderRadius:6, padding:'3px 10px', fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.05em', color:'var(--text-dim)', animation:`playerCardIn 0.3s ease ${i*50}ms both` }}>{game.players[uid]?.name}</span>))}</div>
        </div>):(<>
          <p style={{ color:'var(--text-dim)', fontSize:15, fontStyle:'italic', marginBottom:16 }}>Discuss in chat, then vote to execute a suspect.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:8, marginBottom:20 }}>
            {alivePlayers.map((p,idx)=>(<button key={p.id} onClick={()=>setSelectedVote(p.id)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:8, cursor:'pointer', background:selectedVote===p.id?'rgba(201,168,76,0.1)':'rgba(255,255,255,0.02)', border:`1px solid ${selectedVote===p.id?'rgba(201,168,76,0.4)':'var(--noir-border)'}`, color:selectedVote===p.id?'var(--gold)':'var(--text-mid)', transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)', transform:selectedVote===p.id?'scale(1.04)':'scale(1)', animation:`playerCardIn 0.3s ease ${idx*40}ms both` }}><User size={13}/><span style={{ fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span></button>))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>{setSelectedVote('skip');handleVote();}} className="btn-ghost" style={{ flex:1, padding:'12px 16px', borderRadius:10 }}>Abstain</button>
            <button onClick={handleVote} disabled={!selectedVote} style={{ flex:2, padding:'12px 16px', borderRadius:10, fontFamily:'DM Mono', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', cursor:!selectedVote?'not-allowed':'pointer', background:!selectedVote?'rgba(255,255,255,0.03)':'rgba(201,168,76,0.8)', border:`1px solid ${!selectedVote?'var(--noir-border)':'rgba(201,168,76,0.5)'}`, color:!selectedVote?'var(--text-dim)':'#0D0C10', fontWeight:700, transition:'all 0.2s', animation:!selectedVote?'none':'voteGlow 2.5s ease-in-out infinite' }}>Cast Vote</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

function GameOver({ game, me, onLeave }) {
  const winner=game.winner;
  const isMafiaWin=winner==='mafia', isJesterWin=winner==='jester', isArsonistWin=winner==='arsonist';
  const myTeamWon=isJesterWin?me.role==='jester':isArsonistWin?me.role==='arsonist':isMafiaWin?isMafiaRole(me.role):!isMafiaRole(me.role)&&me.role!=='arsonist'&&me.role!=='jester';
  const winConfig={ mafia:{color:'var(--blood)',icon:<Skull size={40} color="var(--blood)" strokeWidth={1}/>,label:'Mafia Wins'}, village:{color:'var(--sapphire)',icon:<Shield size={40} color="var(--sapphire)" strokeWidth={1}/>,label:'Village Wins'}, jester:{color:'var(--amethyst)',icon:<Ghost size={40} color="var(--amethyst)" strokeWidth={1}/>,label:'The Jester Wins'}, arsonist:{color:'var(--orange)',icon:<Zap size={40} color="var(--orange)" strokeWidth={1}/>,label:'The Arsonist Wins'} };
  const config=winConfig[winner]||{color:'var(--text-mid)',icon:<Sword size={40} color="var(--text-mid)"/>,label:'Game Over'};
  const roleColor={ mafia:'var(--blood)',godfather:'#8B0000',framer:'var(--blood)',kidnapper:'var(--blood)',janitor:'var(--blood)',doctor:'var(--emerald)',sheriff:'var(--emerald)',medium:'var(--emerald)',detective:'var(--sapphire)',tracker:'var(--sapphire)',lookout:'var(--sapphire)',spy:'var(--sapphire)',vigilante:'var(--orange)',arsonist:'var(--orange)',bodyguard:'var(--amber)',escort:'var(--amethyst)',mayor:'var(--gold)',veteran:'var(--gold)',jester:'var(--amethyst)',blackmailer:'var(--blood)',villager:'var(--text-dim)' };
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:'20px 0' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:`radial-gradient(ellipse 60% 40% at 50% 50%, ${config.color}12 0%, transparent 70%)`, animation:'roleGlowBreathe 3s ease-in-out infinite' }}/>
      <div style={{ maxWidth:560, width:'100%', padding:'40px 36px', textAlign:'center', background:'var(--noir-card)', border:'1px solid var(--noir-border)', borderRadius:16, position:'relative', overflow:'hidden', animation:'fadeUp 0.5s ease both' }}>
        <div style={{ position:'absolute', inset:0, borderRadius:16, background:`radial-gradient(ellipse at 50% -10%, ${config.color}10 0%, transparent 60%)`, pointerEvents:'none' }}/>
        <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:80, height:80, borderRadius:20, marginBottom:20, background:`${config.color}15`, border:`1px solid ${config.color}30`, boxShadow:`0 0 40px ${config.color}25`, animation:'winIconPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both' }}>{config.icon}</div>
        <h1 className="font-display" style={{ fontSize:44, fontWeight:900, color:config.color, marginBottom:6, letterSpacing:'-0.01em', animation:'winTitleReveal 0.8s ease 0.3s both', opacity:0 }}>{config.label}</h1>
        <p style={{ fontSize:18, fontStyle:'italic', marginBottom:28, color:myTeamWon?'var(--emerald)':'var(--text-dim)', animation:'fadeUp 0.5s ease 0.6s both', opacity:0 }}>{myTeamWon?'Victory is yours.':'Better luck next time.'}</p>
        <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:12, border:'1px solid var(--noir-border)', padding:16, marginBottom:24, maxHeight:240, overflowY:'auto', textAlign:'left' }}>
          <p style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:12, paddingBottom:10, borderBottom:'1px solid var(--noir-border)' }}>Final Roles</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {Object.values(game.players).map((p,idx)=>{const rc=roleColor[p.role]||'var(--text-dim)'; return (<div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.02)', border:'1px solid var(--noir-border)', animation:`playerRowIn 0.35s ease ${0.7+idx*0.06}s both`, opacity:0 }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar avatarId={p.avatarId} size={28} dead={!p.isAlive}/><span style={{ fontSize:15, color:p.isAlive?'var(--text-bright)':'var(--text-dim)', textDecoration:!p.isAlive?'line-through':'none' }}>{p.name}{!p.isAlive&&' ☩'}</span></div><span className="role-badge" style={{ background:`${rc}15`, border:`1px solid ${rc}35`, color:rc }}>{p.role}</span></div>);  })}
          </div>
        </div>
        <button onClick={onLeave} className="btn-ghost" style={{ padding:'12px 32px', borderRadius:10, animation:'fadeUp 0.4s ease 1.2s both', opacity:0 }}>Return to Menu</button>
      </div>
    </div>
  );
}

// ─── Player List ──────────────────────────────────────────────────────────────
function PlayerList({ game, me }) {
  const players=Object.values(game.players);
  const aliveCount=players.filter(p=>p.isAlive).length;
  return (
    <div style={{ borderBottom:'1px solid var(--noir-border)', padding:16, flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)', display:'flex', alignItems:'center', gap:6 }}><Users size={11}/> Players</span>
        <span style={{ fontFamily:'DM Mono', fontSize:10, color:'var(--text-dim)', background:'rgba(255,255,255,0.04)', border:'1px solid var(--noir-border)', borderRadius:4, padding:'2px 8px' }}>{aliveCount} alive</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        {players.map((p,idx)=>(<div key={p.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, opacity:p.isAlive?1:0.4, filter:p.isAlive?'none':'grayscale(60%)', background:p.id===me.id?'rgba(255,255,255,0.04)':'transparent', border:p.id===me.id?'1px solid var(--noir-border)':'1px solid transparent', transition:'opacity 0.6s ease, filter 0.6s ease', animation:`playerCardIn 0.3s ease ${idx*40}ms both` }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <Avatar avatarId={p.avatarId} size={28} dead={!p.isAlive}/>
            {p.isAlive&&<div style={{ position:'absolute', bottom:0, right:0, width:7, height:7, borderRadius:'50%', background:'var(--emerald)', border:'1px solid var(--noir-black)', animation:'aliveDot 2.5s ease-in-out infinite', animationDelay:`${idx*200}ms` }}/>}
            {!p.isAlive&&<div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}><Skull size={10} color="rgba(255,255,255,0.5)"/></div>}
          </div>
          <span style={{ fontSize:14, color:p.isAlive?'var(--text-bright)':'var(--text-dim)', textDecoration:!p.isAlive?'line-through':'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, transition:'color 0.4s' }}>{p.name}{p.id===me.id&&<span style={{ color:'var(--text-dim)', fontSize:11 }}> (you)</span>}</span>
          {isMafiaRole(me.role)&&isMafiaRole(p.role)&&p.id!==me.id&&<div style={{ animation:'aliveDot 2s ease-in-out infinite' }}><Skull size={10} color="var(--blood)"/></div>}
        </div>))}
      </div>
    </div>
  );
}

// ─── Chat Box ─────────────────────────────────────────────────────────────────
function ChatBox({ game, me, user, isMafiaChat = false }) {
  const [msg, setMsg] = useState('');
  // ↓ ref to the scrollable container div — NOT the sentinel element
  const scrollContainerRef = useRef(null);
  const isNight = game.status === 'night';
  const isBlackmailed = !isMafiaChat && game.blackmailed?.target === user.uid && game.blackmailed?.phase === game.phaseNum;
  const canChat = isMafiaChat ? (isMafiaRole(me.role) && me.isAlive) : (!isNight && me.isAlive && !isBlackmailed);
  const messages = isMafiaChat ? (game.mafiaMessages || []) : (game.messages || []);

  useEffect(() => {
    // Scroll the chat container itself — never touches the page scroll
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim() || !canChat) return;
    const messageObj = { senderId:user.uid, senderName:me.name, senderAvatarId:me.avatarId, text:msg.trim(), isDead:!me.isAlive, phase:game.status, timestamp:Date.now() };
    setMsg('');
    const field = isMafiaChat ? 'mafiaMessages' : 'messages';
    await updateDoc(getGameRef(game.code), { [field]: arrayUnion(messageObj) });
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0, background:isMafiaChat?'rgba(192,20,28,0.04)':'transparent' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${isMafiaChat?'rgba(192,20,28,0.2)':'var(--noir-border)'}`, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        {isMafiaChat
          ? <><Skull size={11} color="var(--blood)"/><span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--blood)' }}>Famiglia — secret channel</span></>
          : <><MessageSquare size={11} color="var(--text-dim)"/><span style={{ fontFamily:'DM Mono', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-dim)' }}>Town Square{isNight?' — silent':''}</span></>
        }
      </div>

      {/* Night lockout */}
      {!isMafiaChat && isNight && (
        <div style={{ padding:'10px 16px', background:'rgba(139,92,246,0.06)', borderBottom:'1px solid rgba(139,92,246,0.15)', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <div style={{ animation:'aliveDot 2s ease-in-out infinite' }}><Moon size={12} color="var(--amethyst)"/></div>
          <span style={{ fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(139,92,246,0.7)' }}>The town sleeps. No messages until dawn.</span>
        </div>
      )}

      {/*
        THE FIX: this div is the scroll container.
        - overflow-y: auto  → only this div scrolls, not the page
        - flex: 1           → takes up remaining space
        - min-height: 0     → lets flex shrink below content size
        We ref this div and set scrollTop directly — no scrollIntoView.
      */}
      <div ref={scrollContainerRef} className="chat-scroll-area">
        {messages.length === 0 && (
          <p style={{ textAlign:'center', color:'var(--text-dim)', fontSize:13, fontStyle:'italic', marginTop:20 }}>
            {isMafiaChat ? 'Your channel awaits...' : 'Silence fills the square...'}
          </p>
        )}
        {messages.map((m, i) => {
          const isMe = m.senderId === user.uid;
          const bubbleClass = m.isDead ? 'chat-dead' : isMe ? (isMafiaChat?'chat-mafia-me':'chat-me') : (isMafiaChat?'chat-mafia-other':'chat-other');
          const isNew = i >= messages.length - 3;
          return (
            <div key={i} style={{ display:'flex', flexDirection:'row', alignItems:'flex-end', gap:6, justifyContent:isMe?'flex-end':'flex-start', animation:isNew?`${isMe?'bubbleInRight':'bubbleInLeft'} 0.25s ease both`:'none' }}>
              {!isMe && <Avatar avatarId={m.senderAvatarId} size={26} dead={m.isDead} style={{ flexShrink:0, marginBottom:2 }}/>}
              <div style={{ display:'flex', flexDirection:'column', alignItems:isMe?'flex-end':'flex-start', maxWidth:'78%' }}>
                <span style={{ fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.05em', color:isMafiaChat?'rgba(192,20,28,0.6)':'var(--text-dim)', marginBottom:3 }}>{m.senderName}{m.isDead&&' ☩'}</span>
                <div className={bubbleClass} style={{ padding:'7px 12px', borderRadius:10, fontSize:14, color:m.isDead?'var(--text-dim)':'var(--text-bright)', wordBreak:'break-word', lineHeight:1.5 }}>{m.text}</div>
              </div>
              {isMe && <Avatar avatarId={m.senderAvatarId} size={26} dead={m.isDead} style={{ flexShrink:0, marginBottom:2 }}/>}
            </div>
          );
        })}
      </div>

      {/* Blackmailed notice */}
      {isBlackmailed && (
        <div style={{ padding:'6px 12px', background:'rgba(192,20,28,0.1)', borderTop:'1px solid rgba(192,20,28,0.2)', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <div style={{ animation:'aliveDot 1.5s ease-in-out infinite' }}><Skull size={11} color="var(--blood)"/></div>
          <span style={{ fontFamily:'DM Mono', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--blood)' }}>Blackmailed — you cannot speak today</span>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding:'10px 12px', borderTop:`1px solid ${isMafiaChat?'rgba(192,20,28,0.2)':'var(--noir-border)'}`, display:'flex', gap:8, flexShrink:0 }}>
        <input type="text" value={msg} onChange={e=>setMsg(e.target.value)}
          placeholder={isBlackmailed?'You have been silenced...':!canChat?(isMafiaChat?'Mafia only...':'Silence until dawn...'):(isMafiaChat?'Message your family...':'Speak to the town...')}
          disabled={!canChat} className="noir-input"
          style={{ flex:1, padding:'8px 12px', borderRadius:8, fontSize:14, ...(isMafiaChat&&canChat?{borderColor:'rgba(192,20,28,0.3)'}:{}) }}
        />
        <button type="submit" disabled={!msg.trim()||!canChat} style={{ padding:'8px 14px', borderRadius:8, background:msg.trim()&&canChat?'var(--blood)':'rgba(255,255,255,0.04)', border:`1px solid ${msg.trim()&&canChat?'transparent':'var(--noir-border)'}`, color:msg.trim()&&canChat?'white':'var(--text-dim)', cursor:msg.trim()&&canChat?'pointer':'not-allowed', transition:'all 0.15s', fontSize:13, transform:msg.trim()&&canChat?'scale(1)':'scale(0.96)' }}
          onMouseEnter={e=>{if(msg.trim()&&canChat)e.currentTarget.style.transform='scale(1.08)';}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}>↑</button>
      </form>
    </div>
  );
}
