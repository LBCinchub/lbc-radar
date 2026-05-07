import { useState, useEffect, useCallback, useRef } from "react";

const API = 'https://lumina-7c020410.base44.app/functions/lbcIntelligence';
const H = { 'Content-Type': 'application/json' };

const COLORS = {
  g: '#00FFA3', g2: '#00cc7a', purple: '#A78BFA', blue: '#60A5FA',
  gold: '#FBBF24', red: '#F87171', orange: '#FB923C',
  bg: '#060609', panel: '#0D0D14', card: '#13131C', card2: '#191924',
  line: 'rgba(255,255,255,0.06)', glow: 'rgba(0,255,163,0.08)',
  text: '#E2E8F0', sub: '#64748B', sub2: '#94A3B8'
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

  .bi-shell * { box-sizing: border-box; margin: 0; padding: 0; }
  .bi-shell { display: flex; height: 100vh; background: #060609; color: #E2E8F0; font-family: 'Space Grotesk', sans-serif; position: relative; overflow: hidden; }
  .bi-shell::before { content:''; position:fixed; top:-200px; left:50%; transform:translateX(-50%); width:600px; height:400px; background:radial-gradient(ellipse,rgba(0,255,163,0.04) 0%,transparent 70%); pointer-events:none; z-index:0; }

  /* RAIL */
  .bi-rail { width:64px; background:#0D0D14; border-right:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; align-items:center; padding:16px 0; gap:4px; flex-shrink:0; z-index:2; }
  .bi-rail-logo { width:36px; height:36px; background:#00FFA3; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#060609; margin-bottom:16px; cursor:pointer; }
  .bi-rail-sep { width:32px; height:1px; background:rgba(255,255,255,0.06); margin:8px 0; }
  .bi-rail-btn { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer; border:1px solid transparent; background:none; position:relative; transition:all .2s; }
  .bi-rail-btn:hover { background:#13131C; border-color:rgba(255,255,255,0.06); }
  .bi-rail-btn.on { background:rgba(0,255,163,0.08); border-color:rgba(0,255,163,0.2); }
  .bi-rail-tip { position:absolute; left:calc(100% + 10px); background:#1E1E2E; border:1px solid rgba(255,255,255,0.06); border-radius:7px; padding:5px 10px; font-size:11px; white-space:nowrap; color:#E2E8F0; pointer-events:none; opacity:0; transition:opacity .15s; z-index:99; }
  .bi-rail-btn:hover .bi-rail-tip { opacity:1; }

  /* SIDEBAR */
  .bi-sidebar { width:260px; background:#0D0D14; border-right:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; transition:width .25s; z-index:1; }
  .bi-sidebar.collapsed { width:0; }
  .bi-sb-head { padding:20px 18px 14px; border-bottom:1px solid rgba(255,255,255,0.06); }
  .bi-sb-title { font-size:13px; font-weight:700; margin-bottom:2px; }
  .bi-sb-sub { font-size:11px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-sb-section { font-size:9px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.14em; padding:14px 18px 6px; font-family:'Space Mono',monospace; }
  .bi-sb-link { display:flex; align-items:center; gap:10px; padding:8px 16px; cursor:pointer; font-size:13px; color:#94A3B8; margin:1px 8px; border-radius:9px; border:1px solid transparent; white-space:nowrap; transition:all .15s; }
  .bi-sb-link:hover { background:#13131C; color:#E2E8F0; }
  .bi-sb-link.on { background:rgba(0,255,163,0.08); color:#00FFA3; border-color:rgba(0,255,163,0.15); }
  .bi-sl-icon { font-size:15px; width:20px; text-align:center; flex-shrink:0; }
  .bi-sl-txt { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; }
  .bi-sl-badge { font-size:9px; font-family:'Space Mono',monospace; background:#191924; border-radius:4px; padding:2px 6px; color:#64748B; flex-shrink:0; }
  .bi-sb-link.on .bi-sl-badge { color:rgba(0,255,163,.5); background:rgba(0,255,163,.06); }
  .bi-sb-divider { height:1px; background:rgba(255,255,255,0.06); margin:8px 18px; }
  .bi-hist { flex:1; overflow-y:auto; padding-bottom:16px; }
  .bi-sh-item { padding:8px 16px; margin:1px 8px; border-radius:8px; cursor:pointer; transition:all .15s; }
  .bi-sh-item:hover { background:#13131C; }
  .bi-shi-q { font-size:12px; color:#94A3B8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:2px; }
  .bi-shi-m { font-size:10px; color:#64748B; font-family:'Space Mono',monospace; }

  /* MAIN */
  .bi-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; z-index:1; }

  /* TOPBAR */
  .bi-topbar { height:56px; display:flex; align-items:center; padding:0 20px; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(6,6,9,0.95); backdrop-filter:blur(12px); flex-shrink:0; gap:12px; }
  .bi-tb-toggle { width:32px; height:32px; border-radius:8px; background:#13131C; border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; transition:all .2s; flex-shrink:0; }
  .bi-tb-toggle:hover { border-color:rgba(0,255,163,.2); }
  .bi-tb-path { flex:1; display:flex; align-items:center; gap:6px; font-size:12px; color:#64748B; font-family:'Space Mono',monospace; overflow:hidden; }
  .bi-tb-path span { white-space:nowrap; }
  .bi-tb-path .sep { opacity:.4; }
  .bi-tb-path .cur { color:#00FFA3; }
  .bi-tb-pills { display:flex; gap:6px; flex-shrink:0; }
  .bi-tb-pill { display:flex; align-items:center; gap:5px; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:5px 11px; font-size:11px; font-family:'Space Mono',monospace; }
  .bi-tb-pill .pv { color:#00FFA3; font-weight:700; }
  .bi-tb-pill .pl { color:#64748B; }
  .bi-live-pill { background:rgba(0,255,163,.06); border-color:rgba(0,255,163,.18); color:#00FFA3; }
  .bi-live-dot { width:6px; height:6px; background:#00FFA3; border-radius:50%; animation:bi-pulse 1.8s infinite; }
  @keyframes bi-pulse { 0%,100%{opacity:1;} 50%{opacity:.15;} }

  /* CMD BAR */
  .bi-cmdbar { padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.06); background:#0D0D14; flex-shrink:0; }
  .bi-cmd-row { display:flex; gap:10px; margin-bottom:10px; }
  .bi-cmd-input { flex:1; display:flex; align-items:center; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:0 16px; gap:10px; transition:all .2s; }
  .bi-cmd-input:focus-within { border-color:rgba(0,255,163,.3); box-shadow:0 0 0 3px rgba(0,255,163,.05); }
  .bi-cmd-prompt { font-family:'Space Mono',monospace; font-size:12px; color:#00FFA3; opacity:.6; flex-shrink:0; }
  .bi-cmd-input input { flex:1; background:none; border:none; outline:none; color:#E2E8F0; font-size:14px; font-family:'Space Grotesk',sans-serif; padding:13px 0; }
  .bi-cmd-input input::placeholder { color:#64748B; }
  .bi-cmd-x { background:none; border:none; color:#64748B; cursor:pointer; font-size:15px; padding:4px; display:none; transition:color .2s; }
  .bi-cmd-x:hover { color:#E2E8F0; }
  .bi-cmd-x.show { display:block; }
  .bi-cmd-modes { display:flex; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:3px; gap:2px; flex-shrink:0; }
  .bi-cmd-mode { padding:7px 14px; border-radius:9px; font-size:12px; font-weight:600; cursor:pointer; border:none; background:none; color:#64748B; font-family:'Space Grotesk',sans-serif; transition:all .15s; white-space:nowrap; }
  .bi-cmd-mode.on { background:#00FFA3; color:#060609; }
  .bi-cmd-run { background:#00FFA3; color:#060609; border:none; border-radius:12px; padding:0 22px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Space Mono',monospace; white-space:nowrap; transition:all .2s; flex-shrink:0; height:46px; }
  .bi-cmd-run:hover { opacity:.9; transform:translateY(-1px); }
  .bi-cmd-run:disabled { opacity:.25; cursor:not-allowed; transform:none; }
  .bi-filters { display:flex; gap:6px; flex-wrap:wrap; }
  .bi-filter-tag { padding:5px 12px; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:8px; font-size:11px; cursor:pointer; color:#94A3B8; transition:all .15s; font-family:'Space Mono',monospace; }
  .bi-filter-tag.on { border-color:rgba(0,255,163,.3); color:#00FFA3; background:rgba(0,255,163,.06); }

  /* CONTENT */
  .bi-content { flex:1; overflow-y:auto; padding:24px; }

  /* EMPTY STATE */
  .bi-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:20px; padding:40px; }
  .bi-empty-icon { font-size:40px; opacity:.3; }
  .bi-empty-title { font-size:15px; font-weight:600; color:#64748B; }
  .bi-empty-chips { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-top:8px; }
  .bi-empty-chip { padding:8px 16px; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:10px; font-size:12px; cursor:pointer; color:#94A3B8; transition:all .15s; }
  .bi-empty-chip:hover { border-color:rgba(0,255,163,.2); color:#00FFA3; }

  /* LOADER */
  .bi-loader { display:none; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:16px; }
  .bi-loader.on { display:flex; }
  .bi-l-title { font-size:14px; font-weight:600; font-family:'Space Mono',monospace; color:#00FFA3; }
  .bi-l-sub { font-size:11px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-l-bar { width:280px; height:3px; background:#13131C; border-radius:2px; overflow:hidden; }
  .bi-l-fill { height:100%; background:linear-gradient(90deg,#00FFA3,#A78BFA); border-radius:2px; transition:width .4s ease; }
  .bi-lsteps { display:flex; flex-direction:column; gap:6px; margin-top:4px; }
  .bi-lstep { display:flex; align-items:center; gap:8px; font-size:11px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-lstep.now { color:#94A3B8; }
  .bi-lstep-dot { width:6px; height:6px; border-radius:50%; background:#64748B; flex-shrink:0; }
  .bi-lstep.now .bi-lstep-dot { background:#00FFA3; animation:bi-pulse 1s infinite; }

  /* RESULTS */
  .bi-r-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; gap:12px; flex-wrap:wrap; }
  .bi-rh-query { font-size:16px; font-weight:600; }
  .bi-rh-query em { color:#00FFA3; font-style:normal; }
  .bi-rh-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .bi-rh-tag { padding:4px 10px; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:7px; font-size:11px; font-family:'Space Mono',monospace; color:#94A3B8; }
  .bi-rh-acts { display:flex; gap:6px; }
  .bi-rh-act { padding:4px 10px; background:rgba(0,255,163,.06); border:1px solid rgba(0,255,163,.15); border-radius:7px; font-size:11px; font-family:'Space Mono',monospace; color:#00FFA3; cursor:pointer; }

  /* STAT ROW */
  .bi-stat-row { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:16px; }
  .bi-stat { background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px; text-align:center; }
  .bi-s-num { font-size:22px; font-weight:700; font-family:'Space Mono',monospace; }
  .bi-s-label { font-size:10px; color:#64748B; margin-top:3px; text-transform:uppercase; letter-spacing:.08em; }

  /* ANGLE */
  .bi-angle { display:flex; align-items:flex-start; gap:12px; background:rgba(0,255,163,.04); border:1px solid rgba(0,255,163,.12); border-radius:12px; padding:14px 16px; margin-bottom:14px; }
  .bi-angle-icon { font-size:18px; flex-shrink:0; }
  .bi-ab-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#00FFA3; margin-bottom:4px; font-family:'Space Mono',monospace; }
  .bi-ab-text { font-size:13px; color:#E2E8F0; line-height:1.5; }

  /* WHITESPACE */
  .bi-ws-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
  .bi-ws-tag { padding:5px 12px; background:rgba(251,191,36,.06); border:1px solid rgba(251,191,36,.2); border-radius:8px; font-size:11px; color:#FBBF24; font-family:'Space Mono',monospace; }

  /* DNA */
  .bi-dna { background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px; margin-bottom:16px; }
  .bi-dna-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .bi-dna-title { font-size:13px; font-weight:600; }
  .bi-dna-ct { font-size:10px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-dna-rows { display:flex; flex-direction:column; gap:7px; }
  .bi-dna-row { display:flex; align-items:center; gap:10px; }
  .bi-dr-name { font-size:11px; color:#94A3B8; width:100px; flex-shrink:0; font-family:'Space Mono',monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .bi-dr-bar { flex:1; height:4px; background:#191924; border-radius:2px; overflow:hidden; }
  .bi-dr-fill { height:100%; background:linear-gradient(90deg,#00FFA3,#A78BFA); border-radius:2px; }
  .bi-dr-n { font-size:11px; color:#64748B; font-family:'Space Mono',monospace; width:24px; text-align:right; flex-shrink:0; }

  /* TABS */
  .bi-tabs { display:flex; gap:4px; margin-bottom:16px; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:4px; width:fit-content; }
  .bi-tab { padding:7px 18px; border-radius:9px; font-size:12px; font-weight:600; cursor:pointer; color:#64748B; transition:all .15s; display:flex; align-items:center; gap:6px; }
  .bi-tab.on { background:#191924; color:#E2E8F0; }
  .bi-tab-n { font-size:10px; background:rgba(255,255,255,.06); border-radius:5px; padding:1px 6px; font-family:'Space Mono',monospace; }

  /* PROJECT CARD */
  .bi-pcard { background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:18px; margin-bottom:12px; cursor:pointer; transition:all .2s; }
  .bi-pcard:hover { border-color:rgba(0,255,163,.15); background:#191924; transform:translateY(-1px); }
  .bi-pc-top { display:flex; align-items:flex-start; gap:12px; margin-bottom:10px; }
  .bi-pc-avatar { width:40px; height:40px; background:#191924; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .bi-pc-info { flex:1; min-width:0; }
  .bi-pc-name { font-size:15px; font-weight:600; margin-bottom:6px; }
  .bi-pc-chips { display:flex; gap:5px; flex-wrap:wrap; }
  .bi-chip { padding:3px 8px; border-radius:5px; font-size:10px; font-family:'Space Mono',monospace; font-weight:600; }
  .bi-chip-hack { background:rgba(96,165,250,.1); color:#60A5FA; }
  .bi-chip-score { background:rgba(0,255,163,.1); color:#00FFA3; }
  .bi-chip-win { background:rgba(251,191,36,.1); color:#FBBF24; }
  .bi-chip-acc { background:rgba(167,139,250,.1); color:#A78BFA; }
  .bi-chip-crowd { background:rgba(255,255,255,.05); color:#94A3B8; }
  .bi-pc-liner { font-size:13px; color:#94A3B8; line-height:1.5; margin-bottom:8px; }
  .bi-pc-quote { font-size:12px; color:#64748B; font-style:italic; border-left:2px solid rgba(0,255,163,.3); padding-left:10px; margin-bottom:10px; font-family:'Space Mono',monospace; line-height:1.5; }
  .bi-pc-tags { display:flex; gap:5px; flex-wrap:wrap; }
  .bi-pc-tag { padding:3px 8px; background:#191924; border-radius:5px; font-size:10px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-pc-links { display:flex; gap:8px; margin-top:10px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px; }
  .bi-pc-link { font-size:11px; color:#94A3B8; text-decoration:none; padding:3px 8px; background:#191924; border-radius:5px; transition:color .15s; }
  .bi-pc-link:hover { color:#00FFA3; }

  /* ARCHIVE CARD */
  .bi-acard { background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:16px; margin-bottom:10px; }
  .bi-ac-title { font-size:14px; font-weight:600; margin-bottom:6px; }
  .bi-ac-excerpt { font-size:12px; color:#64748B; line-height:1.6; margin-bottom:10px; font-family:'Space Mono',monospace; }
  .bi-ac-chips { display:flex; gap:6px; flex-wrap:wrap; }
  .bi-ac-chip { padding:3px 8px; background:#191924; border-radius:5px; font-size:10px; color:#94A3B8; font-family:'Space Mono',monospace; }
  .bi-ac-score { color:#00FFA3; }

  /* PULSE GRID */
  .bi-pulse-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; margin-top:16px; }
  .bi-pv { background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:16px; }
  .bi-pv-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#64748B; margin-bottom:8px; font-family:'Space Mono',monospace; }
  .bi-pv-name { font-size:14px; font-weight:600; margin-bottom:4px; }
  .bi-pv-liner { font-size:11px; color:#64748B; margin-bottom:8px; line-height:1.4; }
  .bi-pv-score { font-size:11px; font-family:'Space Mono',monospace; color:#00FFA3; margin-bottom:8px; }
  .bi-pv-pills { display:flex; gap:5px; flex-wrap:wrap; }
  .bi-pv-pill { padding:2px 7px; background:#191924; border-radius:5px; font-size:10px; color:#94A3B8; font-family:'Space Mono',monospace; }
  .bi-pv-empty { font-size:22px; margin:8px 0; opacity:.2; }
  .bi-pv-opp { font-size:11px; color:#64748B; font-family:'Space Mono',monospace; }

  /* VALIDATE */
  .bi-vbox { max-width:600px; margin:0 auto; }
  .bi-vbox-title { font-size:18px; font-weight:700; margin-bottom:8px; }
  .bi-vbox-sub { font-size:13px; color:#64748B; line-height:1.6; margin-bottom:20px; }
  .bi-v-area { width:100%; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px; color:#E2E8F0; font-size:13px; font-family:'Space Grotesk',sans-serif; line-height:1.6; resize:vertical; min-height:120px; outline:none; transition:border-color .2s; }
  .bi-v-area:focus { border-color:rgba(0,255,163,.3); }
  .bi-v-run { margin-top:12px; background:#00FFA3; color:#060609; border:none; border-radius:12px; padding:13px 28px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Space Mono',monospace; transition:all .2s; }
  .bi-v-run:hover { opacity:.9; transform:translateY(-1px); }
  .bi-verdict { border-radius:12px; padding:16px 20px; margin:16px 0; }
  .bi-verdict.green_light { background:rgba(0,255,163,.06); border:1px solid rgba(0,255,163,.2); }
  .bi-verdict.yellow_light { background:rgba(251,191,36,.06); border:1px solid rgba(251,191,36,.2); }
  .bi-verdict.red_light { background:rgba(248,113,113,.06); border:1px solid rgba(248,113,113,.2); }
  .bi-vd-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; font-family:'Space Mono',monospace; margin-bottom:6px; }
  .bi-verdict.green_light .bi-vd-label { color:#00FFA3; }
  .bi-verdict.yellow_light .bi-vd-label { color:#FBBF24; }
  .bi-verdict.red_light .bi-vd-label { color:#F87171; }
  .bi-vd-msg { font-size:13px; color:#E2E8F0; line-height:1.6; }

  .bi-err { color:#64748B; font-size:13px; font-family:'Space Mono',monospace; padding:20px; text-align:center; }

  /* SCROLLBAR */
  .bi-content::-webkit-scrollbar { width:4px; }
  .bi-content::-webkit-scrollbar-track { background:transparent; }
  .bi-content::-webkit-scrollbar-thumb { background:#191924; border-radius:2px; }
`;

const HACKATHONS = ['Renaissance', 'Radar', 'Breakpoint', 'Superteam', 'Colosseum', 'Grizzlython'];
const QUICK = [
  { q: 'social community SocialFi token rewards', label: 'Social + Token Rewards' },
  { q: 'AI agent autonomous payments Solana', label: 'AI Agents' },
  { q: 'digital city infrastructure blockchain', label: 'Digital City' },
  { q: 'accommodation tourism Web3 mobile', label: 'Travel' },
  { q: 'transport logistics token payment', label: 'Ride / Mobility' },
  { q: 'concert festival token creator fan', label: 'Live Events' },
];

function ago(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

function getEmoji(p) {
  const t = `${p.oneLiner || ''} ${(p.tags?.techStack || []).join(' ')}`.toLowerCase();
  if (t.includes('ai') || t.includes('agent')) return '🤖';
  if (t.includes('travel') || t.includes('booking')) return '✈️';
  if (t.includes('social') || t.includes('community')) return '👥';
  if (t.includes('depin') || t.includes('physical')) return '📡';
  if (t.includes('defi') || t.includes('swap')) return '💱';
  if (t.includes('nft') || t.includes('ticket')) return '🎟️';
  if (t.includes('payment') || t.includes('stable')) return '💸';
  if (t.includes('market')) return '🛒';
  if (t.includes('game')) return '🎮';
  return '⚡';
}

export default function BuilderIntelligence() {
  const [view, setView] = useState('research');
  const [mode, setMode] = useState('standard');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadState, setLoadState] = useState({ title: '', sub: '', progress: 30 });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [hist, setHist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lbc_h4') || '[]'); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState('proj');
  const [ideaText, setIdeaText] = useState('');
  const [validateResult, setValidateResult] = useState(null);
  const [validating, setValidating] = useState(false);

  const callApi = async (payload) => {
    const r = await fetch(API, { method: 'POST', headers: H, body: JSON.stringify(payload) });
    return r.json();
  };

  const addHist = (q, m) => {
    const newHist = [{ q, m, t: Date.now() }, ...hist.filter(h => h.q !== q)].slice(0, 14);
    setHist(newHist);
    localStorage.setItem('lbc_h4', JSON.stringify(newHist));
  };

  const toggleFilter = (f) => {
    setFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const runSearch = async (q = query, m = mode) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setActiveTab('proj');
    addHist(q, m);
    setLoadState({ title: m === 'deep' ? 'Deep Intelligence Scan' : m === 'archive' ? 'Searching Archive' : 'Searching Projects', sub: `${m} · "${q}"`, progress: 30 });

    try {
      const hf = filters.length ? { hackathons: filters } : {};
      let j;
      if (m === 'deep') j = await callApi({ action: 'deep_dive', query: q, filters: hf });
      else if (m === 'archive') j = await callApi({ action: 'search_archives', query: q, limit: 12, maxChunksPerDoc: 2, intent: 'ideation' });
      else j = await callApi({ action: 'search_projects', query: q, limit: 12, filters: hf, diversify: true });

      if (j?.success) setResults({ data: j.data, mode: m, query: q });
      else setError(j?.error || 'API error');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runPulse = async () => {
    setView('pulse');
    setLoading(true);
    setError(null);
    setResults(null);
    setLoadState({ title: 'Scanning 8 LBC Verticals', sub: 'ecosystem_pulse · live data', progress: 30 });
    try {
      const j = await callApi({ action: 'ecosystem_pulse' });
      if (j?.success) setResults({ data: j.data, mode: 'pulse' });
      else setError(j?.error || 'API error');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runValidate = async () => {
    if (!ideaText.trim() || validating) return;
    setValidating(true);
    setValidateResult(null);
    try {
      const j = await callApi({ action: 'validate_idea', idea: ideaText });
      if (j?.success) setValidateResult(j.data);
      else setValidateResult({ error: j?.error || 'API error' });
    } catch (e) { setValidateResult({ error: e.message }); }
    finally { setValidating(false); }
  };

  const quickSearch = (q) => {
    setView('research');
    setQuery(q);
    setTimeout(() => runSearch(q, mode), 50);
  };

  // ── RENDER HELPERS ─────────────────────────────────────────────────────────

  const ProjCard = ({ p }) => {
    const score = p.lbc_score || Math.round((p.similarity || 0) * 100 * 10) / 10;
    const ev = (p.evidence || []).filter(Boolean);
    const stack = [...(p.tags?.techStack || []), ...(p.tags?.primitives || [])].slice(0, 5);
    const link = p.links?.colosseum, gh = p.links?.github, demo = p.links?.demo || p.links?.presentation;
    return (
      <div className="bi-pcard" onClick={() => link && window.open(link, '_blank')}>
        <div className="bi-pc-top">
          <div className="bi-pc-avatar">{getEmoji(p)}</div>
          <div className="bi-pc-info">
            <div className="bi-pc-name">{p.name}</div>
            <div className="bi-pc-chips">
              {p.hackathon?.name && <span className="bi-chip bi-chip-hack">{p.hackathon.name}</span>}
              {score > 0 && <span className="bi-chip bi-chip-score">LBC {score}</span>}
              {(p.prize || p.lbc_signals?.is_winner) && <span className="bi-chip bi-chip-win">🏆 Winner</span>}
              {(p.accelerator || p.lbc_signals?.is_accelerated) && <span className="bi-chip bi-chip-acc">⚡ Accel</span>}
              {p.crowdedness && <span className="bi-chip bi-chip-crowd">{p.crowdedness}</span>}
            </div>
          </div>
        </div>
        {p.oneLiner && <div className="bi-pc-liner">{p.oneLiner}</div>}
        {ev[0] && <div className="bi-pc-quote">"{ev[0]}"</div>}
        {stack.length > 0 && (
          <div className="bi-pc-tags">{stack.map((t, i) => <span key={i} className="bi-pc-tag">{t}</span>)}</div>
        )}
        {(link || gh || demo) && (
          <div className="bi-pc-links">
            {link && <a className="bi-pc-link" href={link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>🏛 Colosseum</a>}
            {gh && <a className="bi-pc-link" href={gh} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>⌥ GitHub</a>}
            {demo && <a className="bi-pc-link" href={demo} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>▶ Demo</a>}
          </div>
        )}
      </div>
    );
  };

  const ArchCard = ({ a }) => (
    <div className="bi-acard">
      <div className="bi-ac-title">{a.title || a.doc_id}</div>
      <div className="bi-ac-excerpt">{(a.excerpt || a.chunk || '').slice(0, 200)}…</div>
      <div className="bi-ac-chips">
        {a.similarity && <span className="bi-ac-chip bi-ac-score">score {Math.round(a.similarity * 1000) / 10}</span>}
        {a.hackathon && <span className="bi-ac-chip">{a.hackathon}</span>}
        {(a.tags || []).slice(0, 3).map((t, i) => <span key={i} className="bi-ac-chip">{t}</span>)}
      </div>
    </div>
  );

  const AngleBox = ({ text }) => (
    <div className="bi-angle">
      <div className="bi-angle-icon">⚡</div>
      <div>
        <div className="bi-ab-label">LBC Angle</div>
        <div className="bi-ab-text" dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    </div>
  );

  const DnaBox = ({ dna }) => {
    const max = Math.max(...Object.values(dna).map(Number), 1);
    return (
      <div className="bi-dna">
        <div className="bi-dna-head">
          <div className="bi-dna-title">🔬 Tech DNA</div>
          <span className="bi-dna-ct">{Object.keys(dna).length} signals</span>
        </div>
        <div className="bi-dna-rows">
          {Object.entries(dna).slice(0, 10).map(([k, v]) => (
            <div key={k} className="bi-dna-row">
              <div className="bi-dr-name">{k}</div>
              <div className="bi-dr-bar"><div className="bi-dr-fill" style={{ width: `${(Number(v) / max) * 100}%` }} /></div>
              <div className="bi-dr-n">{v}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── CONTENT RENDERER ───────────────────────────────────────────────────────

  const renderContent = () => {
    if (loading) return (
      <div className="bi-loader on">
        <div className="bi-l-title">{loadState.title}</div>
        <div className="bi-l-sub">{loadState.sub}</div>
        <div className="bi-l-bar"><div className="bi-l-fill" style={{ width: `${loadState.progress}%` }} /></div>
        <div className="bi-lsteps">
          <div className="bi-lstep now"><div className="bi-lstep-dot" />Querying LBC Intelligence backend…</div>
        </div>
      </div>
    );

    if (view === 'validate') return (
      <div className="bi-vbox">
        <div className="bi-vbox-title">Idea Validator</div>
        <div className="bi-vbox-sub">Describe an LBC feature idea. I'll check if it's being built on Solana and score your opportunity window.</div>
        <textarea
          className="bi-v-area"
          value={ideaText}
          onChange={e => setIdeaText(e.target.value)}
          placeholder="e.g. A community marketplace where users earn $LBC rewards for verified travel reviews, with AI-powered local discovery and instant crypto settlement…"
        />
        <button className="bi-v-run" onClick={runValidate} disabled={validating}>
          {validating ? '🔍 Scanning 5,400 projects…' : '🔍 Validate This Idea'}
        </button>
        {validateResult && !validateResult.error && (
          <div style={{ marginTop: 20 }}>
            <div className={`bi-verdict ${validateResult.verdict}`}>
              <div className="bi-vd-label">{(validateResult.verdict || '').replace(/_/g, ' ')}</div>
              <div className="bi-vd-msg">{validateResult.verdict_message}</div>
            </div>
            {validateResult.lbc_opportunity && <AngleBox text={validateResult.lbc_opportunity} />}
            {validateResult.stats && (
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16, fontFamily: "'Space Mono',monospace" }}>
                {validateResult.stats.projects_found} similar projects · avg {validateResult.stats.avg_similarity}% similarity · top: <strong style={{ color: '#E2E8F0' }}>{validateResult.stats.top_match || 'none'}</strong>
              </div>
            )}
            {Object.keys(validateResult.tech_dna || {}).length > 0 && <DnaBox dna={validateResult.tech_dna} />}
            {(validateResult.similar_projects || []).slice(0, 3).map((p, i) => <ProjCard key={i} p={p} />)}
          </div>
        )}
        {validateResult?.error && <div className="bi-err">Error: {validateResult.error}</div>}
      </div>
    );

    if (!results && !error) return (
      <div className="bi-empty">
        <div className="bi-empty-icon">🔭</div>
        <div className="bi-empty-title">Search the Solana ecosystem for LBC intelligence</div>
        <div className="bi-empty-chips">
          {QUICK.map((q, i) => (
            <div key={i} className="bi-empty-chip" onClick={() => quickSearch(q.q)}>{q.label}</div>
          ))}
        </div>
      </div>
    );

    if (error) return <div className="bi-err">Error: {error}</div>;

    if (results?.mode === 'pulse') {
      const d = results.data;
      const vs = d.verticals || [];
      const sum = d.ecosystem_summary || {};
      return (
        <div>
          <div className="bi-r-head">
            <div className="bi-rh-query">Ecosystem <em>Pulse</em></div>
            <div className="bi-rh-meta">
              <div className="bi-rh-tag">{sum.lbc_coverage || '8 verticals'}</div>
              <div className="bi-rh-tag">{d.pulse_date || 'live'}</div>
              <div className="bi-rh-acts">
                <div className="bi-rh-act">📊 {sum.total_projects_scanned || 0} scanned</div>
                <div className="bi-rh-act">🏆 {sum.total_winners_found || 0} winners</div>
              </div>
            </div>
          </div>
          {sum.hottest_vertical && <AngleBox text={`Hottest vertical: <strong>${sum.hottest_vertical}</strong> — most hackathon winners. Health: <strong>${sum.health_score}/100</strong>`} />}
          <div className="bi-pulse-grid">
            {vs.map((v, i) => (
              <div key={i} className="bi-pv">
                <div className="bi-pv-label">{v.vertical}</div>
                {v.top_project ? (
                  <>
                    <div className="bi-pv-name">{v.top_project.name}</div>
                    <div className="bi-pv-liner">{v.top_project.oneLiner || ''}</div>
                    <div className="bi-pv-score">LBC {v.top_project.lbc_score}</div>
                    <div className="bi-pv-pills">
                      {v.top_project.hackathon && <span className="bi-pv-pill">{v.top_project.hackathon}</span>}
                      {v.winners && <span className="bi-pv-pill">🏆 {v.winners}</span>}
                      <span className="bi-pv-pill">{v.project_count} found</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bi-pv-empty">◇</div>
                    <div className="bi-pv-opp">{v.opportunity}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Standard / Deep / Archive results
    const { data, mode: m, query: q } = results;
    const projs = m === 'deep' ? (data.projects || []) : (data.results || []);
    const archives = data.archives || [];
    const intel = data.intelligence || {};
    const dna = (m === 'deep' ? intel.tech_dna : data.tech_dna) || {};
    const ws = (m === 'deep' ? intel.whitespace_opportunities : data.whitespace_opportunities) || [];
    const angle = (m === 'deep' ? intel.lbc_angle : data.lbc_angle) || '';
    const stats = intel.stats || {};
    const winners = projs.filter(p => p.prize || p.lbc_signals?.is_winner).length;
    const accel = projs.filter(p => p.accelerator || p.lbc_signals?.is_accelerated).length;
    const avg = projs.length ? Math.round(projs.reduce((s, p) => s + (p.lbc_score || 0), 0) / projs.length * 10) / 10 : 0;
    const hacks = [...new Set(projs.map(p => p.hackathon?.name).filter(Boolean))].length;

    return (
      <div>
        <div className="bi-r-head">
          <div className="bi-rh-query">Results for <em>"{q}"</em></div>
          <div className="bi-rh-meta">
            <div className="bi-rh-tag">{projs.length} found</div>
            <div className="bi-rh-tag">{m.toUpperCase()}</div>
            <div className="bi-rh-acts">
              <div className="bi-rh-act" onClick={() => { setResults(null); setQuery(''); }}>✕ Clear</div>
            </div>
          </div>
        </div>

        {m === 'deep' && (
          <div className="bi-stat-row">
            <div className="bi-stat"><div className="bi-s-num" style={{ color: '#00FFA3' }}>{projs.length}</div><div className="bi-s-label">Projects</div></div>
            <div className="bi-stat"><div className="bi-s-num" style={{ color: '#FBBF24' }}>{winners}</div><div className="bi-s-label">Winners</div></div>
            <div className="bi-stat"><div className="bi-s-num" style={{ color: '#A78BFA' }}>{accel}</div><div className="bi-s-label">Accelerated</div></div>
            <div className="bi-stat"><div className="bi-s-num" style={{ color: '#00FFA3' }}>{avg}</div><div className="bi-s-label">Avg Score</div></div>
            <div className="bi-stat"><div className="bi-s-num" style={{ color: '#60A5FA', fontSize: 16 }}>{hacks}</div><div className="bi-s-label">Hackathons</div></div>
          </div>
        )}

        {angle && <AngleBox text={angle} />}
        {ws.length > 0 && <div className="bi-ws-row">{ws.map((w, i) => <div key={i} className="bi-ws-tag">{w}</div>)}</div>}
        {Object.keys(dna).length > 0 && <DnaBox dna={dna} />}

        {(projs.length > 0 || archives.length > 0) && (
          <div className="bi-tabs">
            <div className={`bi-tab ${activeTab === 'proj' ? 'on' : ''}`} onClick={() => setActiveTab('proj')}>
              Projects <span className="bi-tab-n">{projs.length}</span>
            </div>
            {archives.length > 0 && (
              <div className={`bi-tab ${activeTab === 'arch' ? 'on' : ''}`} onClick={() => setActiveTab('arch')}>
                Archive <span className="bi-tab-n">{archives.length}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'proj' && (projs.length > 0 ? projs.map((p, i) => <ProjCard key={i} p={p} />) : <div className="bi-err">No projects found. Try adjusting your query.</div>)}
        {activeTab === 'arch' && (archives.length > 0 ? archives.map((a, i) => <ArchCard key={i} a={a} />) : <div className="bi-err">No archive docs found.</div>)}
        {m === 'archive' && (data.results || []).map((a, i) => <ArchCard key={i} a={a} />)}
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="bi-shell">
        {/* RAIL */}
        <div className="bi-rail">
          <div className="bi-rail-logo">LBC</div>
          <div className="bi-rail-sep" />
          {[
            { icon: '🔭', tip: 'Research', v: 'research' },
            { icon: '📡', tip: 'Ecosystem Pulse', v: 'pulse', action: runPulse },
            { icon: '💡', tip: 'Idea Validator', v: 'validate' },
          ].map(item => (
            <div
              key={item.v}
              className={`bi-rail-btn ${view === item.v ? 'on' : ''}`}
              onClick={() => { if (item.action) item.action(); else setView(item.v); }}
            >
              {item.icon}
              <div className="bi-rail-tip">{item.tip}</div>
            </div>
          ))}
        </div>

        {/* SIDEBAR */}
        <div className={`bi-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className="bi-sb-head">
            <div className="bi-sb-title">Builder Intelligence</div>
            <div className="bi-sb-sub">lbchub.site · v4</div>
          </div>
          <div className="bi-sb-section">Verticals</div>
          {[
            { icon: '👥', label: 'Social + Community', badge: '4 found', q: 'social community SocialFi token Solana' },
            { icon: '🛒', label: 'Marketplace', badge: '3 found', q: 'marketplace escrow p2p Solana' },
            { icon: '✈️', label: 'Travel', badge: 'EMPTY', q: 'accommodation tourism Web3 mobile' },
            { icon: '🚗', label: 'Rides', badge: 'EMPTY', q: 'transport logistics token payment' },
            { icon: '🤖', label: 'AI Agents', badge: '4 found', q: 'AI agent autonomous payments Solana' },
            { icon: '🏙️', label: 'Digital City', badge: '4 found', q: 'digital city infrastructure blockchain' },
            { icon: '🎟️', label: 'Live Events', badge: 'NEW', q: 'concert festival token creator fan' },
            { icon: '📡', label: 'DePIN', badge: '3 found', q: 'decentralized physical infrastructure network' },
          ].map((item, i) => (
            <div key={i} className="bi-sb-link" onClick={() => quickSearch(item.q)}>
              <span className="bi-sl-icon">{item.icon}</span>
              <span className="bi-sl-txt">{item.label}</span>
              <span className="bi-sl-badge">{item.badge}</span>
            </div>
          ))}
          <div className="bi-sb-divider" />
          <div className="bi-sb-section">Recent</div>
          <div className="bi-hist">
            {hist.map((h, i) => (
              <div key={i} className="bi-sh-item" onClick={() => quickSearch(h.q)}>
                <div className="bi-shi-q">{h.q}</div>
                <div className="bi-shi-m">{h.m} · {ago(h.t)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div className="bi-main">
          {/* TOPBAR */}
          <div className="bi-topbar">
            <div className="bi-tb-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</div>
            <div className="bi-tb-path">
              <span>lbchub.site</span>
              <span className="sep">/</span>
              <span className="cur">{view === 'pulse' ? 'ecosystem_pulse' : view === 'validate' ? 'idea_validator' : 'research'}</span>
            </div>
            <div className="bi-tb-pills">
              <div className="bi-tb-pill"><span className="pl">projects</span><span className="pv">5,400+</span></div>
              <div className="bi-tb-pill"><span className="pl">archive</span><span className="pv">84k</span></div>
              <div className="bi-tb-pill bi-live-pill"><div className="bi-live-dot" /><span>LIVE</span></div>
            </div>
          </div>

          {/* CMD BAR */}
          {view === 'research' && (
            <div className="bi-cmdbar">
              <div className="bi-cmd-row">
                <div className="bi-cmd-input">
                  <span className="bi-cmd-prompt">$</span>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && runSearch()}
                    placeholder="Search 5,400+ Solana hackathon projects…"
                  />
                  {query && <button className="bi-cmd-x show" onClick={() => { setQuery(''); setResults(null); }}>✕</button>}
                </div>
                <div className="bi-cmd-modes">
                  {['standard', 'deep', 'archive'].map(m => (
                    <button key={m} className={`bi-cmd-mode ${mode === m ? 'on' : ''}`} onClick={() => setMode(m)}>
                      {m === 'standard' ? 'Standard' : m === 'deep' ? '🔬 Deep' : '📚 Archive'}
                    </button>
                  ))}
                </div>
                <button className="bi-cmd-run" onClick={() => runSearch()} disabled={loading || !query.trim()}>
                  {loading ? 'Scanning…' : 'RUN →'}
                </button>
              </div>
              <div className="bi-filters">
                {HACKATHONS.map(f => (
                  <div key={f} className={`bi-filter-tag ${filters.includes(f) ? 'on' : ''}`} onClick={() => toggleFilter(f)}>{f}</div>
                ))}
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className="bi-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
