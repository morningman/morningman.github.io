---
layout: page
icon: fas fa-gamepad
order: 5
title: Games
permalink: /games/
---

<div style="padding: 2rem 0;">
  <p style="color: var(--text-muted-color); margin-bottom: 2rem;">
    Scan the QR code with your phone to play!
  </p>
  <div style="display:flex; flex-wrap:wrap; gap:2rem;">
    <div style="border:1px solid var(--border-color); border-radius:12px; padding:1.5rem; text-align:center; width:220px;">
      <a href="/games/hybrid-search/">
        <img src="/assets/img/games/hybrid-search-qr.png" alt="Hybrid Search Game QR Code" width="180" height="180" style="display:block; margin:0 auto; width:180px; height:180px; max-width:180px;" />
      </a>
      <p style="font-weight:600; margin-top:1rem; margin-bottom:0.25rem;"><a href="/games/hybrid-search/">Hybrid Search Game</a></p>
      <p style="font-size:0.85rem; color:var(--text-muted-color);">Learn how Doris hybrid search works — interactive!</p>
      <p style="font-size:0.8rem; color:var(--text-muted-color); margin-top:0.5rem; margin-bottom:0;"><i class="fas fa-eye fa-fw"></i> <span class="game-views" data-gc-path="/games/hybrid-search/">—</span> plays</p>
    </div>
    <div style="border:1px solid var(--border-color); border-radius:12px; padding:1.5rem; text-align:center; width:220px;">
      <a href="/games/json-war/">
        <img src="/assets/img/games/json-war-qr.png" alt="JSON War Game QR Code" width="180" height="180" style="display:block; margin:0 auto; width:180px; height:180px; max-width:180px;" />
      </a>
      <p style="font-weight:600; margin-top:1rem; margin-bottom:0.25rem;"><a href="/games/json-war/">JSON War Game</a></p>
      <p style="font-size:0.85rem; color:var(--text-muted-color);">Battle it out with Doris VARIANT — interactive!</p>
      <p style="font-size:0.8rem; color:var(--text-muted-color); margin-top:0.5rem; margin-bottom:0;"><i class="fas fa-eye fa-fw"></i> <span class="game-views" data-gc-path="/games/json-war/">—</span> plays</p>
    </div>
  </div>
</div>

<script>
  (function () {
    document.querySelectorAll('.game-views').forEach(function (el) {
      var path = el.getAttribute('data-gc-path');
      var url = 'https://morningman.goatcounter.com/counter/' + encodeURIComponent(path) + '.json';
      fetch(url)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (d && d.count != null) el.textContent = d.count;
        })
        .catch(function () { /* leave placeholder */ });
    });
  })();
</script>
