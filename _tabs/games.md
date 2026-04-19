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
  <div id="game-cards" style="display:flex; flex-wrap:wrap; gap:2rem;"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
<script>
const games = [
  {
    title: "Hybrid Search Game",
    desc:  "Learn how Doris hybrid search works — interactive!",
    url:   "https://morningman.github.io/games/hybrid-search/"
  }
];

games.forEach(function(g) {
  var card = document.createElement('div');
  card.style.cssText = 'border:1px solid var(--border-color); border-radius:12px; padding:1.5rem; text-align:center; width:220px;';

  var canvas = document.createElement('canvas');
  card.appendChild(canvas);

  var title = document.createElement('p');
  title.textContent = g.title;
  title.style.cssText = 'font-weight:600; margin-top:1rem; margin-bottom:0.25rem;';
  card.appendChild(title);

  var desc = document.createElement('p');
  desc.textContent = g.desc;
  desc.style.cssText = 'font-size:0.85rem; color:var(--text-muted-color);';
  card.appendChild(desc);

  document.getElementById('game-cards').appendChild(card);
  QRCode.toCanvas(canvas, g.url, { width: 180, margin: 1 }, function(){});
});
</script>
