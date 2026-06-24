# Azul — Digital Edition

A browser-based version of the tile-laying board game **Azul**, with custom
Moorish / azulejo-themed artwork, procedural sound effects (no audio files), and
AI opponents. Pure HTML/CSS/JS — no build step or dependencies.

## Play

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8765
# then visit http://localhost:8765
```

Choose 1–3 AI opponents and decorate your wall of the royal palace.

## Files

- `index.html` — markup, layered azulejo SVG background, setup/overlays
- `styles.css` — full visual theme (no boxes; floating, enameled ceramic tiles)
- `game.js` — rules engine, AI, rendering, sound, and a freeze-prevention watchdog

## Notes

- The rules engine was validated with a 12,000-game headless stress test
  (0 exceptions, 0 tile-count leaks, 0 deadlocks).
- A background watchdog guarantees the async turn engine can never strand the
  game mid-round.
