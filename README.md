# Trump vs Elon - Ultimate Fighter

A web-based 2D fighting game featuring Donald Trump and Elon Musk as playable characters. Built with HTML5, CSS3, and JavaScript, optimized for deployment on Replit.

## Features

- **Two Unique Characters**: Trump (heavy hitter) and Elon (tech master) with distinct movesets
- **Dynamic Combat System**: Punch, kick, block, special moves, and ultimate attacks
- **Combo System**: Chain attacks together for bonus damage
- **AI Opponent**: Four difficulty levels (Easy, Medium, Hard, Insane) with adaptive behavior
- **Visual Effects**: Particle systems, screen shake, and dynamic animations
- **Audio System**: Web Audio API-generated sound effects and background music
- **Responsive UI**: Scales to different screen sizes

## Quick Start

### Local Setup
1. Clone or download all files to a directory
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
3. Click "Start Game" and begin playing!

### Replit Deployment
1. Create a new HTML/CSS/JS repl on Replit
2. Upload all project files
3. Click "Run" to start the web server
4. The game will be accessible at your Replit URL

## How to Play

### Controls
- **A/D**: Move left/right
- **W**: Jump (Elon can double jump!)
- **S**: Block
- **J**: Punch
- **K**: Kick
- **L**: Special Move
- **Space**: Ultimate Move (requires full special bar)
- **Escape**: Pause game

### Character Moves

#### Trump
- **Executive Order** (Special): Powerful mid-range attack
- **Big League Slam** (Ultimate): Devastating close-range finisher
- **Twitter Storm** (Combo): Punch, Punch, Kick
- **Wall Combo**: Kick, Punch, Special

#### Elon
- **Rocket Punch** (Special): Long-range projectile attack
- **Mars Strike** (Ultimate): Area-of-effect orbital strike
- **Tesla Coil** (Combo): Punch, Punch, Punch, Kick
- **Hyperloop Dash**: Kick, Kick, Special

### Game Mechanics

1. **Health System**: Each fighter starts with 100 HP
2. **Special Energy**: Build up by landing attacks and blocking
3. **Combos**: Chain attacks quickly for bonus damage and effects
4. **Blocking**: Reduces damage but drains stamina
5. **Round Timer**: 99 seconds per round

### Tips & Strategies

- Trump excels at close-range combat with high damage but slower speed
- Elon is faster with better mobility but deals less damage per hit
- Use blocks strategically - they reduce damage significantly
- Build special energy for powerful finishing moves
- Learn combo patterns to maximize damage output
- Watch for opponent patterns to counter effectively

## Technical Details

### Browser Requirements
- Modern browser with ES6+ JavaScript support
- Web Audio API support for sound effects
- Canvas API for rendering

### Performance
- Targets 60fps gameplay
- Responsive canvas scaling
- Optimized particle systems
- Efficient collision detection

### File Structure
```
fighting-game/
├── index.html      # Main game page
├── style.css       # All styling and animations
├── script.js       # Core game engine
├── characters.js   # Character definitions
├── ai.js          # AI opponent logic
├── audio.js       # Sound system
└── README.md      # This file
```

## Customization

### Difficulty Settings
- **Easy**: Slower AI reactions, less aggressive
- **Medium**: Balanced gameplay (default)
- **Hard**: Fast reactions, aggressive combos
- **Insane**: Near-instant reactions, relentless attacks

### Audio
- Background music and SFX volume can be adjusted in code
- All sounds are generated using Web Audio API (no external files needed)

## Known Issues & Limitations

- Audio may not initialize on some browsers until first user interaction
- Performance may vary on older devices
- Currently single-player only (multiplayer could be added)

## Future Enhancements

Potential features for future versions:
- Online multiplayer support
- Additional characters
- More arenas/backgrounds
- Tournament mode
- Character customization
- Mobile touch controls

## Credits

Created as a demonstration of modern web game development techniques using only HTML5, CSS3, and JavaScript. All graphics are CSS-based, and all audio is generated programmatically.

---

Enjoy the game! May the best fighter win!