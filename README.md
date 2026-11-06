# Snake Game

A simple Snake game that runs entirely in the browser. Clean black/white/light-blue theme. No installation, no dependencies — just open and play.

## Gameplay

- Control the snake with **Arrow keys** or **WASD**.
- Eat the magenta food to grow and score points.
- Each food gives **10 points** (×2 while a multiplier power-up is active).
- Every **50 points** you level up; the snake gets faster (speed floor: 50ms per step).
- Avoid walls and your own body — hitting either ends the game.
- Your best score is saved in the browser (`localStorage`).

## Controls

- **Arrow keys / WASD** — Move
- **P** — Pause / Resume
- **Toolbar buttons** — Pause, toggle sound
- **On-screen D-pad** — Touch controls (mobile)

## Difficulty

Choose before starting: **Easy / Normal / Hard** (changes starting speed). Choice is saved.

## Power-ups

Power-ups spawn randomly (20% chance) after eating food and disappear after 5 seconds if not collected. Their effect lasts 7 seconds.

| Power-up | Color | Effect |
|----------|-------|--------|
| Speed Boost | Yellow | Snake moves faster (−40ms) |
| Time Slow | Green | Snake moves slower (+40ms) |
| 2× Score | Orange | Points doubled |

The active power-up is shown below the canvas.

## Tech Details

- Canvas: 400×400 px, 20×20 grid (20 px cells)
- Base speeds: Easy 280ms, Normal 220ms, Hard 170ms per step
- Starting length: 3 segments
- Score / Level / High Score displayed in header
- High score key: `neonSnakeHighScore`
- Sound effects via Web Audio API (toggleable)

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure, overlays (start / pause / game over) |
| `style.css` | Neon theme, layout, responsive rules, D-pad |
| `script.js` | Game loop, movement, collisions, power-ups, sound |

## Run

1. Open `index.html` in any modern browser.
2. Choose difficulty, click **BOOT UP**.
3. Play. Click **RESTART SYSTEM** after game over.

## Credits

© 2026 CYBERPUNK SYSTEMS INC.