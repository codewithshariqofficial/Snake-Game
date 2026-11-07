# Snake Game

A classic Snake game that runs entirely in the browser. Clean black/white/light-blue theme. No installation, no dependencies - just open and play.

## Gameplay

- Control the snake with Arrow keys or WASD.
- Eat the magenta food to grow and score points.
- Each food gives 10 points (2x while a multiplier power-up is active).
- Every 50 points you level up; the snake gets faster (speed floor: 50ms per step).
- Avoid walls and your own body - hitting either ends the game.
- Your best score is saved in the browser (`localStorage`).

## Controls

- Arrow keys / WASD - Move
- P - Pause / Resume
- Toolbar buttons - Pause, toggle sound
- On-screen D-pad - Touch controls (mobile)

## Difficulty

Choose before starting: Easy / Normal / Hard (changes starting speed). Choice is saved.

## Power-ups

Power-ups spawn randomly (20% chance) after eating food and disappear after 5 seconds if not collected. Their effect lasts 7 seconds.

| Power-up | Color | Effect |
|---|---|---|
| Multiplier | Yellow | 2x score for 7 seconds |
| Speed Boost | Cyan | Faster movement for 7 seconds |
| Shield | Green | Survive one wall/self hit |

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Web Audio API (sound effects)

## Project Structure

```
Snake-Game/
├── index.html   # Markup
├── style.css    # Styling
└── script.js    # Game logic
```

## Getting Started

1. Clone or download this repository.
2. Open `index.html` in any modern browser.
3. Pick a difficulty and start playing.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Code With Shariq Official** - [GitHub](https://github.com/codewithshariqofficial)