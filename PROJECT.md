<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WardRound — Architecture Guide v2</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #f5f2ec;
    --bg2: #ede9e1;
    --surface: #ffffff;
    --border: #d8d2c6;
    --border-dark: #b8b0a0;
    --ink: #1a1814;
    --ink2: #3d3830;
    --muted: #8a8278;
    --accent: #c0392b;
    --accent2: #2c6e8a;
    --accent3: #2d7a47;
    --accent4: #8a5c2c;
    --code-bg: #1a1814;
    --code-text: #e8e2d8;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--ink);
    font-family: 'Lora', Georgia, serif;
    font-size: 15px;
    line-height: 1.75;
  }

  /* HERO */
  .hero {
    background: var(--ink);
    color: var(--bg);
    padding: 80px 64px 72px;
    position: relative;
    overflow: hidden;
  }
  .hero::after {
    content: 'WARDROUND';
    position: absolute;
    right: -20px; top: 50%;
    transform: translateY(-50%) rotate(90deg);
    font-family: 'Syne', sans-serif;
    font-size: 120px;
    font-weight: 800;
    color: rgba(255,255,255,0.03);
    letter-spacing: -4px;
    pointer-events: none;
    white-space: nowrap;
  }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: var(--accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 28px;
  }
  .hero-badge::before {
    content: '';
    display: inline-block;
    width: 6px; height: 6px;
    background: var(--accent);
    border-radius: 50%;
  }
  .hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: 72px;
    font-weight: 800;
    line-height: 0.95;
    letter-spacing: -2px;
    margin-bottom: 28px;
    max-width: 700px;
  }
  .hero h1 em {
    font-style: normal;
    color: #c8bfaf;
    font-weight: 400;
    font-family: 'Lora', serif;
    font-size: 52px;
    display: block;
    margin-top: 8px;
  }
  .hero-desc {
    color: #9a9288;
    font-size: 15px;
    max-width: 560px;
    line-height: 1.6;
    font-family: 'IBM Plex Mono', monospace;
  }
  .hero-pills {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 36px;
  }
  .hero-pill {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    padding: 6px 14px;
    border: 1px solid rgba(255,255,255,0.12);
    color: #c8bfaf;
    border-radius: 2px;
    letter-spacing: 0.06em;
  }
  .hero-pill.primary { border-color: var(--accent); color: var(--accent); }
  .hero-pill.removed {
    border-color: rgba(255,255,255,0.06);
    color: #4a4540;
    text-decoration: line-through;
  }

  /* TOC BAR */
  .toc-bar {
    background: var(--ink2);
    padding: 0 64px;
    display: flex;
    gap: 0;
    overflow-x: auto;
    border-bottom: 2px solid var(--accent);
  }
  .toc-item {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: #9a9288;
    padding: 16px 18px;
    white-space: nowrap;
    text-decoration: none;
    letter-spacing: 0.08em;
    border-right: 1px solid rgba(255,255,255,0.05);
  }
  .toc-item:hover { color: var(--bg); }
  .toc-item span { color: var(--accent); margin-right: 6px; }

  /* SECTIONS */
  .section {
    padding: 68px 64px;
    border-bottom: 1px solid var(--border);
    max-width: 1100px;
    margin: 0 auto;
  }
  .section-header {
    display: flex;
    align-items: baseline;
    gap: 20px;
    margin-bottom: 40px;
  }
  .section-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: var(--accent);
    letter-spacing: 0.1em;
    min-width: 32px;
  }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 34px;
    font-weight: 700;
    line-height: 1.1;
  }
  .section-sub {
    color: var(--muted);
    font-size: 13px;
    font-family: 'IBM Plex Mono', monospace;
    margin-top: 4px;
  }

  /* CALLOUTS */
  .callout {
    border-left: 3px solid var(--accent);
    background: rgba(192,57,43,0.05);
    padding: 18px 22px;
    margin: 24px 0;
    border-radius: 0 3px 3px 0;
    font-size: 14px;
  }
  .callout.blue { border-color: var(--accent2); background: rgba(44,110,138,0.05); }
  .callout.green { border-color: var(--accent3); background: rgba(45,122,71,0.05); }
  .callout.brown { border-color: var(--accent4); background: rgba(138,92,44,0.05); }
  .callout.dark { border-color: #555; background: rgba(0,0,0,0.04); }
  .callout strong { color: var(--accent); }
  .callout.blue strong { color: var(--accent2); }
  .callout.green strong { color: var(--accent3); }
  .callout.brown strong { color: var(--accent4); }
  .callout.dark strong { color: var(--ink); }

  /* CODE */
  pre {
    background: var(--code-bg);
    color: var(--code-text);
    border-radius: 4px;
    padding: 22px 26px;
    overflow-x: auto;
    margin: 16px 0;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12.5px;
    line-height: 1.65;
    border: 1px solid #2a2520;
  }
  .file-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .file-label::before { content: '▸'; color: var(--accent); }
  .kw { color: #e06c75; }
  .fn { color: #61afef; }
  .str { color: #98c379; }
  .cm { color: #5c6370; font-style: italic; }
  .va { color: #e5c07b; }
  .nu { color: #d19a66; }

  /* ARCH DIAGRAM */
  .arch {
    background: var(--code-bg);
    border-radius: 6px;
    padding: 36px;
    margin: 28px 0;
    border: 1px solid #2a2520;
    overflow-x: auto;
  }
  .arch-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: #5c6370;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 22px;
  }
  .arch-layer {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin: 10px 0;
    flex-wrap: wrap;
  }
  .arch-box {
    padding: 10px 16px;
    border-radius: 4px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    min-width: 130px;
    line-height: 1.4;
  }
  .arch-box .sub { font-weight: 400; font-size: 10px; opacity: 0.7; display: block; margin-top: 2px; }
  .arch-box.user { background: rgba(192,57,43,0.2); border: 1px solid rgba(192,57,43,0.5); color: #e06c75; }
  .arch-box.frontend { background: rgba(97,175,239,0.15); border: 1px solid rgba(97,175,239,0.4); color: #61afef; }
  .arch-box.backend { background: rgba(152,195,121,0.15); border: 1px solid rgba(152,195,121,0.4); color: #98c379; }
  .arch-box.backboard { background: rgba(229,192,123,0.15); border: 1px solid rgba(229,192,123,0.5); color: #e5c07b; }
  .arch-box.redis { background: rgba(224,108,117,0.15); border: 1px solid rgba(224,108,117,0.4); color: #e06c75; }
  .arch-box.vultr { background: rgba(45,122,71,0.2); border: 1px solid rgba(45,122,71,0.5); color: #98c379; }
  .arch-box.auth0 { background: rgba(198,120,221,0.15); border: 1px solid rgba(198,120,221,0.4); color: #c678dd; }
  .arch-box.storage { background: rgba(86,182,194,0.15); border: 1px solid rgba(86,182,194,0.4); color: #56b6c2; }
  .arch-connector {
    text-align: center;
    color: #3d3830;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    margin: 4px 0;
  }
  .arch-section-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: #5c6370;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-align: left;
    margin: 18px 0 8px;
    padding-left: 4px;
    border-left: 2px solid #3d3830;
  }

  /* AGENT CARDS */
  .agent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 28px 0; }
  .agent-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 26px;
    position: relative;
  }
  .agent-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 3px; border-radius: 6px 6px 0 0;
  }
  .agent-card.a1::before { background: var(--accent); }
  .agent-card.a2::before { background: var(--accent2); }
  .agent-card.a3::before { background: var(--accent3); }
  .agent-num { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--muted); margin-bottom: 6px; }
  .agent-name { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .agent-card.a1 .agent-name { color: var(--accent); }
  .agent-card.a2 .agent-name { color: var(--accent2); }
  .agent-card.a3 .agent-name { color: var(--accent3); }
  .agent-model {
    font-family: 'IBM Plex Mono', monospace; font-size: 11px;
    background: var(--bg2); border: 1px solid var(--border);
    padding: 3px 10px; border-radius: 2px; color: var(--muted);
    display: inline-block; margin-bottom: 14px;
  }
  .agent-body { font-size: 13px; line-height: 1.65; color: var(--ink2); }
  .agent-body ul { list-style: none; padding: 0; }
  .agent-body li { padding: 3px 0 3px 14px; position: relative; }
  .agent-body li::before { content: '→'; position: absolute; left: 0; color: var(--muted); font-size: 11px; top: 5px; }

  /* FLOW */
  .flow { display: flex; align-items: flex-start; gap: 0; margin: 28px 0; overflow-x: auto; padding-bottom: 8px; }
  .flow-step {
    flex-shrink: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-top: 3px solid var(--accent);
    padding: 16px 14px;
    width: 148px; text-align: center;
  }
  .flow-step.b { border-top-color: var(--accent2); }
  .flow-step.c { border-top-color: var(--accent3); }
  .flow-step.d { border-top-color: var(--accent4); }
  .flow-step .icon { font-size: 24px; margin-bottom: 6px; }
  .flow-step .ftitle { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; margin-bottom: 4px; }
  .flow-step .flabel { font-size: 11px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; line-height: 1.4; }
  .flow-arrow { font-size: 20px; color: var(--muted); padding: 0 2px; margin-top: 36px; flex-shrink: 0; }

  /* TIMELINE */
  .timeline { position: relative; padding-left: 36px; }
  .timeline::before {
    content: ''; position: absolute;
    left: 11px; top: 10px; bottom: 10px;
    width: 1px; background: var(--border);
  }
  .tl-item { position: relative; margin-bottom: 34px; }
  .tl-dot {
    position: absolute; left: -34px; top: 7px;
    width: 12px; height: 12px; border-radius: 50%;
    background: var(--accent); border: 2px solid var(--bg);
    box-shadow: 0 0 0 2px var(--accent);
  }
  .tl-dot.b { background: var(--accent2); box-shadow: 0 0 0 2px var(--accent2); }
  .tl-dot.c { background: var(--accent3); box-shadow: 0 0 0 2px var(--accent3); }
  .tl-dot.d { background: var(--accent4); box-shadow: 0 0 0 2px var(--accent4); }
  .tl-time { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--accent); margin-bottom: 4px; }
  .tl-time.b { color: var(--accent2); }
  .tl-time.c { color: var(--accent3); }
  .tl-time.d { color: var(--accent4); }
  .tl-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; margin-bottom: 10px; }
  .tl-body { font-size: 13.5px; color: var(--ink2); }
  .tl-body ul { list-style: none; padding: 0; }
  .tl-body li { padding: 4px 0 4px 16px; position: relative; }
  .tl-body li::before { content: '–'; position: absolute; left: 0; color: var(--muted); }
  .tl-body li strong { color: var(--ink); }

  /* TECH TABLE */
  .tech-table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13.5px; }
  .tech-table th {
    text-align: left; font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.1em; color: var(--muted);
    padding: 10px 14px; border-bottom: 2px solid var(--border);
    text-transform: uppercase;
  }
  .tech-table td { padding: 12px 14px; border-bottom: 1px solid var(--bg2); vertical-align: top; }
  .tech-table td:first-child { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--accent2); white-space: nowrap; }
  .tech-table td:nth-child(2) { font-weight: 500; }
  .tech-table td:nth-child(3) { color: var(--muted); font-size: 13px; }
  .tech-table tr.removed td { opacity: 0.35; text-decoration: line-through; }

  /* ENV GRID */
  .env-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; }
  .env-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 24px; }
  .env-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
  .env-tag { font-family: 'IBM Plex Mono', monospace; font-size: 10px; padding: 3px 8px; border-radius: 2px; }
  .env-tag.local { background: rgba(44,110,138,0.1); color: var(--accent2); border: 1px solid rgba(44,110,138,0.3); }
  .env-tag.prod { background: rgba(45,122,71,0.1); color: var(--accent3); border: 1px solid rgba(45,122,71,0.3); }
  .env-row { display: flex; gap: 10px; margin: 7px 0; font-size: 13px; }
  .env-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent2); margin-top: 8px; flex-shrink: 0; }
  .env-dot.g { background: var(--accent3); }

  /* ROLE GRID */
  .role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
  .role-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 20px; text-align: center; }
  .role-icon { font-size: 30px; margin-bottom: 10px; }
  .role-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 10px; }
  .role-perms { font-size: 12px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; line-height: 2; }
  .perm-yes { color: var(--accent3); }
  .perm-no { color: var(--accent); }

  /* MEMORY CARD */
  .memory-card {
    background: var(--code-bg); border: 1px solid #2a2520;
    border-radius: 6px; padding: 26px; margin: 24px 0;
    font-family: 'IBM Plex Mono', monospace; font-size: 12px;
    color: var(--code-text); line-height: 1.7;
  }
  .memory-card .mc-title { color: #e5c07b; font-size: 13px; font-weight: 600; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #2a2520; }
  .memory-card .mc-key { color: #c678dd; }
  .memory-card .mc-val { color: #98c379; }
  .memory-card .mc-warn { color: #e06c75; }
  .memory-card .mc-flag { color: #e5c07b; }
  .memory-card .mc-sep { color: #3d3830; margin: 6px 0; display: block; }

  /* PRIZE BOX */
  .prize-box {
    background: var(--ink); color: var(--bg);
    border-radius: 6px; padding: 28px 32px; margin: 28px 0;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center;
  }
  .prize-item .prize-name { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #9a9288; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
  .prize-item .prize-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--bg); line-height: 1; margin-bottom: 4px; }
  .prize-item .prize-desc { font-size: 11px; color: #6a6258; }

  /* VIVIRION SECTION */
  .vivirion-box {
    background: linear-gradient(135deg, #0a1628 0%, #0d2040 100%);
    border: 1px solid rgba(44,110,138,0.4);
    border-radius: 6px; padding: 36px; margin: 28px 0;
    color: #c8d8e8;
  }
  .vivirion-box h3 { font-family: 'Syne', sans-serif; color: #7ab8d4; margin-bottom: 16px; font-size: 20px; }
  .vivirion-box p { color: #8aacbf; font-size: 14px; margin: 10px 0; }
  .vivirion-box strong { color: #c8d8e8; }
  .vivirion-box .viv-pill {
    display: inline-block; font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; padding: 4px 12px; border: 1px solid rgba(44,110,138,0.5);
    color: #7ab8d4; border-radius: 2px; margin: 4px 4px 4px 0;
  }

  h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin: 28px 0 12px; }
  h4 { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--accent); margin: 20px 0 8px; }
  p { margin: 10px 0; color: var(--ink2); }
  strong { color: var(--ink); }
  ul, ol { padding-left: 22px; }
  li { margin: 6px 0; color: var(--ink2); font-size: 14px; }
  code { font-family: 'IBM Plex Mono', monospace; font-size: 12px; background: var(--bg2); border: 1px solid var(--border); padding: 1px 6px; border-radius: 3px; color: var(--accent2); }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--border-dark); border-radius: 3px; }

  @media (max-width: 768px) {
    .hero { padding: 40px 24px; }
    .hero h1 { font-size: 44px; }
    .section { padding: 44px 24px; }
    .agent-grid, .env-grid, .role-grid { grid-template-columns: 1fr; }
    .prize-box { grid-template-columns: 1fr 1fr; }
    .toc-bar { padding: 0 24px; }
  }
</style>
</head>
<body>

<!-- HERO -->
<div class="hero">
  <div class="hero-badge">HackCanada 2026 — WardRound Architecture v2</div>
  <h1>WardRound<em>The Care Coordination OS</em></h1>
  <p class="hero-desc">Stripped to three primary tracks. Backboard + Vultr + Auth0. Clean, buildable, winning.</p>
  <div class="hero-pills">
    <div class="hero-pill primary">Backboard.io</div>
    <div class="hero-pill primary">Vultr</div>
    <div class="hero-pill primary">Auth0</div>
    <div class="hero-pill primary">Vivirion (framing)</div>
    <div class="hero-pill removed">Cloudinary ✕</div>
    <div class="hero-pill removed">ElevenLabs ✕</div>
  </div>
</div>

<!-- TOC -->
<div class="toc-bar">
  <a class="toc-item" href="#s1"><span>01</span>What Changed</a>
  <a class="toc-item" href="#s2"><span>02</span>The Idea</a>
  <a class="toc-item" href="#s3"><span>03</span>Tech Stack</a>
  <a class="toc-item" href="#s4"><span>04</span>Architecture</a>
  <a class="toc-item" href="#s5"><span>05</span>The 3 Agents</a>
  <a class="toc-item" href="#s6"><span>06</span>Data Flow</a>
  <a class="toc-item" href="#s7"><span>07</span>Project Structure</a>
  <a class="toc-item" href="#s8"><span>08</span>Accounts & Keys</a>
  <a class="toc-item" href="#s9"><span>09</span>Backboard Setup</a>
  <a class="toc-item" href="#s10"><span>10</span>Backend Code</a>
  <a class="toc-item" href="#s11"><span>11</span>Frontend Code</a>
  <a class="toc-item" href="#s12"><span>12</span>Auth0 Roles</a>
  <a class="toc-item" href="#s13"><span>13</span>Vultr Deploy</a>
  <a class="toc-item" href="#s14"><span>14</span>Hour by Hour</a>
  <a class="toc-item" href="#s15"><span>15</span>The Demo</a>
  <a class="toc-item" href="#s16"><span>16</span>Vivirion</a>
</div>

<!-- S1: WHAT CHANGED -->
<div class="section" id="s1">
  <div class="section-header">
    <div class="section-num">01</div>
    <div>
      <div class="section-title">What Changed From v1</div>
      <div class="section-sub">Read this first. Two minutes.</div>
    </div>
  </div>

  <p>v1 had five sponsor tracks. This version has three primary tracks plus Vivirion as a framing layer. Fewer moving parts, faster build, cleaner demo.</p>

  <table class="tech-table">
    <tr><th>Service</th><th>v1 Status</th><th>v2 Status</th><th>Impact</th></tr>
    <tr>
      <td>Backboard.io</td>
      <td>Primary ✓</td>
      <td>Primary ✓ — unchanged</td>
      <td>All three agents identical to v1</td>
    </tr>
    <tr>
      <td>Auth0</td>
      <td>Primary ✓</td>
      <td>Primary ✓ — unchanged</td>
      <td>Same three roles, same JWT middleware</td>
    </tr>
    <tr>
      <td>Vultr</td>
      <td>Primary ✓</td>
      <td>Primary ✓ — expanded</td>
      <td>Now also handles Object Storage for documents</td>
    </tr>
    <tr>
      <td>Vivirion</td>
      <td>Not in v1</td>
      <td>Track framing — Section 16</td>
      <td>No code changes. Pitch framing only.</td>
    </tr>
    <tr class="removed">
      <td>Cloudinary</td>
      <td>Secondary</td>
      <td>Removed</td>
      <td>Replaced by Multer + Vultr Object Storage</td>
    </tr>
    <tr class="removed">
      <td>ElevenLabs</td>
      <td>Secondary</td>
      <td>Removed</td>
      <td>Briefing is text-only now. Simpler, still powerful.</td>
    </tr>
  </table>

  <div class="callout green">
    <strong>Net result:</strong> You save roughly 4–6 hours of build time, have two fewer accounts to set up, and the demo is actually cleaner. The three core agents are unchanged. The Backboard, Vultr, and Auth0 prize cases are all intact. Vivirion is addressed at the end in 30 minutes of Devpost writing.
  </div>

  <div class="callout dark">
    <strong>What you lose:</strong> The audio briefing (PSW listened while driving) is gone — briefing is now text on screen. The medication bottle OCR auto-population is gone — PSWs type in medications manually. Neither of these loses you the demo. The Handoff Agent, the Family Communication Agent, and the nightly Sentinel are all still there.
  </div>
</div>

<!-- S2: THE IDEA -->
<div class="section" id="s2">
  <div class="section-header">
    <div class="section-num">02</div>
    <div>
      <div class="section-title">The Idea</div>
      <div class="section-sub">Unchanged from v1 — still the right problem</div>
    </div>
  </div>

  <p>There are <strong>800,000+ Personal Support Workers (PSWs) in Canada</strong> who care for elderly, disabled, and post-surgical patients at home. Every one of them carries an impossible cognitive load. When a PSW calls in sick and sends a replacement, that replacement walks in <strong>completely blind</strong>. No context. No medication history. No behavioral patterns. No family dynamics.</p>

  <p>WardRound is a <strong>persistent multi-agent AI operating system</strong> that maintains a living memory of every client, generates instant pre-visit briefings for any caregiver, monitors medications nightly for discrepancies, and drafts family updates tailored to each family member's communication style — all from a single memory thread that never forgets.</p>

  <div class="callout brown">
    <strong>The three things you're building this weekend:</strong> Agent 1 — Handoff Agent (generates the briefing). Agent 2 — Medication Sentinel (runs nightly on Vultr). Agent 3 — Family Communication Agent (drafts two tailored messages). That's it. Everything else is roadmap.
  </div>

  <div class="prize-box">
    <div class="prize-item">
      <div class="prize-name">Backboard</div>
      <div class="prize-val">$500</div>
      <div class="prize-desc">Cash — multi-agent OS</div>
    </div>
    <div class="prize-item">
      <div class="prize-name">Vultr</div>
      <div class="prize-val">4×</div>
      <div class="prize-desc">Portable screens</div>
    </div>
    <div class="prize-item">
      <div class="prize-name">Auth0</div>
      <div class="prize-val">4×</div>
      <div class="prize-desc">Wireless headphones</div>
    </div>
    <div class="prize-item">
      <div class="prize-name">Vivirion</div>
      <div class="prize-val">4×</div>
      <div class="prize-desc">Mechanical keyboards</div>
    </div>
  </div>
</div>

<!-- S3: TECH STACK -->
<div class="section" id="s3">
  <div class="section-header">
    <div class="section-num">03</div>
    <div>
      <div class="section-title">Tech Stack</div>
      <div class="section-sub">Lean. Three sponsor services. No wasted dependencies.</div>
    </div>
  </div>

  <table class="tech-table">
    <tr><th>Tool</th><th>Role</th><th>Why</th></tr>
    <tr>
      <td>Backboard.io</td>
      <td>AI OS — agents, memory, RAG, orchestration</td>
      <td>The entire product depends on persistent cross-session memory. Remove it and the product doesn't exist.</td>
    </tr>
    <tr>
      <td>React + Vite</td>
      <td>Frontend — PSW app, family portal, coordinator dashboard</td>
      <td>Fast dev server, component model maps cleanly to three different role-based views</td>
    </tr>
    <tr>
      <td>Node.js + Express</td>
      <td>Backend API server</td>
      <td>Lightweight, fast to scaffold, excellent Backboard SDK support</td>
    </tr>
    <tr>
      <td>Auth0</td>
      <td>Authentication + role-based access control</td>
      <td>Three user types (PSW, family, coordinator) with different permissions on sensitive medical data</td>
    </tr>
    <tr>
      <td>Vultr VPS</td>
      <td>Backend hosting + nightly cron engine</td>
      <td>Nightly Medication Sentinel needs a persistent server. Can't run on serverless.</td>
    </tr>
    <tr>
      <td>Vultr Object Storage</td>
      <td>Document file storage (discharge PDFs, care plans)</td>
      <td>Replaces Cloudinary. S3-compatible API. Files stored on Canadian infrastructure — meaningful for healthcare data.</td>
    </tr>
    <tr>
      <td>Vultr Managed Redis</td>
      <td>Bull job queue for document processing</td>
      <td>Async pipeline so uploads don't block the API response</td>
    </tr>
    <tr>
      <td>Bull</td>
      <td>Job queue library</td>
      <td>Manages document processing jobs on top of Redis</td>
    </tr>
    <tr>
      <td>Multer</td>
      <td>File upload middleware</td>
      <td>Handles multipart form data for document uploads on the Express server</td>
    </tr>
    <tr>
      <td>Vercel</td>
      <td>Frontend hosting</td>
      <td>30-second deploy, free tier, global CDN</td>
    </tr>
  </table>

  <div class="callout blue">
    <strong>Vultr now does three things in this version:</strong> (1) Runs the Express backend on a VPS, (2) hosts Managed Redis for the job queue, (3) provides Object Storage for uploaded documents. This actually makes the Vultr prize case stronger — your entire backend infrastructure, including storage, is on Vultr Toronto. That's a concrete Canadian data residency story for healthcare data.
  </div>
</div>

<!-- S4: ARCHITECTURE -->
<div class="section" id="s4">
  <div class="section-header">
    <div class="section-num">04</div>
    <div>
      <div class="section-title">System Architecture</div>
      <div class="section-sub">Every layer mapped out</div>
    </div>
  </div>

  <div class="arch">
    <div class="arch-title">// WARDROUND v2 — SYSTEM ARCHITECTURE (Backboard + Vultr + Auth0)</div>

    <div class="arch-section-label">// USER LAYER</div>
    <div class="arch-layer">
      <div class="arch-box user">👩‍⚕️ PSW<span class="sub">Mobile-optimized web</span></div>
      <div class="arch-box user">👨‍👩‍👧 Family<span class="sub">Read-only portal</span></div>
      <div class="arch-box user">🏥 Coordinator<span class="sub">Full dashboard</span></div>
    </div>
    <div class="arch-connector">↕ All requests gated by Auth0 JWT ↕</div>

    <div class="arch-section-label">// AUTH LAYER</div>
    <div class="arch-layer">
      <div class="arch-box auth0">Auth0<span class="sub">JWT · Roles: psw / family / coordinator · Google login</span></div>
    </div>
    <div class="arch-connector">↕</div>

    <div class="arch-section-label">// FRONTEND — Vercel (localhost:3000 in dev)</div>
    <div class="arch-layer">
      <div class="arch-box frontend">React + Vite<span class="sub">Role-based views · No Cloudinary SDK needed</span></div>
    </div>
    <div class="arch-connector">↓ HTTPS REST ↓</div>

    <div class="arch-section-label">// BACKEND — Vultr VPS Toronto (localhost:4000 in dev)</div>
    <div class="arch-layer">
      <div class="arch-box backend">Express API<span class="sub">Routes + Auth middleware + Multer uploads</span></div>
      <div class="arch-box redis">Redis + Bull<span class="sub">Vultr Managed Redis · async doc queue</span></div>
      <div class="arch-box vultr">Cron Engine<span class="sub">node-cron · 2 AM nightly sentinel</span></div>
    </div>
    <div class="arch-connector">↓</div>

    <div class="arch-section-label">// STORAGE — Vultr Object Storage (S3-compatible)</div>
    <div class="arch-layer">
      <div class="arch-box storage">Vultr Object Storage<span class="sub">Discharge PDFs · Care plans · Incident photos</span></div>
    </div>
    <div class="arch-connector">↓ Files + extracted text fed into RAG ↓</div>

    <div class="arch-section-label">// AI LAYER — Backboard OS</div>
    <div class="arch-layer">
      <div class="arch-box backboard" style="min-width:320px;">Backboard Memory Store<span class="sub">One persistent thread per client · Shared across all PSWs, family, coordinator</span></div>
    </div>
    <div class="arch-layer" style="margin-top:10px;">
      <div class="arch-box backboard" style="min-width:110px; font-size:10px;">Handoff Agent<span class="sub">Fast/cheap model</span></div>
      <div class="arch-box backboard" style="min-width:110px; font-size:10px;">Med Sentinel<span class="sub">Strong reasoning</span></div>
      <div class="arch-box backboard" style="min-width:110px; font-size:10px;">Family Comms<span class="sub">Empathetic model</span></div>
      <div class="arch-box backboard" style="min-width:110px; font-size:10px;">Document RAG<span class="sub">Doc-specialist</span></div>
    </div>

    <div style="margin-top:22px; padding-top:18px; border-top:1px solid #2a2520; font-family:'IBM Plex Mono',monospace; font-size:10px; color:#5c6370; line-height:2.2;">
      HOSTING: Frontend → Vercel &nbsp;|&nbsp; Backend + Redis + Object Storage → Vultr Toronto<br>
      DATA: All patient documents stay on Canadian Vultr infrastructure. Never leaves Canada.<br>
      MEMORY: Single Backboard thread per client. Every user role reads/writes the same thread, scoped by permissions.
    </div>
  </div>

  <h3>The memory model</h3>
  <p>One Backboard thread per client. Every agent, every PSW, every family member interaction updates the same thread. This is what makes the handoff possible — the replacement PSW gets a briefing built from months of context contributed by every previous caregiver.</p>

  <div class="memory-card">
    <div class="mc-title">CLIENT MEMORY THREAD — thread_id: client_margaret_chen_001</div>
    <span class="mc-key">CLIENT:</span> <span class="mc-val">Margaret Chen, 81, Toronto ON</span><br>
    <span class="mc-key">MEDICAL:</span> <span class="mc-val">Diabetes T2, moderate dementia, L hip replacement Nov 2024</span><br>
    <span class="mc-key">MEDICATIONS:</span><br>
    &nbsp;&nbsp;<span class="mc-val">Metformin 500mg — breakfast AND dinner</span> <span class="mc-warn">← changed Jan 14, dinner dose missed 6x</span><br>
    &nbsp;&nbsp;<span class="mc-val">Amlodipine 5mg — dinner &nbsp; Donepezil 10mg — bedtime</span> <span class="mc-flag">← increased 4 days ago</span><br>
    <span class="mc-sep">────────────────────────────────────────────────────────</span>
    <span class="mc-key">BEHAVIORAL:</span> <span class="mc-val">Sundowning after 4pm. Responds to jazz. Agitated when routine disrupted.</span><br>
    <span class="mc-key">MOBILITY:</span> <span class="mc-val">Walker required. 3-person assist for shower. NO stairs.</span><br>
    <span class="mc-key">WOUND:</span> <span class="mc-val">L hip — "slightly red" noted Feb 28.</span> <span class="mc-warn">← monitor daily</span><br>
    <span class="mc-sep">────────────────────────────────────────────────────────</span>
    <span class="mc-key">FAMILY.linda:</span> <span class="mc-val">daughter · primary · clinical comms · calls Tuesdays</span><br>
    <span class="mc-key">FAMILY.david:</span> <span class="mc-val">son · anxious · reassurance only · NO clinical language</span><br>
    <span class="mc-sep">────────────────────────────────────────────────────────</span>
    <span class="mc-key">LAST_7_VISITS:</span> <span class="mc-warn">3 meal refusals. 1 near-fall Tuesday. Ate well Thursday.</span><br>
    <span class="mc-key">SENTINEL_FLAG:</span> <span class="mc-warn">⚠ Metformin dinner dose unconfirmed 6 consecutive visits</span><br>
    <span class="mc-key">DOCUMENTS_RAG:</span> <span class="mc-val">discharge_nov2024.pdf · care_plan_jan2025.pdf</span>
  </div>
</div>

<!-- S5: THE 3 AGENTS -->
<div class="section" id="s5">
  <div class="section-header">
    <div class="section-num">05</div>
    <div>
      <div class="section-title">The Three Agents</div>
      <div class="section-sub">Build these three and nothing else this weekend</div>
    </div>
  </div>

  <div class="agent-grid">
    <div class="agent-card a1">
      <div class="agent-num">AGENT 01 — YOUR DEMO CENTERPIECE</div>
      <div class="agent-name">The Handoff Agent</div>
      <div class="agent-model">fast / cheap model — fires on every visit open</div>
      <div class="agent-body">
        <p>Triggered the moment a PSW opens a client profile before a visit. Reads the entire Backboard memory thread and generates a warm, specific, actionable briefing. Not a database dump — sounds like a colleague who cared for this patient yesterday.</p>
        <ul>
          <li>Fires automatically on client profile open — not on-demand</li>
          <li>Uses cheap fast model because it runs constantly</li>
          <li>Output displayed as readable text — no audio needed</li>
          <li>The demo moment: new PSW, first visit, never met Margaret → full context in 10 seconds</li>
        </ul>
        <div style="margin-top:14px; padding:12px; background:rgba(192,57,43,0.04); border-radius:4px; font-size:12px; font-style:italic; color:#3d3830; line-height:1.6;">
          "Margaret had a rough week. Three meal refusals. Her hip wound was slightly red Friday — watch it. She responds to jazz if she gets anxious. Her daughter Linda calls Tuesdays. Donepezil was increased 4 days ago — she may be drowsier than usual. <strong>Key flag: confirm she gets her dinner Metformin — it's been missed 6 times.</strong>"
        </div>
      </div>
    </div>

    <div class="agent-card a2">
      <div class="agent-num">AGENT 02 — VULTR JUSTIFICATION</div>
      <div class="agent-name">Medication Sentinel</div>
      <div class="agent-model">strong reasoning model — safety-critical</div>
      <div class="agent-body">
        <p>Runs every night at 2 AM via a Vultr cron job — completely independently of any user being logged in. For every active client, compares what PSWs logged giving versus what the care plan says they should be giving.</p>
        <ul>
          <li>This is exactly why Vultr earns its place — a persistent server running scheduled jobs is the entire feature</li>
          <li>Uses the strongest reasoning model because medication errors are safety-critical</li>
          <li>Discrepancy flags written back into client's Backboard memory thread</li>
          <li>Coordinator receives a morning digest email of all overnight flags</li>
          <li>PSW sees the flags as a red banner next time they open the client profile</li>
        </ul>
      </div>
    </div>

    <div class="agent-card a3" style="grid-column: 1 / -1;">
      <div class="agent-num">AGENT 03 — THE EMOTIONAL MOMENT</div>
      <div class="agent-name">Family Communication Agent</div>
      <div class="agent-model">empathetic model — hot-swapped per task</div>
      <div class="agent-body" style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
        <div>
          <p>Takes one clinical event and drafts two completely different messages for two different family members — based on their stored communication preferences in Backboard memory. PSW reviews and sends both with one tap.</p>
          <ul>
            <li>Hot-swaps to an empathetic communication-optimized model for drafting</li>
            <li>Family member profiles stored in persistent Backboard memory — never re-enter</li>
            <li>PSW doesn't write anything — reviews and taps approve</li>
            <li>Same facts, two completely different registers</li>
          </ul>
        </div>
        <div>
          <div style="padding:14px; background:rgba(45,122,71,0.05); border:1px solid rgba(45,122,71,0.2); border-radius:4px; margin-bottom:12px; font-size:12px;">
            <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#2d7a47; margin-bottom:6px;">→ LINDA (clinical, detailed)</div>
            <em>"Margaret had a positive visit today. She ate a full breakfast. We noted mild redness around the hip incision site — monitoring it and will flag to her care team if unchanged by Friday."</em>
          </div>
          <div style="padding:14px; background:rgba(44,110,138,0.05); border:1px solid rgba(44,110,138,0.2); border-radius:4px; font-size:12px;">
            <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#2c6e8a; margin-bottom:6px;">→ DAVID (reassurance, no clinical language)</div>
            <em>"Great visit with your mom today! She had a good breakfast and was in great spirits this morning. Everything's going well — keeping a close eye on her as always."</em>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- S6: DATA FLOW -->
<div class="section" id="s6">
  <div class="section-header">
    <div class="section-num">06</div>
    <div>
      <div class="section-title">Data Flow</div>
      <div class="section-sub">Two critical journeys traced end to end</div>
    </div>
  </div>

  <h3>Journey A — PSW pre-visit briefing</h3>
  <div class="flow">
    <div class="flow-step">
      <div class="icon">📱</div>
      <div class="ftitle">PSW opens client</div>
      <div class="flabel">Selects Margaret Chen before driving over</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step b">
      <div class="icon">🔐</div>
      <div class="ftitle">Auth0 check</div>
      <div class="flabel">JWT verified. Role = "psw". Access granted.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step c">
      <div class="icon">🧠</div>
      <div class="ftitle">Handoff Agent</div>
      <div class="flabel">Backboard reads full memory thread. Generates briefing text.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step d">
      <div class="icon">📋</div>
      <div class="ftitle">Briefing displays</div>
      <div class="flabel">Text shown on screen. PSW reads before walking in.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">
      <div class="icon">✅</div>
      <div class="ftitle">PSW logs visit</div>
      <div class="flabel">Meds given, observations, mood. Memory updated.</div>
    </div>
  </div>

  <h3>Journey B — Nightly medication sentinel (no user required)</h3>
  <div class="flow">
    <div class="flow-step">
      <div class="icon">⏰</div>
      <div class="ftitle">Vultr cron fires</div>
      <div class="flabel">2 AM Toronto time. Vultr VPS runs the job automatically.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step b">
      <div class="icon">📋</div>
      <div class="ftitle">Fetch all clients</div>
      <div class="flabel">Backend gets all active client IDs and their Backboard thread IDs.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step c">
      <div class="icon">🔍</div>
      <div class="ftitle">Sentinel runs</div>
      <div class="flabel">Backboard reads each thread. Compares logged meds vs. care plan.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step d">
      <div class="icon">⚠️</div>
      <div class="ftitle">Flag written</div>
      <div class="flabel">Discrepancies written back to Backboard memory. Visible on next briefing.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">
      <div class="icon">📧</div>
      <div class="ftitle">Coordinator email</div>
      <div class="flabel">Morning digest sent at 7 AM with all overnight flags.</div>
    </div>
  </div>

  <h3>Journey C — Document upload (discharge summary PDF)</h3>
  <div class="flow">
    <div class="flow-step">
      <div class="icon">📄</div>
      <div class="ftitle">Family uploads PDF</div>
      <div class="flabel">Hospital discharge summary. Multer receives the file.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step b">
      <div class="icon">🗄️</div>
      <div class="ftitle">Vultr Object Storage</div>
      <div class="flabel">File stored on Canadian Vultr infrastructure. Permanent URL generated.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step c">
      <div class="icon">📬</div>
      <div class="ftitle">Bull queue job</div>
      <div class="flabel">Job pushed to Redis queue. Returns immediately — no timeout.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step d">
      <div class="icon">🧠</div>
      <div class="ftitle">Backboard RAG</div>
      <div class="flabel">Worker uploads file to Backboard document store for the client's thread.</div>
    </div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">
      <div class="icon">✅</div>
      <div class="ftitle">Agents can query it</div>
      <div class="flabel">Sentinel and Handoff Agent can now answer questions grounded in the PDF.</div>
    </div>
  </div>
</div>

<!-- S7: PROJECT STRUCTURE -->
<div class="section" id="s7">
  <div class="section-header">
    <div class="section-num">07</div>
    <div>
      <div class="section-title">Project Structure</div>
      <div class="section-sub">Organize your repo from minute one</div>
    </div>
  </div>

  <div class="file-label">wardround/ — full repo layout</div>
  <pre><span class="va">wardround/</span>
├── <span class="va">frontend/</span>                          <span class="cm"># React + Vite</span>
│   ├── src/
│   │   ├── <span class="va">components/</span>
│   │   │   ├── <span class="fn">BriefingCard.jsx</span>           <span class="cm"># Pre-visit briefing — the demo centerpiece</span>
│   │   │   ├── <span class="fn">VisitLogger.jsx</span>            <span class="cm"># PSW end-of-visit form</span>
│   │   │   ├── <span class="fn">FamilyMessageDraft.jsx</span>     <span class="cm"># Review/send dual message drafts</span>
│   │   │   ├── <span class="fn">MedicationFlags.jsx</span>        <span class="cm"># Show overnight sentinel alerts</span>
│   │   │   └── <span class="fn">DocumentUpload.jsx</span>         <span class="cm"># Upload discharge PDFs to Vultr storage</span>
│   │   ├── <span class="va">pages/</span>
│   │   │   ├── <span class="fn">PSWDashboard.jsx</span>           <span class="cm"># Client list + briefings</span>
│   │   │   ├── <span class="fn">FamilyPortal.jsx</span>           <span class="cm"># Read-only summaries for family</span>
│   │   │   └── <span class="fn">CoordinatorDashboard.jsx</span>   <span class="cm"># All clients, all flags, full access</span>
│   │   ├── <span class="fn">auth0-provider.jsx</span>             <span class="cm"># Auth0 wrapper around the whole app</span>
│   │   ├── <span class="fn">api.js</span>                         <span class="cm"># All backend calls — always sends JWT</span>
│   │   └── <span class="fn">App.jsx</span>                        <span class="cm"># Role-based route rendering</span>
│   ├── .env.local
│   └── package.json
│
├── <span class="va">backend/</span>                           <span class="cm"># Node.js + Express</span>
│   ├── <span class="va">routes/</span>
│   │   ├── <span class="fn">briefings.js</span>               <span class="cm"># GET /:clientId → triggers Handoff Agent</span>
│   │   ├── <span class="fn">visits.js</span>                  <span class="cm"># POST / → logs visit, updates Backboard memory</span>
│   │   ├── <span class="fn">family.js</span>                  <span class="cm"># POST /draft → Family Comms Agent</span>
│   │   ├── <span class="fn">documents.js</span>               <span class="cm"># POST /upload → Multer → Vultr Object Storage</span>
│   │   └── <span class="fn">clients.js</span>                 <span class="cm"># CRUD for client profiles (coordinator only)</span>
│   ├── <span class="va">services/</span>
│   │   ├── <span class="fn">backboard.js</span>               <span class="cm"># createThread, runAgent, writeMemory, uploadDoc</span>
│   │   └── <span class="fn">vultrStorage.js</span>            <span class="cm"># Vultr Object Storage S3 client</span>
│   ├── <span class="va">workers/</span>
│   │   └── <span class="fn">documentWorker.js</span>          <span class="cm"># Bull worker: store file → push to Backboard RAG</span>
│   ├── <span class="fn">cron.js</span>                        <span class="cm"># Nightly Medication Sentinel — prod only</span>
│   ├── <span class="fn">queue.js</span>                       <span class="cm"># Bull queue setup</span>
│   ├── <span class="fn">middleware/auth.js</span>             <span class="cm"># JWT validation + role extraction</span>
│   ├── <span class="fn">db.js</span>                          <span class="cm"># Simple JSON file DB (fine for hackathon)</span>
│   ├── <span class="fn">server.js</span>                      <span class="cm"># Express entry point</span>
│   ├── .env
│   └── package.json</pre>
</div>

<!-- S8: ACCOUNTS & KEYS -->
<div class="section" id="s8">
  <div class="section-header">
    <div class="section-num">08</div>
    <div>
      <div class="section-title">Accounts & API Keys</div>
      <div class="section-sub">One person does this. Takes 30 minutes. Do it before writing any code.</div>
    </div>
  </div>

  <div class="timeline">
    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-time">STEP 1 — Backboard.io (15 min)</div>
      <div class="tl-title">The most important setup. Get this right.</div>
      <div class="tl-body">
        <ul>
          <li>Go to <strong>backboard.io</strong> → Sign up → Create project "wardround"</li>
          <li>Copy your <strong>API Key</strong> and <strong>Project ID</strong> from the dashboard</li>
          <li>Create three Assistants: <code>handoff-agent</code>, <code>medication-sentinel</code>, <code>family-comms-agent</code></li>
          <li>For each: set Memory to <strong>"Auto"</strong> — Backboard manages reads/writes automatically</li>
          <li><strong>handoff-agent:</strong> set to fastest/cheapest model available</li>
          <li><strong>medication-sentinel:</strong> set to strongest reasoning model (Claude Opus or GPT-4o)</li>
          <li><strong>family-comms-agent:</strong> set to a medium model with good empathetic communication</li>
          <li>Paste the system prompts from Section 9 into each assistant in the Backboard dashboard</li>
          <li>Copy each assistant's <strong>Assistant ID</strong> — goes into .env</li>
        </ul>
      </div>
    </div>

    <div class="tl-item">
      <div class="tl-dot b"></div>
      <div class="tl-time b">STEP 2 — Auth0 (10 min)</div>
      <div class="tl-title">Authentication + roles</div>
      <div class="tl-body">
        <ul>
          <li>Go to <strong>auth0.com</strong> → Sign up → Applications → Create Application → Single Page Application → "WardRound"</li>
          <li>Copy: <strong>Domain</strong> and <strong>Client ID</strong></li>
          <li>Settings → Allowed Callback URLs: <code>http://localhost:3000</code></li>
          <li>Settings → Allowed Web Origins: <code>http://localhost:3000</code></li>
          <li>Enable Google Social Connection (Authentication → Social → toggle Google on)</li>
          <li>Applications → APIs → Create API. Name: "WardRound API". Identifier: <code>https://wardround-api</code>. Copy this — it's your <code>AUTH0_AUDIENCE</code>.</li>
          <li>User Management → Roles → Create three roles: <code>psw</code>, <code>family</code>, <code>coordinator</code></li>
          <li>Actions → Flows → Login → Add the Action from Section 12 that injects roles into JWT</li>
          <li>Create three test user accounts, assign one role each — you'll use these to demo the three views</li>
        </ul>
      </div>
    </div>

    <div class="tl-item">
      <div class="tl-dot c"></div>
      <div class="tl-time c">STEP 3 — Vultr (5 min now, deploy at hour 28)</div>
      <div class="tl-title">Sign up now, configure later</div>
      <div class="tl-body">
        <ul>
          <li>Go to <strong>mlh.link/vultr</strong> — sign up through this link to claim MLH free credits</li>
          <li>Don't spin up anything yet — do the full deploy at hour 28</li>
          <li>Just verify you have an account and credits. Note your account email.</li>
          <li>When you do deploy: you'll use <strong>Cloud Compute VPS</strong>, <strong>Managed Redis</strong>, and <strong>Object Storage</strong> — all in the Toronto region</li>
        </ul>
      </div>
    </div>
  </div>

  <h3>Your .env files — complete</h3>

  <div class="file-label">backend/.env</div>
  <pre><span class="cm"># ── Backboard ──────────────────────────────────────</span>
<span class="va">BACKBOARD_API_KEY</span>=bb_live_xxxxxxxxxxxxxxxxxxxxxxxx
<span class="va">BACKBOARD_PROJECT_ID</span>=proj_xxxxxxxxxxxxxxxxxxxxxxxx
<span class="va">BACKBOARD_HANDOFF_AGENT_ID</span>=asst_xxxxxxxxxxxxxxxx
<span class="va">BACKBOARD_SENTINEL_AGENT_ID</span>=asst_xxxxxxxxxxxxxxxx
<span class="va">BACKBOARD_FAMILY_AGENT_ID</span>=asst_xxxxxxxxxxxxxxxx

<span class="cm"># ── Auth0 ───────────────────────────────────────────</span>
<span class="va">AUTH0_DOMAIN</span>=your-app.us.auth0.com
<span class="va">AUTH0_AUDIENCE</span>=https://wardround-api

<span class="cm"># ── Vultr Object Storage (S3-compatible) ────────────</span>
<span class="va">VULTR_STORAGE_ACCESS_KEY</span>=your_access_key
<span class="va">VULTR_STORAGE_SECRET_KEY</span>=your_secret_key
<span class="va">VULTR_STORAGE_ENDPOINT</span>=https://ewr1.vultrobjects.com
<span class="va">VULTR_STORAGE_BUCKET</span>=wardround-documents

<span class="cm"># ── Redis ────────────────────────────────────────────</span>
<span class="va">REDIS_URL</span>=redis://localhost:6379  <span class="cm"># local dev</span>
<span class="cm"># REDIS_URL=redis://default:password@vultr-redis-host:16379  # production</span>

<span class="cm"># ── App ──────────────────────────────────────────────</span>
<span class="va">PORT</span>=4000
<span class="va">CORS_ORIGIN</span>=http://localhost:3000
<span class="va">NODE_ENV</span>=development</pre>

  <div class="file-label">frontend/.env.local</div>
  <pre><span class="va">VITE_AUTH0_DOMAIN</span>=your-app.us.auth0.com
<span class="va">VITE_AUTH0_CLIENT_ID</span>=your_client_id
<span class="va">VITE_AUTH0_AUDIENCE</span>=https://wardround-api
<span class="va">VITE_API_URL</span>=http://localhost:4000</pre>
</div>

<!-- S9: BACKBOARD SETUP -->
<div class="section" id="s9">
  <div class="section-header">
    <div class="section-num">09</div>
    <div>
      <div class="section-title">Backboard Setup & System Prompts</div>
      <div class="section-sub">Paste these into the Backboard dashboard for each assistant</div>
    </div>
  </div>

  <pre><span class="cm"># Install</span>
npm install axios form-data</pre>

  <div class="file-label">Backboard dashboard → handoff-agent → System Prompt</div>
  <pre><span class="str">You are WardRound's Handoff Agent. When a PSW is about to visit a client,
you read the client's full memory thread and generate a pre-visit briefing.

Your briefing must:
- Sound like an experienced colleague giving a quick handoff — not a database dump
- Lead with the MOST IMPORTANT thing to know right now (recent changes, flags, concerns)
- Cover: current medications and recent changes, behavioral patterns, mobility needs,
  any wound or health concerns, family dynamics, and outstanding flags
- Be under 200 words — the PSW is reading this before walking through the door
- Use plain language — no clinical jargon
- End with exactly one "Watch for today:" instruction

Never say "according to the records" or "the database shows."
Speak as if you personally cared for this client yesterday.</span></pre>

  <div class="file-label">Backboard dashboard → medication-sentinel → System Prompt</div>
  <pre><span class="str">You are WardRound's Medication Sentinel. You run nightly to check for
medication discrepancies and safety concerns.

When called, review the last 7 days of visit logs in this client's memory thread.
Compare what PSWs logged as "medications given" against the current prescribed
medication schedule in the care plan.

Your response must be one of:
1. "CLEAR" — if all medications appear to have been given as prescribed
2. A brief, specific discrepancy report listing exactly which medications
   appear missed or given incorrectly, on which dates.

Be precise. Be conservative — if you're uncertain whether something was missed,
flag it. A false positive is better than a missed dose.
Do not include greetings, explanations, or caveats. Just CLEAR or the flag.</span></pre>

  <div class="file-label">Backboard dashboard → family-comms-agent → System Prompt</div>
  <pre><span class="str">You are WardRound's Family Communication Agent. PSWs use you to draft
family update messages after a client visit.

You will be given: an event or observation from today's visit, plus the
family member profiles stored in this client's memory (communication preferences,
relationship to client, what language/tone they prefer).

For each family member listed, draft one message:
- Tailored exactly to their stored communication preferences
- Warm, clear, and reassuring in tone
- Under 80 words per message
- Never mentioning that the message was AI-generated
- Never including clinical jargon for family members marked as preferring plain language

Format your response as:
[FAMILY_MEMBER_NAME]
[their message]

[NEXT_FAMILY_MEMBER_NAME]
[their message]</span></pre>

  <div class="file-label">backend/services/backboard.js — complete service file</div>
  <pre><span class="kw">const</span> <span class="va">axios</span> = <span class="fn">require</span>(<span class="str">'axios'</span>);

<span class="kw">const</span> <span class="va">BASE</span> = <span class="str">'https://api.backboard.io/v1'</span>;
<span class="kw">const</span> <span class="fn">headers</span> = () => ({
  <span class="str">'Authorization'</span>: `Bearer ${<span class="va">process</span>.env.<span class="va">BACKBOARD_API_KEY</span>}`,
  <span class="str">'Content-Type'</span>: <span class="str">'application/json'</span>
});

<span class="cm">// Create a new persistent memory thread for a client.</span>
<span class="cm">// Call once on enrollment. Store the returned thread_id in your DB.</span>
<span class="kw">async function</span> <span class="fn">createClientThread</span>(clientId, clientName) {
  <span class="kw">const</span> <span class="va">res</span> = <span class="kw">await</span> <span class="va">axios</span>.<span class="fn">post</span>(`${<span class="va">BASE</span>}/threads`, {
    metadata: { client_id: clientId, client_name: clientName,
                project_id: <span class="va">process</span>.env.<span class="va">BACKBOARD_PROJECT_ID</span> }
  }, { headers: <span class="fn">headers</span>() });
  <span class="kw">return</span> <span class="va">res</span>.data.thread_id;
}

<span class="cm">// Run a specific agent on a client's thread.</span>
<span class="cm">// Returns the agent's text response when complete.</span>
<span class="kw">async function</span> <span class="fn">runAgent</span>(agentId, threadId, userMessage) {
  <span class="kw">const</span> <span class="va">run</span> = <span class="kw">await</span> <span class="va">axios</span>.<span class="fn">post</span>(
    `${<span class="va">BASE</span>}/threads/${threadId}/messages`,
    { assistant_id: agentId, role: <span class="str">'user'</span>, content: userMessage },
    { headers: <span class="fn">headers</span>() }
  );
  <span class="kw">return</span> <span class="kw">await</span> <span class="fn">pollForCompletion</span>(threadId, <span class="va">run</span>.data.run_id);
}

<span class="cm">// Write a structured note to the client's memory.</span>
<span class="cm">// Use after every PSW visit log.</span>
<span class="kw">async function</span> <span class="fn">writeMemory</span>(threadId, content) {
  <span class="kw">await</span> <span class="va">axios</span>.<span class="fn">post</span>(`${<span class="va">BASE</span>}/threads/${threadId}/memory`,
    { content, role: <span class="str">'system'</span> },
    { headers: <span class="fn">headers</span>() }
  );
}

<span class="cm">// Upload a document (PDF) to the thread's RAG store.</span>
<span class="cm">// Agents can then answer questions grounded in this document.</span>
<span class="kw">async function</span> <span class="fn">uploadDocumentToRAG</span>(threadId, fileBuffer, filename) {
  <span class="kw">const</span> <span class="va">FormData</span> = <span class="fn">require</span>(<span class="str">'form-data'</span>);
  <span class="kw">const</span> <span class="va">form</span> = <span class="kw">new</span> <span class="fn">FormData</span>();
  <span class="va">form</span>.<span class="fn">append</span>(<span class="str">'file'</span>, fileBuffer, filename);
  <span class="va">form</span>.<span class="fn">append</span>(<span class="str">'thread_id'</span>, threadId);
  <span class="kw">await</span> <span class="va">axios</span>.<span class="fn">post</span>(`${<span class="va">BASE</span>}/files`, form,
    { headers: { ...<span class="fn">headers</span>(), ...<span class="va">form</span>.<span class="fn">getHeaders</span>() } }
  );
}

<span class="cm">// Poll until the agent run completes (runs are async in Backboard)</span>
<span class="kw">async function</span> <span class="fn">pollForCompletion</span>(threadId, runId, maxAttempts = <span class="nu">30</span>) {
  <span class="kw">for</span> (<span class="kw">let</span> i = <span class="nu">0</span>; i < maxAttempts; i++) {
    <span class="kw">await</span> <span class="kw">new</span> <span class="fn">Promise</span>(r => <span class="fn">setTimeout</span>(r, <span class="nu">1000</span>));
    <span class="kw">const</span> <span class="va">res</span> = <span class="kw">await</span> <span class="va">axios</span>.<span class="fn">get</span>(
      `${<span class="va">BASE</span>}/threads/${threadId}/runs/${runId}`,
      { headers: <span class="fn">headers</span>() }
    );
    <span class="kw">if</span> (<span class="va">res</span>.data.status === <span class="str">'completed'</span>) <span class="kw">return</span> <span class="va">res</span>.data.response;
    <span class="kw">if</span> (<span class="va">res</span>.data.status === <span class="str">'failed'</span>) <span class="kw">throw new</span> <span class="fn">Error</span>(<span class="str">'Backboard agent run failed'</span>);
  }
  <span class="kw">throw new</span> <span class="fn">Error</span>(<span class="str">'Backboard agent timed out after 30 seconds'</span>);
}

<span class="va">module</span>.exports = { createClientThread, runAgent, writeMemory, uploadDocumentToRAG };</pre>
</div>

<!-- S10: BACKEND CODE -->
<div class="section" id="s10">
  <div class="section-header">
    <div class="section-num">10</div>
    <div>
      <div class="section-title">Backend Code</div>
      <div class="section-sub">Server, routes, Vultr storage, and the cron</div>
    </div>
  </div>

  <pre><span class="cm"># From wardround/backend/</span>
npm init -y
npm install express cors dotenv axios form-data bull ioredis \
  multer @aws-sdk/client-s3 node-cron nodemailer \
  express-oauth2-jwt-bearer</pre>

  <div class="file-label">backend/server.js</div>
  <pre><span class="kw">require</span>(<span class="str">'dotenv'</span>).<span class="fn">config</span>();
<span class="kw">const</span> <span class="va">express</span> = <span class="fn">require</span>(<span class="str">'express'</span>);
<span class="kw">const</span> <span class="va">cors</span> = <span class="fn">require</span>(<span class="str">'cors'</span>);
<span class="kw">const</span> { <span class="va">auth</span> } = <span class="fn">require</span>(<span class="str">'express-oauth2-jwt-bearer'</span>);

<span class="kw">const</span> <span class="va">app</span> = <span class="fn">express</span>();
<span class="va">app</span>.<span class="fn">use</span>(<span class="fn">cors</span>({ origin: <span class="va">process</span>.env.<span class="va">CORS_ORIGIN</span> }));
<span class="va">app</span>.<span class="fn">use</span>(<span class="va">express</span>.<span class="fn">json</span>());

<span class="cm">// Auth0 JWT validation</span>
<span class="kw">const</span> <span class="va">checkJwt</span> = <span class="fn">auth</span>({
  audience: <span class="va">process</span>.env.<span class="va">AUTH0_AUDIENCE</span>,
  issuerBaseURL: `https://${<span class="va">process</span>.env.<span class="va">AUTH0_DOMAIN</span>}/`
});

<span class="cm">// Role checker — use after checkJwt on any route</span>
<span class="kw">const</span> <span class="fn">requireRole</span> = (...roles) => (req, res, next) => {
  <span class="kw">const</span> <span class="va">userRoles</span> = req.auth?.payload[<span class="str">'https://wardround.app/roles'</span>] || [];
  <span class="kw">if</span> (!roles.<span class="fn">some</span>(r => <span class="va">userRoles</span>.<span class="fn">includes</span>(r)))
    <span class="kw">return</span> <span class="va">res</span>.<span class="fn">status</span>(<span class="nu">403</span>).<span class="fn">json</span>({ error: <span class="str">'Insufficient role'</span> });
  <span class="fn">next</span>();
};

<span class="cm">// Routes — each role-gated appropriately</span>
<span class="va">app</span>.<span class="fn">use</span>(<span class="str">'/api/briefings'</span>, <span class="va">checkJwt</span>, <span class="fn">requireRole</span>(<span class="str">'psw'</span>,<span class="str">'coordinator'</span>), <span class="fn">require</span>(<span class="str">'./routes/briefings'</span>));
<span class="va">app</span>.<span class="fn">use</span>(<span class="str">'/api/visits'</span>,   <span class="va">checkJwt</span>, <span class="fn">requireRole</span>(<span class="str">'psw'</span>), <span class="fn">require</span>(<span class="str">'./routes/visits'</span>));
<span class="va">app</span>.<span class="fn">use</span>(<span class="str">'/api/family'</span>,   <span class="va">checkJwt</span>, <span class="fn">requireRole</span>(<span class="str">'psw'</span>,<span class="str">'family'</span>,<span class="str">'coordinator'</span>), <span class="fn">require</span>(<span class="str">'./routes/family'</span>));
<span class="va">app</span>.<span class="fn">use</span>(<span class="str">'/api/documents'</span>,<span class="va">checkJwt</span>, <span class="fn">requireRole</span>(<span class="str">'psw'</span>,<span class="str">'family'</span>,<span class="str">'coordinator'</span>), <span class="fn">require</span>(<span class="str">'./routes/documents'</span>));
<span class="va">app</span>.<span class="fn">use</span>(<span class="str">'/api/clients'</span>,  <span class="va">checkJwt</span>, <span class="fn">requireRole</span>(<span class="str">'coordinator'</span>), <span class="fn">require</span>(<span class="str">'./routes/clients'</span>));
<span class="va">app</span>.<span class="fn">get</span>(<span class="str">'/health'</span>, (req, res) => <span class="va">res</span>.<span class="fn">json</span>({ status: <span class="str">'ok'</span> }));

<span class="kw">if</span> (<span class="va">process</span>.env.<span class="va">NODE_ENV</span> === <span class="str">'production'</span>) <span class="fn">require</span>(<span class="str">'./cron'</span>);

<span class="va">app</span>.<span class="fn">listen</span>(<span class="va">process</span>.env.<span class="va">PORT</span> || <span class="nu">4000</span>);</pre>

  <div class="file-label">backend/services/vultrStorage.js — Vultr Object Storage (S3-compatible)</div>
  <pre><span class="kw">const</span> { <span class="va">S3Client</span>, <span class="va">PutObjectCommand</span>, <span class="va">GetObjectCommand</span> } = <span class="fn">require</span>(<span class="str">'@aws-sdk/client-s3'</span>);
<span class="kw">const</span> { <span class="va">getSignedUrl</span> } = <span class="fn">require</span>(<span class="str">'@aws-sdk/s3-request-presigner'</span>);

<span class="kw">const</span> <span class="va">s3</span> = <span class="kw">new</span> <span class="fn">S3Client</span>({
  endpoint: <span class="va">process</span>.env.<span class="va">VULTR_STORAGE_ENDPOINT</span>,
  region: <span class="str">'ewr1'</span>,  <span class="cm">// Vultr uses region codes — ewr1 is Newark, closest to Toronto</span>
  credentials: {
    accessKeyId: <span class="va">process</span>.env.<span class="va">VULTR_STORAGE_ACCESS_KEY</span>,
    secretAccessKey: <span class="va">process</span>.env.<span class="va">VULTR_STORAGE_SECRET_KEY</span>
  }
});

<span class="kw">async function</span> <span class="fn">uploadFile</span>(fileBuffer, filename, mimeType) {
  <span class="kw">const</span> <span class="va">key</span> = `documents/${<span class="fn">Date</span>.<span class="fn">now</span>()}-${filename}`;
  <span class="kw">await</span> <span class="va">s3</span>.<span class="fn">send</span>(<span class="kw">new</span> <span class="fn">PutObjectCommand</span>({
    Bucket: <span class="va">process</span>.env.<span class="va">VULTR_STORAGE_BUCKET</span>,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: <span class="str">'private'</span>  <span class="cm">// Private — never publicly accessible</span>
  }));
  <span class="kw">return</span> key; <span class="cm">// Return key to store in DB, not a public URL</span>
}

<span class="kw">async function</span> <span class="fn">getSignedDownloadUrl</span>(key) {
  <span class="cm">// Generate a temporary signed URL (1 hour) for authenticated access</span>
  <span class="kw">return</span> <span class="kw">await</span> <span class="fn">getSignedUrl</span>(<span class="va">s3</span>, <span class="kw">new</span> <span class="fn">GetObjectCommand</span>({
    Bucket: <span class="va">process</span>.env.<span class="va">VULTR_STORAGE_BUCKET</span>,
    Key: key
  }), { expiresIn: <span class="nu">3600</span> });
}

<span class="va">module</span>.exports = { uploadFile, getSignedDownloadUrl };</pre>

  <div class="file-label">backend/routes/documents.js — upload route</div>
  <pre><span class="kw">const</span> <span class="va">router</span> = <span class="fn">require</span>(<span class="str">'express'</span>).<span class="fn">Router</span>();
<span class="kw">const</span> <span class="va">multer</span> = <span class="fn">require</span>(<span class="str">'multer'</span>);
<span class="kw">const</span> { <span class="va">uploadFile</span> } = <span class="fn">require</span>(<span class="str">'../services/vultrStorage'</span>);
<span class="kw">const</span> { <span class="va">memoirQueue</span> } = <span class="fn">require</span>(<span class="str">'../queue'</span>);
<span class="kw">const</span> <span class="va">db</span> = <span class="fn">require</span>(<span class="str">'../db'</span>);

<span class="cm">// Memory storage — file goes to Vultr, not disk</span>
<span class="kw">const</span> <span class="va">upload</span> = <span class="fn">multer</span>({ storage: <span class="va">multer</span>.<span class="fn">memoryStorage</span>() });

<span class="cm">// POST /api/documents/upload</span>
<span class="va">router</span>.<span class="fn">post</span>(<span class="str">'/upload'</span>, <span class="va">upload</span>.<span class="fn">single</span>(<span class="str">'file'</span>), <span class="kw">async</span> (req, res) => {
  <span class="kw">const</span> { clientId, docType } = req.body; <span class="cm">// docType: 'discharge' | 'care_plan' | 'other'</span>
  <span class="kw">const</span> <span class="va">client</span> = <span class="kw">await</span> <span class="va">db</span>.<span class="fn">getClient</span>(clientId);

  <span class="cm">// 1. Store file on Vultr Object Storage</span>
  <span class="kw">const</span> <span class="va">storageKey</span> = <span class="kw">await</span> <span class="fn">uploadFile</span>(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype
  );

  <span class="cm">// 2. Push async job to process document → Backboard RAG</span>
  <span class="kw">await</span> <span class="va">memoirQueue</span>.<span class="fn">add</span>({
    type: <span class="str">'document'</span>,
    clientId,
    threadId: <span class="va">client</span>.backboard_thread_id,
    storageKey,
    filename: req.file.originalname,
    docType
  });

  <span class="cm">// Returns immediately — document processes in background</span>
  <span class="va">res</span>.<span class="fn">json</span>({ success: <span class="kw">true</span>, message: <span class="str">'Document uploaded and queued for processing'</span> });
});</pre>

  <div class="file-label">backend/cron.js — nightly medication sentinel</div>
  <pre><span class="kw">const</span> <span class="va">cron</span> = <span class="fn">require</span>(<span class="str">'node-cron'</span>);
<span class="kw">const</span> { <span class="va">runAgent</span>, <span class="va">writeMemory</span> } = <span class="fn">require</span>(<span class="str">'./services/backboard'</span>);
<span class="kw">const</span> <span class="va">db</span> = <span class="fn">require</span>(<span class="str">'./db'</span>);

<span class="cm">// Every night at 2 AM Toronto time — runs on Vultr VPS</span>
<span class="va">cron</span>.<span class="fn">schedule</span>(<span class="str">'0 2 * * *'</span>, <span class="kw">async</span> () => {
  <span class="va">console</span>.<span class="fn">log</span>(<span class="str">'[SENTINEL] Nightly medication check starting...'</span>);
  <span class="kw">const</span> <span class="va">clients</span> = <span class="kw">await</span> <span class="va">db</span>.<span class="fn">getAllActiveClients</span>();
  <span class="kw">const</span> <span class="va">flags</span> = [];

  <span class="kw">for</span> (<span class="kw">const</span> <span class="va">client</span> <span class="kw">of</span> <span class="va">clients</span>) {
    <span class="kw">try</span> {
      <span class="kw">const</span> <span class="va">result</span> = <span class="kw">await</span> <span class="fn">runAgent</span>(
        <span class="va">process</span>.env.<span class="va">BACKBOARD_SENTINEL_AGENT_ID</span>,
        <span class="va">client</span>.backboard_thread_id,
        <span class="str">`Review the last 7 days of visit logs. Compare medications given
         vs. prescribed schedule. Return CLEAR or a specific flag.`</span>
      );

      <span class="kw">if</span> (<span class="va">result</span>.trim() !== <span class="str">'CLEAR'</span>) {
        <span class="va">flags</span>.<span class="fn">push</span>({ clientName: <span class="va">client</span>.name, issue: <span class="va">result</span> });

        <span class="cm">// Write flag into memory — Handoff Agent will surface it tomorrow</span>
        <span class="kw">await</span> <span class="fn">writeMemory</span>(
          <span class="va">client</span>.backboard_thread_id,
          `⚠️ MEDICATION SENTINEL FLAG ${<span class="kw">new</span> <span class="fn">Date</span>().<span class="fn">toDateString</span>()}: ${<span class="va">result</span>}`
        );
      }
    } <span class="kw">catch</span> (e) {
      <span class="va">console</span>.<span class="fn">error</span>(`Sentinel failed for ${<span class="va">client</span>.name}:`, e.message);
    }
  }

  <span class="kw">if</span> (<span class="va">flags</span>.length > <span class="nu">0</span>) {
    <span class="cm">// Send coordinator email digest at 2 AM (they read it at 7 AM)</span>
    <span class="kw">await</span> <span class="fn">sendCoordinatorDigest</span>(<span class="va">flags</span>);
  }
  <span class="va">console</span>.<span class="fn">log</span>(`[SENTINEL] Done. ${<span class="va">flags</span>.length} flags raised across ${<span class="va">clients</span>.length} clients.`);
}, { timezone: <span class="str">'America/Toronto'</span> });</pre>
</div>

<!-- S11: FRONTEND -->
<div class="section" id="s11">
  <div class="section-header">
    <div class="section-num">11</div>
    <div>
      <div class="section-title">Frontend Code</div>
      <div class="section-sub">React setup, role routing, and the key components</div>
    </div>
  </div>

  <pre><span class="cm"># From wardround/frontend/</span>
npm create vite@latest . -- --template react
npm install @auth0/auth0-react axios react-router-dom</pre>

  <div class="file-label">frontend/src/main.jsx — Auth0 wraps everything</div>
  <pre><span class="kw">import</span> { <span class="va">Auth0Provider</span> } <span class="kw">from</span> <span class="str">'@auth0/auth0-react'</span>;
<span class="kw">import</span> { <span class="va">BrowserRouter</span> } <span class="kw">from</span> <span class="str">'react-router-dom'</span>;
<span class="kw">import</span> <span class="va">App</span> <span class="kw">from</span> <span class="str">'./App'</span>;

<span class="fn">ReactDOM</span>.<span class="fn">createRoot</span>(document.<span class="fn">getElementById</span>(<span class="str">'root'</span>)).<span class="fn">render</span>(
  &lt;<span class="va">Auth0Provider</span>
    domain={<span class="va">import</span>.meta.env.<span class="va">VITE_AUTH0_DOMAIN</span>}
    clientId={<span class="va">import</span>.meta.env.<span class="va">VITE_AUTH0_CLIENT_ID</span>}
    authorizationParams={{
      redirect_uri: <span class="va">window</span>.location.origin,
      audience: <span class="va">import</span>.meta.env.<span class="va">VITE_AUTH0_AUDIENCE</span>
    }}
  &gt;
    &lt;<span class="va">BrowserRouter</span>&gt;&lt;<span class="va">App</span> /&gt;&lt;/<span class="va">BrowserRouter</span>&gt;
  &lt;/<span class="va">Auth0Provider</span>&gt;
);</pre>

  <div class="file-label">frontend/src/App.jsx — role-based routing</div>
  <pre><span class="kw">import</span> { <span class="fn">useAuth0</span> } <span class="kw">from</span> <span class="str">'@auth0/auth0-react'</span>;

<span class="kw">export default function</span> <span class="fn">App</span>() {
  <span class="kw">const</span> { isAuthenticated, isLoading, user, loginWithRedirect } = <span class="fn">useAuth0</span>();
  <span class="kw">const</span> <span class="va">roles</span> = user?.[<span class="str">'https://wardround.app/roles'</span>] || [];

  <span class="kw">if</span> (isLoading) <span class="kw">return</span> &lt;<span class="va">div</span> className=<span class="str">"loading"</span>&gt;Loading...&lt;/<span class="va">div</span>&gt;;

  <span class="kw">if</span> (!isAuthenticated) <span class="kw">return</span> (
    &lt;<span class="va">div</span> className=<span class="str">"login-screen"</span>&gt;
      &lt;<span class="va">h1</span>&gt;WardRound&lt;/<span class="va">h1</span>&gt;
      &lt;<span class="va">p</span>&gt;Secure sign-in for caregivers, families, and coordinators&lt;/<span class="va">p</span>&gt;
      &lt;<span class="va">button</span> onClick={loginWithRedirect}&gt;Sign in with Google&lt;/<span class="va">button</span>&gt;
    &lt;/<span class="va">div</span>&gt;
  );

  <span class="cm">// Render the view for the user's assigned role</span>
  <span class="kw">if</span> (roles.<span class="fn">includes</span>(<span class="str">'coordinator'</span>)) <span class="kw">return</span> &lt;<span class="va">CoordinatorDashboard</span> /&gt;;
  <span class="kw">if</span> (roles.<span class="fn">includes</span>(<span class="str">'psw'</span>)) <span class="kw">return</span> &lt;<span class="va">PSWDashboard</span> /&gt;;
  <span class="kw">if</span> (roles.<span class="fn">includes</span>(<span class="str">'family'</span>)) <span class="kw">return</span> &lt;<span class="va">FamilyPortal</span> /&gt;;
  <span class="kw">return</span> &lt;<span class="va">div</span>&gt;No role assigned. Contact your coordinator.&lt;/<span class="va">div</span>&gt;;
}</pre>

  <div class="file-label">frontend/src/api.js — all calls include Auth0 JWT</div>
  <pre><span class="kw">import</span> { <span class="fn">useAuth0</span> } <span class="kw">from</span> <span class="str">'@auth0/auth0-react'</span>;
<span class="kw">import</span> <span class="va">axios</span> <span class="kw">from</span> <span class="str">'axios'</span>;
<span class="kw">const</span> <span class="va">BASE</span> = <span class="va">import</span>.meta.env.<span class="va">VITE_API_URL</span>;

<span class="kw">export function</span> <span class="fn">useApi</span>() {
  <span class="kw">const</span> { <span class="va">getAccessTokenSilently</span> } = <span class="fn">useAuth0</span>();

  <span class="kw">const</span> <span class="fn">authHeaders</span> = <span class="kw">async</span> () => {
    <span class="kw">const</span> <span class="va">token</span> = <span class="kw">await</span> <span class="fn">getAccessTokenSilently</span>();
    <span class="kw">return</span> { Authorization: `Bearer ${<span class="va">token</span>}` };
  };

  <span class="kw">return</span> {
    <span class="fn">get</span>: <span class="kw">async</span> (path) =>
      <span class="va">axios</span>.<span class="fn">get</span>(`${<span class="va">BASE</span>}${path}`, { headers: <span class="kw">await</span> <span class="fn">authHeaders</span>() }),

    <span class="fn">post</span>: <span class="kw">async</span> (path, data) =>
      <span class="va">axios</span>.<span class="fn">post</span>(`${<span class="va">BASE</span>}${path}`, data, { headers: <span class="kw">await</span> <span class="fn">authHeaders</span>() }),

    <span class="fn">upload</span>: <span class="kw">async</span> (path, formData) =>
      <span class="va">axios</span>.<span class="fn">post</span>(`${<span class="va">BASE</span>}${path}`, formData, {
        headers: { ...<span class="kw">await</span> <span class="fn">authHeaders</span>(), <span class="str">'Content-Type'</span>: <span class="str">'multipart/form-data'</span> }
      })
  };
}</pre>

  <div class="file-label">frontend/src/components/BriefingCard.jsx — the demo centerpiece</div>
  <pre><span class="kw">import</span> { useState, useEffect } <span class="kw">from</span> <span class="str">'react'</span>;
<span class="kw">import</span> { <span class="fn">useApi</span> } <span class="kw">from</span> <span class="str">'../api'</span>;

<span class="kw">export function</span> <span class="fn">BriefingCard</span>({ clientId, clientName }) {
  <span class="kw">const</span> [briefing, setBriefing] = <span class="fn">useState</span>(<span class="kw">null</span>);
  <span class="kw">const</span> [loading, setLoading] = <span class="fn">useState</span>(<span class="kw">true</span>);
  <span class="kw">const</span> { get } = <span class="fn">useApi</span>();

  <span class="fn">useEffect</span>(() => {
    <span class="fn">get</span>(`/api/briefings/${clientId}`)
      .<span class="fn">then</span>(res => { <span class="fn">setBriefing</span>(res.data.briefing); <span class="fn">setLoading</span>(<span class="kw">false</span>); })
      .<span class="fn">catch</span>(() => <span class="fn">setLoading</span>(<span class="kw">false</span>));
  }, [clientId]);

  <span class="kw">if</span> (loading) <span class="kw">return</span> (
    &lt;<span class="va">div</span> className=<span class="str">"briefing-loading"</span>&gt;
      Preparing briefing for {clientName}...
      &lt;<span class="cm">{/* Subtle pulse animation so the wait feels intentional */}</span>
    &lt;/<span class="va">div</span>&gt;
  );

  <span class="kw">return</span> (
    &lt;<span class="va">div</span> className=<span class="str">"briefing-card"</span>&gt;
      &lt;<span class="va">div</span> className=<span class="str">"briefing-header"</span>&gt;
        &lt;<span class="va">span</span> className=<span class="str">"briefing-label"</span>&gt;Pre-visit briefing&lt;/<span class="va">span</span>&gt;
        &lt;<span class="va">span</span> className=<span class="str">"client-name"</span>&gt;{clientName}&lt;/<span class="va">span</span>&gt;
      &lt;/<span class="va">div</span>&gt;
      &lt;<span class="va">p</span> className=<span class="str">"briefing-text"</span>&gt;{briefing}&lt;/<span class="va">p</span>&gt;
      &lt;<span class="va">button</span> className=<span class="str">"start-visit-btn"</span>
        onClick={() => navigate(`/visit/${clientId}`)}&gt;
        Start Visit →
      &lt;/<span class="va">button</span>&gt;
    &lt;/<span class="va">div</span>&gt;
  );
}</pre>
</div>

<!-- S12: AUTH0 ROLES -->
<div class="section" id="s12">
  <div class="section-header">
    <div class="section-num">12</div>
    <div>
      <div class="section-title">Auth0 Role Setup</div>
      <div class="section-sub">Three user types. Real permissions. Real security story.</div>
    </div>
  </div>

  <div class="role-grid">
    <div class="role-card">
      <div class="role-icon">👩‍⚕️</div>
      <div class="role-name">PSW</div>
      <div class="role-perms">
        <span class="perm-yes">✓</span> Get briefings<br>
        <span class="perm-yes">✓</span> Log visits<br>
        <span class="perm-yes">✓</span> Draft family messages<br>
        <span class="perm-yes">✓</span> Upload documents<br>
        <span class="perm-no">✗</span> Create/edit clients<br>
        <span class="perm-no">✗</span> See other clients<br>
        <span class="perm-no">✗</span> View sentinel digest
      </div>
    </div>
    <div class="role-card">
      <div class="role-icon">👨‍👩‍👧</div>
      <div class="role-name">Family</div>
      <div class="role-perms">
        <span class="perm-yes">✓</span> View care summaries<br>
        <span class="perm-yes">✓</span> View medication status<br>
        <span class="perm-yes">✓</span> Upload documents<br>
        <span class="perm-no">✗</span> See raw PSW visit notes<br>
        <span class="perm-no">✗</span> See other clients<br>
        <span class="perm-no">✗</span> Log visits<br>
        <span class="perm-no">✗</span> See sentinel flags
      </div>
    </div>
    <div class="role-card">
      <div class="role-icon">🏥</div>
      <div class="role-name">Coordinator</div>
      <div class="role-perms">
        <span class="perm-yes">✓</span> All PSW permissions<br>
        <span class="perm-yes">✓</span> All family permissions<br>
        <span class="perm-yes">✓</span> Create/edit clients<br>
        <span class="perm-yes">✓</span> View all clients<br>
        <span class="perm-yes">✓</span> View sentinel digest<br>
        <span class="perm-yes">✓</span> Assign PSWs to clients<br>
        <span class="perm-yes">✓</span> Receive morning email
      </div>
    </div>
  </div>

  <div class="file-label">Auth0 Dashboard → Actions → Flows → Login → Create Action → paste this</div>
  <pre><span class="cm">// Injects user roles into every JWT token issued</span>
exports.<span class="fn">onExecutePostLogin</span> = <span class="kw">async</span> (event, api) => {
  <span class="kw">const</span> <span class="va">namespace</span> = <span class="str">'https://wardround.app'</span>;
  <span class="kw">const</span> <span class="va">roles</span> = event.authorization?.roles || [];

  <span class="cm">// Backend reads roles from access token</span>
  api.accessToken.<span class="fn">setCustomClaim</span>(`${<span class="va">namespace</span>}/roles`, <span class="va">roles</span>);
  <span class="cm">// Frontend reads roles from ID token</span>
  api.idToken.<span class="fn">setCustomClaim</span>(`${<span class="va">namespace</span>}/roles`, <span class="va">roles</span>);
};</pre>

  <div class="callout blue">
    <strong>Demo setup:</strong> Create three test accounts in Auth0. Assign one the "psw" role, one "family", one "coordinator". Log in as each during the demo to show three completely different views of the same client. That contrast is your Auth0 prize justification in 30 seconds.
  </div>
</div>

<!-- S13: VULTR DEPLOY -->
<div class="section" id="s13">
  <div class="section-header">
    <div class="section-num">13</div>
    <div>
      <div class="section-title">Deploying to Vultr</div>
      <div class="section-sub">Do this at hour 28. ~20 minutes total. Three Vultr services.</div>
    </div>
  </div>

  <h3>Step 1 — Spin up VPS + Redis + Object Storage (8 min in dashboard)</h3>
  <pre><span class="cm"># In Vultr dashboard — create three things:</span>

<span class="cm"># 1. Cloud Compute VPS</span>
<span class="cm">#    Region: Toronto | OS: Ubuntu 24.04 | Plan: 1 vCPU 1GB RAM ($6/mo)</span>
<span class="cm">#    → Get an IP address</span>

<span class="cm"># 2. Managed Redis</span>
<span class="cm">#    Database → Create → Redis → Toronto → smallest plan</span>
<span class="cm">#    → Get connection string</span>

<span class="cm"># 3. Object Storage</span>
<span class="cm">#    Object Storage → Create → pick any region → bucket name: wardround-documents</span>
<span class="cm">#    → Get access key + secret key from the bucket settings</span></pre>

  <h3>Step 2 — SSH in and install Node (4 min)</h3>
  <pre>ssh root@YOUR_VULTR_IP

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2</pre>

  <h3>Step 3 — Push code and start server (5 min)</h3>
  <pre><span class="cm"># From your LOCAL machine — push backend to Vultr</span>
rsync -avz ./backend/ root@YOUR_VULTR_IP:/app/backend/

<span class="cm"># Back in SSH:</span>
cd /app/backend
npm install
nano .env  <span class="cm"># Paste your env vars — update these:</span>
           <span class="cm"># NODE_ENV=production</span>
           <span class="cm"># CORS_ORIGIN=https://your-vercel-url.vercel.app</span>
           <span class="cm"># REDIS_URL=redis://default:password@your-vultr-redis-host:16379</span>
           <span class="cm"># VULTR_STORAGE_ACCESS_KEY / SECRET_KEY from step 1</span>

pm2 start server.js --name wardround-api
pm2 startup && pm2 save

<span class="cm"># Verify</span>
curl http://localhost:4000/health</pre>

  <h3>Step 4 — Deploy frontend to Vercel (3 min)</h3>
  <pre><span class="cm"># From your LOCAL machine, in wardround/frontend/</span>
npx vercel

<span class="cm"># Set env vars when prompted:</span>
<span class="cm"># VITE_API_URL = http://YOUR_VULTR_IP:4000</span>
<span class="cm"># VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE</span>

<span class="cm"># → You get: https://wardround-xxxx.vercel.app</span>
<span class="cm"># Go to Auth0 → update Callback URLs with this Vercel URL</span></pre>

  <div class="callout green">
    <strong>Vultr prize pitch — say this word for word:</strong> "Our entire backend infrastructure runs on Vultr in the Toronto region — the Express API on a Cloud Compute VPS, job queuing on Vultr Managed Redis, and all patient documents stored on Vultr Object Storage. No patient data leaves Canadian infrastructure. The nightly Medication Sentinel is a cron job that fires at 2 AM on that server regardless of whether anyone is using the app — it checks every active client's medication logs and writes flags into their Backboard memory thread before the morning shift starts. That background process is why we needed persistent infrastructure, not serverless."
  </div>
</div>

<!-- S14: HOUR BY HOUR -->
<div class="section" id="s14">
  <div class="section-header">
    <div class="section-num">14</div>
    <div>
      <div class="section-title">Hour-by-Hour Build Plan</div>
      <div class="section-sub">36 hours. Assign lanes at hour zero. Don't swap lanes mid-hackathon.</div>
    </div>
  </div>

  <div class="callout brown">
    <strong>Lane split for 3–4 people:</strong>
    Person A → Backend + Backboard (the hardest lane, most experienced dev).
    Person B → Frontend + Auth0.
    Person C → Vultr deploy + document upload pipeline + demo data prep.
    Person D (if 4) → UI polish, Devpost writing, LinkedIn posts for Stanley track.
  </div>

  <div class="timeline">
    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-time">HOURS 0–3 · Setup sprint — no feature code yet</div>
      <div class="tl-title">Every account created. Every key in a shared doc. Both servers responding.</div>
      <div class="tl-body">
        <ul>
          <li><strong>Person A:</strong> Backboard account → create project → create 3 assistants → paste system prompts → copy all 3 assistant IDs. Scaffold <code>backend/</code>, install all packages, verify <code>/health</code> returns 200.</li>
          <li><strong>Person B:</strong> Auth0 account → create app → enable Google → create API → create 3 roles → add the JWT Action. Scaffold <code>frontend/</code> with Vite, install Auth0 SDK, verify Google login works.</li>
          <li><strong>Person C:</strong> Vultr account via mlh.link/vultr — confirm credits. Don't spin anything up yet. Help A or B if they're stuck on account setup.</li>
          <li><strong>Milestone by hour 3:</strong> <code>localhost:4000/health</code> responds. Google login on <code>localhost:3000</code> works and JWT contains roles. Do not proceed until both are true.</li>
        </ul>
      </div>
    </div>

    <div class="tl-item">
      <div class="tl-dot b"></div>
      <div class="tl-time b">HOURS 3–10 · Backboard memory round-trip — most critical block</div>
      <div class="tl-title">Create a thread. Write memory. Get a briefing back. This is your proof of life.</div>
      <div class="tl-body">
        <ul>
          <li><strong>Person A:</strong> Build <code>backboard.js</code> service — all four functions: createClientThread, runAgent, writeMemory, uploadDocumentToRAG. Test each via Postman before wiring to routes.</li>
          <li><strong>Person A:</strong> Seed Margaret Chen's profile into a Backboard thread manually via Postman. Confirm the Handoff Agent returns a coherent briefing from that initial memory.</li>
          <li><strong>Person A:</strong> Build <code>POST /api/visits</code> — logs a visit, calls writeMemory. Test that the next briefing request reflects the logged visit.</li>
          <li><strong>Person B:</strong> Build <code>BriefingCard.jsx</code> — fetches <code>GET /api/briefings/:clientId</code>, displays the text. Doesn't need styling yet.</li>
          <li><strong>Milestone by hour 10:</strong> Full loop — create client thread → log a visit → request briefing → briefing explicitly mentions the logged visit. If this works, the product works.</li>
        </ul>
      </div>
    </div>

    <div class="tl-item">
      <div class="tl-dot c"></div>
      <div class="tl-time c">HOURS 10–18 · All three agents + visit logger UI</div>
      <div class="tl-title">Every agent firing. Family messages working. Cron tested locally.</div>
      <div class="tl-body">
        <ul>
          <li><strong>Person A:</strong> Build <code>POST /api/family/draft</code> — calls Family Comms Agent, returns two message drafts. Test with two family member profiles in the thread memory.</li>
          <li><strong>Person A:</strong> Build <code>cron.js</code> — test by calling it manually (don't wait until 2 AM). Verify it runs the Sentinel, returns CLEAR or a flag, writes to memory.</li>
          <li><strong>Person B:</strong> Build <code>VisitLogger.jsx</code> — form for medications given, observations, mood, incidents. On submit, calls <code>POST /api/visits</code>.</li>
          <li><strong>Person B:</strong> Build <code>FamilyMessageDraft.jsx</code> — shows both message drafts side by side with edit and send buttons.</li>
          <li><strong>Person C:</strong> Build document upload — <code>DocumentUpload.jsx</code> → <code>POST /api/documents/upload</code> → Multer → Vultr Object Storage → Bull queue → Backboard RAG. Test with a real PDF.</li>
          <li><strong>Milestone by hour 18:</strong> All three agents fire. Demo is possible end to end.</li>
        </ul>
      </div>
    </div>

    <div class="tl-item">
      <div class="tl-dot d"></div>
      <div class="tl-time d">HOURS 18–26 · Role-based UI + sentinel flags display</div>
      <div class="tl-title">Three distinct views. Medication flags prominent. Mobile-responsive.</div>
      <div class="tl-body">
        <ul>
          <li><strong>Person B + D:</strong> Build all three dashboards: PSWDashboard (client list + briefing), FamilyPortal (summaries, no raw notes), CoordinatorDashboard (all clients, sentinel flags, document uploads).</li>
          <li><strong>Person B:</strong> Medication flags — when a sentinel flag exists on a client's thread, show a red banner at the top of their profile page with the flag text.</li>
          <li><strong>Person D:</strong> Load Margaret Chen's full demo profile — 3 weeks of realistic visit history, two family member profiles (Linda and David), a sentinel flag already set, one uploaded care plan PDF. This is what you demo — a real account, not a fresh blank one.</li>
          <li><strong>Everyone:</strong> Make it mobile-responsive. Judges will look at it on their phones.</li>
        </ul>
      </div>
    </div>

    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-time">HOURS 26–30 · Vultr deployment</div>
      <div class="tl-title">Get a live URL. Don't do this when you're exhausted.</div>
      <div class="tl-body">
        <ul>
          <li><strong>Person C:</strong> Follow Section 13 step by step. Spin up VPS, Managed Redis, Object Storage. SSH in, install Node, rsync backend, create .env, start with PM2.</li>
          <li><strong>Person B:</strong> Deploy frontend to Vercel. Update Auth0 callback URLs with the Vercel URL.</li>
          <li><strong>Everyone:</strong> Full end-to-end test on the live URL. Log in as each of the three test accounts. Verify the role-based views work correctly in production.</li>
          <li><strong>Person C:</strong> Manually trigger the cron on the Vultr server to verify it runs. Screenshot the PM2 process list and the cron output — use in Devpost.</li>
        </ul>
      </div>
    </div>

    <div class="tl-item">
      <div class="tl-dot b"></div>
      <div class="tl-time b">HOURS 30–34 · Demo prep + Devpost</div>
      <div class="tl-title">Script rehearsed. Submission written. LinkedIn posts done.</div>
      <div class="tl-body">
        <ul>
          <li><strong>Person D:</strong> Write the Devpost submission — clear README, all sponsor tracks tagged, architecture description, screenshots of all three role views.</li>
          <li><strong>Everyone:</strong> Rehearse the demo from Section 15 until it's under 3 minutes and requires zero improvisation.</li>
          <li><strong>Person D:</strong> Three LinkedIn posts for Stanley track — use Stanley to polish them, tag @Stan. Free $250 for 20 minutes of work.</li>
          <li><strong>No new features after hour 30.</strong> A polished demo of three working agents beats a broken demo of five.</li>
        </ul>
      </div>
    </div>

    <div class="tl-item">
      <div class="tl-dot c"></div>
      <div class="tl-time c">HOURS 34–36 · Submit and stop</div>
      <div class="tl-title">Push. Submit. Sleep.</div>
      <div class="tl-body">
        <ul>
          <li>Push final code to public GitHub repo</li>
          <li>Record 2-minute demo video walking through the three-agent flow</li>
          <li>Submit on Devpost before 10 AM — tag: Backboard, Auth0, Vultr, Vivirion</li>
          <li>Do not touch the code after submitting</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<!-- S15: THE DEMO -->
<div class="section" id="s15">
  <div class="section-header">
    <div class="section-num">15</div>
    <div>
      <div class="section-title">The Demo Script</div>
      <div class="section-sub">3 minutes. Scripted. No improvising.</div>
    </div>
  </div>

  <div class="callout">
    <strong>Opening line — say this before touching the laptop:</strong> "800,000 Canadians work as personal support workers. When one calls in sick and sends a replacement, that replacement walks in completely blind — no context, no medication history, no family dynamics. Just a phone number. WardRound fixes that."
  </div>

  <div class="timeline">
    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-time">0:00 — The contrast (15 seconds)</div>
      <div class="tl-title">Show what today looks like without WardRound</div>
      <div class="tl-body"><p>Open a blank Notepad. Say "This is what a replacement PSW gets." Pause. Close it. Open WardRound.</p></div>
    </div>

    <div class="tl-item">
      <div class="tl-dot b"></div>
      <div class="tl-time b">0:15 — Log in as a brand new PSW (20 seconds)</div>
      <div class="tl-title">Google login via Auth0. Land on client list. Click Margaret Chen.</div>
      <div class="tl-body"><p>While the briefing generates: "This PSW has never met Margaret. She's arriving in 10 minutes." Let the loading state show — it makes the result feel earned.</p></div>
    </div>

    <div class="tl-item">
      <div class="tl-dot c"></div>
      <div class="tl-time c">0:35 — The briefing lands (45 seconds)</div>
      <div class="tl-title">Read the first two sentences out loud. Highlight the sentinel flag.</div>
      <div class="tl-body"><p>Read the briefing opening. Point to the red flag: "The Medication Sentinel flagged this at 2 AM last night — Margaret's dinner Metformin has been missed 6 times. This PSW knows before walking in the door." Point to the Watch For instruction at the bottom.</p></div>
    </div>

    <div class="tl-item">
      <div class="tl-dot d"></div>
      <div class="tl-time d">1:20 — Log a visit (30 seconds)</div>
      <div class="tl-title">Show memory updating. Quick form fill.</div>
      <div class="tl-body"><p>Click Start Visit. Check off medications, add one observation: "Margaret seemed more tired today, ate half her lunch." Submit. Say: "Every PSW who visits after today will know this."</p></div>
    </div>

    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-time">1:50 — Family messages (30 seconds)</div>
      <div class="tl-title">The emotional moment. Don't rush it.</div>
      <div class="tl-body"><p>Show the two drafted messages. Read Linda's. Read David's. Say: "Same visit. Same facts. One tap sends both." Pause. Let it land.</p></div>
    </div>

    <div class="tl-item">
      <div class="tl-dot b"></div>
      <div class="tl-time b">2:20 — Switch to coordinator view (25 seconds)</div>
      <div class="tl-title">Log out. Log back in as coordinator. Show the difference.</div>
      <div class="tl-body"><p>Show the coordinator's full dashboard — all clients, sentinel flags, document uploads. Say: "Three completely different views of the same data. Auth0 enforces what each person can see at the API level."</p></div>
    </div>

    <div class="tl-item">
      <div class="tl-dot c"></div>
      <div class="tl-time c">2:45 — Close (15 seconds)</div>
      <div class="tl-title">One sentence. Put the laptop down.</div>
      <div class="tl-body"><p>"WardRound doesn't replace caregivers. It gives them the one thing they've never had — a memory that never forgets." Stop talking. Don't add anything.</p></div>
    </div>
  </div>
</div>

<!-- S16: VIVIRION — DO THIS LAST -->
<div class="section" id="s16">
  <div class="section-header">
    <div class="section-num">16</div>
    <div>
      <div class="section-title">Vivirion — Add This Last</div>
      <div class="section-sub">30 minutes of Devpost writing. Zero code changes.</div>
    </div>
  </div>

  <div class="vivirion-box">
    <h3>What Vivirion is (and what they're looking for)</h3>
    <p>Vivirion is a Markham, Ontario company that serves Canadian PSWs — their platform covers PSW career development, training, and a professional networking layer currently in development. The track is judged on <strong>practical and applicable real-world usefulness</strong>, not technical novelty. This is your easiest prize to win because WardRound is literally built for Vivirion's exact user base.</p>

    <h3 style="margin-top:24px;">What to write in your Devpost for the Vivirion track</h3>
    <p>Add a section titled "Vivirion Ecosystem Integration" and write the following (adapt freely):</p>
    <p style="margin-top:16px; padding:16px; background:rgba(0,0,0,0.2); border-radius:4px; font-style:italic; line-height:1.8;">
      "WardRound was designed to live inside the Vivirion ecosystem. Vivirion trains and connects Canadian PSWs — WardRound gives those trained PSWs the operational infrastructure they need once they're in the field. A PSW's Vivirion-verified certifications directly inform which clients they're matched to in WardRound. Their dementia care certification determines whether they're assigned to clients with cognitive decline. Their palliative care training determines escalation protocols. As Vivirion's professional networking platform develops, WardRound provides the coordination layer — the shared memory that connects PSWs, families, and coordinators around a client's care. The practical healthcare improvement WardRound delivers is documented and immediate: a replacement caregiver who previously walked in with a phone number now walks in with full context. Medication discrepancies that previously went unnoticed are flagged overnight before anyone is harmed."
    </p>

    <h3 style="margin-top:24px;">What to say to Vivirion judges if they ask about integration</h3>
    <p>Vivirion doesn't have a public API yet. That's fine — and it's actually a better framing. Say: <em>"We designed WardRound to be the operational complement to Vivirion's training platform. When Vivirion's API becomes available, we plug in via webhook — a PSW completing their Vivirion dementia certification automatically unlocks dementia-care clients in WardRound. We built the infrastructure side of that integration already."</em></p>

    <div style="margin-top:20px; display:flex; flex-wrap:wrap; gap:8px;">
      <div class="viv-pill">PSW-focused ✓</div>
      <div class="viv-pill">Canadian company ✓</div>
      <div class="viv-pill">Real-world applicable ✓</div>
      <div class="viv-pill">Practical over theoretical ✓</div>
      <div class="viv-pill">Healthcare workflow improvement ✓</div>
    </div>
  </div>

  <div class="callout green">
    <strong>Time budget for Vivirion:</strong> Write the Devpost section above (15 min). Add one screenshot of the PSW dashboard with a caption: "Built for the 800,000 PSWs Vivirion serves." (5 min). Prepare a 20-second answer to "how does this fit in the Vivirion ecosystem?" (10 min). Total: 30 minutes. Do this at hour 33 after the rest of your Devpost is already written.
  </div>

  <div style="margin-top:48px; padding:32px; background:var(--ink); color:var(--bg); border-radius:6px; text-align:center;">
    <div style="font-family:'Syne',sans-serif; font-size:28px; font-weight:800; margin-bottom:8px;">Good luck.</div>
    <div style="font-family:'IBM Plex Mono',monospace; font-size:11px; color:#6a6258;">WardRound — HackCanada 2026 — Architecture v2 — Backboard · Vultr · Auth0 · Vivirion</div>
  </div>
</div>

</body>
</html>