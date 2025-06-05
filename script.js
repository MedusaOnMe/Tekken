class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.state = 'menu';
        this.selectedCharacter = 'trump';
        this.difficulty = 'medium';
        this.round = 1;
        this.timer = 99;
        this.lastTime = 0;
        
        this.player = null;
        this.opponent = null;
        this.ai = null;
        
        this.particles = [];
        this.effects = [];
        this.screenShake = 0;
        
        this.audioSystem = new AudioSystem();
        this.audioInitialized = false;
        
        this.keys = {};
        this.lastKeys = {};
        this.ultimateNotificationShown = false;
        this.gameStats = {
            maxCombo: 0,
            matchTime: 0,
            perfectWin: true
        };
        
        // Load background image
        this.backgroundImage = new Image();
        this.backgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true;
            console.log('✅ Background image loaded');
        };
        this.backgroundImage.onerror = () => {
            console.log('❌ Background image failed to load, using default');
            this.backgroundLoaded = false;
        };
        this.backgroundImage.src = 'background.png';
        
        this.setupEventListeners();
        this.showMenu();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (this.state === 'playing' && e.key === 'Escape') {
                this.pauseGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.initAudio();
            this.showCharacterSelect();
        });
        
        document.getElementById('character-fight-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('difficulty-btn').addEventListener('click', () => {
            this.cycleDifficulty();
        });
        
        document.getElementById('controls-btn').addEventListener('click', () => {
            this.showControls();
        });
        
        document.getElementById('character-back').addEventListener('click', () => {
            this.showMenu();
        });
        
        document.getElementById('controls-back').addEventListener('click', () => {
            this.showMenu();
        });
        
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.quitToMenu();
        });
        
        document.getElementById('rematch-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.quitToMenu();
        });
        
        document.getElementById('tutorial-start').addEventListener('click', () => {
            this.hideTutorial();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'h' && this.state === 'playing') {
                this.toggleControlHints();
            }
        });
        
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectCharacter(e.target.closest('.character-card').dataset.character);
            });
        });
        
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (this.audioInitialized) {
                    this.audioSystem.playSound('menu_hover');
                }
            });
        });
    }
    
    initAudio() {
        if (!this.audioInitialized) {
            this.audioInitialized = this.audioSystem.init();
            if (this.audioInitialized) {
                this.audioSystem.playBackgroundMusic();
            }
        }
    }
    
    showMenu() {
        this.hideAllScreens();
        document.getElementById('main-menu').classList.add('active');
        this.state = 'menu';
    }
    
    showCharacterSelect() {
        this.hideAllScreens();
        document.getElementById('character-select').classList.add('active');
        this.audioSystem.playSound('menu_select');
    }
    
    showControls() {
        this.hideAllScreens();
        document.getElementById('controls-screen').classList.add('active');
        this.audioSystem.playSound('menu_select');
    }
    
    hideAllScreens() {
        document.querySelectorAll('.menu-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.querySelector('.game-screen').classList.remove('active');
    }
    
    selectCharacter(character) {
        this.selectedCharacter = character;
        document.querySelectorAll('.character-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-character="${character}"]`).classList.add('selected');
        this.audioSystem.playSound('menu_select');
    }
    
    cycleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard', 'insane'];
        const currentIndex = difficulties.indexOf(this.difficulty);
        this.difficulty = difficulties[(currentIndex + 1) % difficulties.length];
        document.getElementById('difficulty-text').textContent = 
            this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
        this.audioSystem.playSound('menu_select');
    }
    
    startGame() {
        this.hideAllScreens();
        document.querySelector('.game-screen').classList.add('active');
        this.state = 'playing';
        
        const playerX = this.canvas.width * 0.25;
        const opponentX = this.canvas.width * 0.75;
        const groundY = this.canvas.height - 250;
        
        this.player = new Character(this.selectedCharacter, playerX, groundY, true);
        const opponentType = this.selectedCharacter === 'trump' ? 'elon' : 'trump';
        this.opponent = new Character(opponentType, opponentX, groundY, false);
        
        this.ai = new FighterAI(this.opponent, this.difficulty);
        this.opponent.ai = this.ai;
        
        this.updateUI();
        this.showTutorial();
        this.showAnnouncement('FIGHT!', 1500);
        this.audioSystem.playSound('round_start');
        
        this.gameStats = {
            maxCombo: 0,
            matchTime: 0,
            perfectWin: true
        };
        
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pause-menu').classList.add('active');
        }
    }
    
    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pause-menu').classList.remove('active');
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.hideAllScreens();
        document.querySelector('.game-screen').classList.add('active');
        this.round = 1;
        this.timer = 99;
        
        const playerX = this.canvas.width * 0.25;
        const opponentX = this.canvas.width * 0.75;
        const groundY = this.canvas.height - 250;
        
        this.player.reset(playerX, groundY);
        this.opponent.reset(opponentX, groundY);
        this.ai.reset();
        
        this.particles = [];
        this.effects = [];
        this.screenShake = 0;
        
        this.state = 'playing';
        this.showAnnouncement('FIGHT!', 1500);
        this.audioSystem.playSound('round_start');
        
        this.gameStats = {
            maxCombo: 0,
            matchTime: 0,
            perfectWin: true
        };
        
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    quitToMenu() {
        this.state = 'menu';
        this.showMenu();
        this.audioSystem.stopBackgroundMusic();
        this.audioSystem.playBackgroundMusic();
    }
    
    gameLoop(currentTime = 0) {
        if (this.state !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.handleInput();
        
        this.player.update(deltaTime, this.opponent, this.canvas);
        this.opponent.update(deltaTime, this.player, this.canvas);
        
        this.ai.update(deltaTime, this.player);
        
        // Process AI attacks
        this.processAIAttacks();
        
        this.updateParticles(deltaTime);
        this.updateEffects(deltaTime);
        
        if (this.screenShake > 0) {
            this.screenShake -= deltaTime;
        }
        
        this.updateTimer(deltaTime);
        this.checkWinCondition();
        this.updateUI();
        this.checkUltimateReady();
        
        if (this.player.maxCombo > this.gameStats.maxCombo) {
            this.gameStats.maxCombo = this.player.maxCombo;
        }
        if (this.opponent.maxCombo > this.gameStats.maxCombo) {
            this.gameStats.maxCombo = this.opponent.maxCombo;
        }
    }
    
    handleInput() {
        if (this.keys['a']) {
            this.player.move(-1);
        } else if (this.keys['d']) {
            this.player.move(1);
        }
        
        if (this.keys['w']) {
            this.player.jump();
        }
        
        if (this.keys['s']) {
            this.player.block(true);
        } else {
            this.player.block(false);
        }
        
        // Single key press attacks to prevent spam
        if (this.keys['j'] && !this.lastKeys['j']) {
            if (this.player.attack('punch', this.opponent)) {
                this.handleAttackEffects(this.player, 'punch');
            }
        }
        
        if (this.keys['k'] && !this.lastKeys['k']) {
            if (this.player.attack('kick', this.opponent)) {
                this.handleAttackEffects(this.player, 'kick');
            }
        }
        
        if (this.keys['l'] && !this.lastKeys['l']) {
            if (this.player.attack('special', this.opponent)) {
                this.handleAttackEffects(this.player, 'special');
            }
        }
        
        if (this.keys[' '] && !this.lastKeys[' ']) {
            if (this.player.attack('ultimate', this.opponent)) {
                this.handleAttackEffects(this.player, 'ultimate');
                this.addScreenShake(500);
            }
        }
        
        // Store previous key states
        this.lastKeys = { ...this.keys };
    }
    
    handleAttackEffects(attacker, moveType) {
        const move = attacker.moves[moveType];
        if (move.sound) {
            this.audioSystem.playSound(move.sound);
        }
        
        if (moveType === 'special' || moveType === 'ultimate') {
            this.createSpecialEffect(attacker, move.effect);
        }
        
        // Delayed hit check for melee attacks (except projectiles)
        if (!move.projectile) {
            setTimeout(() => {
                const target = attacker === this.player ? this.opponent : this.player;
                if (attacker.checkHit(target, move)) {
                    const result = attacker.dealDamage(target, move);
                    this.createHitEffect(target.x + target.width/2, target.y + target.height/2);
                    
                    if (!result.blocked) {
                        // Screen shake for successful hits
                        this.addScreenShake(200);
                        
                        // Check if target is defeated
                        if (target.health <= 0) {
                            console.log(`${target.name} defeated!`);
                            this.endRound();
                        }
                    }
                }
            }, 100); // Small delay for hit detection
        }
    }
    
    processAIAttacks() {
        // Debug: Always log what we're checking
        if (this.opponent.lastAttack) {
            console.log(`🔍 Processing AI attack - Age: ${Date.now() - this.opponent.lastAttack.timestamp}ms`);
        }
        
        // Check if AI has made an attack that needs processing
        if (this.opponent.lastAttack && this.opponent.lastAttack.timestamp > Date.now() - 500) {
            const attack = this.opponent.lastAttack;
            console.log(`⚔️ AI ATTACK DETECTED! Move: ${attack.move.name || 'punch'}, Target: ${attack.target.name}`);
            
            // Check if hit landed
            const distance = Math.abs(this.opponent.x + this.opponent.width/2 - (attack.target.x + attack.target.width/2));
            console.log(`📏 Distance check: ${distance} vs range: ${attack.move.range}`);
            
            if (this.opponent.checkHit(attack.target, attack.move)) {
                const result = this.opponent.dealDamage(attack.target, attack.move);
                this.createHitEffect(attack.target.x + attack.target.width/2, attack.target.y + attack.target.height/2);
                
                console.log(`🤖 AI HIT! Damage: ${result.damage}, Player health: ${attack.target.health}/${attack.target.maxHealth}`);
                
                if (!result.blocked) {
                    // Screen shake for AI hits
                    this.addScreenShake(300);
                    
                    // Check if player is defeated
                    if (attack.target.health <= 0) {
                        console.log(`💀 Player defeated by AI!`);
                        this.endRound();
                    }
                } else {
                    console.log(`🛡️ Player blocked AI attack!`);
                }
            } else {
                console.log(`❌ AI attack missed - distance: ${distance}, range: ${attack.move.range}`);
            }
            
            // Clear the attack after processing
            this.opponent.lastAttack = null;
            console.log(`🗑️ Cleared AI attack`);
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * 10;
            const shakeY = (Math.random() - 0.5) * 10;
            this.ctx.translate(shakeX, shakeY);
        }
        
        this.renderBackground();
        this.renderCharacter(this.player);
        this.renderCharacter(this.opponent);
        this.renderProjectiles();
        this.renderParticles();
        this.renderEffects();
        
        this.ctx.restore();
        
        this.renderComboCounter();
    }
    
    renderBackground() {
        if (this.backgroundLoaded && this.backgroundImage.complete) {
            // Draw background image scaled to fit canvas
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback to default gradient background
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.6, '#87CEEB');
            gradient.addColorStop(0.6, '#228B22');
            gradient.addColorStop(1, '#1a5f1a');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Always draw ground platform regardless of background
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);
    }
    
    renderCharacter(character) {
        this.ctx.save();
        
        if (!character.facingRight) {
            this.ctx.translate(character.x + character.width, character.y);
            this.ctx.scale(-1, 1);
            this.ctx.translate(-character.x, -character.y);
        }
        
        // Try to draw sprite if available, otherwise use colored rectangle
        if (character.imageLoaded) {
            const spriteImage = character.getCurrentSpriteImage();
            if (spriteImage && spriteImage.complete) {
                this.ctx.drawImage(
                    spriteImage,
                    character.x, character.y, character.width, character.height
                );
            } else {
                // Fallback to colored rectangle
                this.ctx.fillStyle = character.color;
                this.ctx.fillRect(character.x, character.y, character.width, character.height);
                
                // Draw simple head
                this.ctx.fillStyle = character.type === 'trump' ? '#ffd700' : '#333';
                this.ctx.fillRect(character.x + 10, character.y - 20, character.width - 20, 20);
            }
        } else {
            // Fallback to colored rectangle
            this.ctx.fillStyle = character.color;
            this.ctx.fillRect(character.x, character.y, character.width, character.height);
            
            // Draw simple head
            this.ctx.fillStyle = character.type === 'trump' ? '#ffd700' : '#333';
            this.ctx.fillRect(character.x + 10, character.y - 20, character.width - 20, 20);
        }
        
        // Removed visible blocking effects
        
        // Removed red damage overlay and white invulnerability flashing
        
        this.ctx.restore();
    }
    
    renderProjectiles() {
        [...this.player.projectiles, ...this.opponent.projectiles].forEach(proj => {
            this.ctx.fillStyle = proj.effect === 'rocket_punch' ? '#ff4500' : '#4169e1';
            this.ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
            
            for (let i = 0; i < 3; i++) {
                this.createParticle(
                    proj.x + Math.random() * proj.width,
                    proj.y + Math.random() * proj.height,
                    proj.effect === 'rocket_punch' ? '#ff6347' : '#1e90ff'
                );
            }
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            this.ctx.globalAlpha = 1;
        });
    }
    
    renderEffects() {
        this.effects.forEach(effect => {
            this.ctx.save();
            
            if (effect.type === 'hit') {
                this.ctx.strokeStyle = effect.color;
                this.ctx.lineWidth = 3;
                this.ctx.globalAlpha = effect.alpha;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }
    
    renderComboCounter() {
        const combo = Math.max(this.player.currentCombo, this.opponent.currentCombo);
        if (combo >= 3) {
            const comboElement = document.getElementById('combo-counter');
            const comboNumber = comboElement.querySelector('.combo-number');
            comboNumber.textContent = combo;
            comboElement.classList.add('active');
            
            setTimeout(() => {
                comboElement.classList.remove('active');
            }, 1000);
        }
    }
    
    updateUI() {
        // Update health bars with smooth transitions
        const p1HealthPercent = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
        const p2HealthPercent = Math.max(0, (this.opponent.health / this.opponent.maxHealth) * 100);
        
        document.getElementById('p1-health').style.width = `${p1HealthPercent}%`;
        document.getElementById('p2-health').style.width = `${p2HealthPercent}%`;
        
        // Change health bar color when low
        const p1HealthBar = document.getElementById('p1-health');
        const p2HealthBar = document.getElementById('p2-health');
        
        if (p1HealthPercent < 25) {
            p1HealthBar.style.backgroundColor = '#ff4444';
        } else if (p1HealthPercent < 50) {
            p1HealthBar.style.backgroundColor = '#ffaa00';
        } else {
            p1HealthBar.style.backgroundColor = '#4CAF50';
        }
        
        if (p2HealthPercent < 25) {
            p2HealthBar.style.backgroundColor = '#ff4444';
        } else if (p2HealthPercent < 50) {
            p2HealthBar.style.backgroundColor = '#ffaa00';
        } else {
            p2HealthBar.style.backgroundColor = '#4CAF50';
        }
        
        // Update special bars
        const p1SpecialPercent = (this.player.specialEnergy / this.player.maxSpecialEnergy) * 100;
        const p2SpecialPercent = (this.opponent.specialEnergy / this.opponent.maxSpecialEnergy) * 100;
        
        document.getElementById('p1-special').style.width = `${p1SpecialPercent}%`;
        document.getElementById('p2-special').style.width = `${p2SpecialPercent}%`;
        
        document.getElementById('p1-name').textContent = this.player.name.toUpperCase();
        document.getElementById('p2-name').textContent = this.opponent.name.toUpperCase();
        
        document.getElementById('round-number').textContent = this.round;
        document.getElementById('game-timer').textContent = Math.ceil(this.timer);
    }
    
    updateTimer(deltaTime) {
        this.gameStats.matchTime += deltaTime;
        this.timer -= deltaTime / 1000;
        
        if (this.timer <= 0) {
            this.timer = 0;
            this.endRound();
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.5;
            particle.alpha -= deltaTime / 1000;
            particle.size *= 0.98;
            
            if (particle.alpha <= 0 || particle.size < 0.5) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateEffects(deltaTime) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.radius += effect.growth;
            effect.alpha -= deltaTime / 500;
            
            if (effect.alpha <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }
    
    createParticle(x, y, color) {
        this.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * -5 - 2,
            size: Math.random() * 10 + 5,
            color,
            alpha: 1
        });
    }
    
    createHitEffect(x, y) {
        this.effects.push({
            type: 'hit',
            x,
            y,
            radius: 10,
            growth: 5,
            color: '#ffd93d',
            alpha: 1
        });
        
        // Create more dramatic particle effects
        for (let i = 0; i < 15; i++) {
            this.createParticle(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30, '#ffd93d');
        }
        
        // Add impact particles
        for (let i = 0; i < 8; i++) {
            this.createParticle(x, y, '#ff6b6b');
        }
        
        this.audioSystem.playHitSound(10);
    }
    
    createSpecialEffect(character, effectType) {
        const x = character.x + character.width / 2;
        const y = character.y + character.height / 2;
        
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 10;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 15,
                color: effectType.includes('trump') ? '#ff6b6b' : '#667eea',
                alpha: 1
            });
        }
    }
    
    addScreenShake(duration) {
        this.screenShake = duration;
        document.getElementById('game-container').classList.add('screen-shake');
        setTimeout(() => {
            document.getElementById('game-container').classList.remove('screen-shake');
        }, duration);
    }
    
    showAnnouncement(text, duration) {
        const announcement = document.getElementById('announcement-text');
        announcement.textContent = text;
        announcement.classList.add('active');
        
        setTimeout(() => {
            announcement.classList.remove('active');
        }, duration);
    }
    
    checkWinCondition() {
        if (this.player.health <= 0 || this.opponent.health <= 0 || this.timer <= 0) {
            console.log(`Win condition met: Player HP: ${this.player.health}, Opponent HP: ${this.opponent.health}, Timer: ${this.timer}`);
            this.endRound();
        }
    }
    
    endRound() {
        this.state = 'round-end';
        
        const winner = this.player.health > this.opponent.health ? this.player : this.opponent;
        const loser = winner === this.player ? this.opponent : this.player;
        
        if (winner === this.player && this.player.health === this.player.maxHealth) {
            this.gameStats.perfectWin = true;
        } else {
            this.gameStats.perfectWin = false;
        }
        
        this.showGameOver(winner);
        this.audioSystem.playSound(winner === this.player ? 'victory' : 'defeat');
    }
    
    showGameOver(winner) {
        this.hideAllScreens();
        document.getElementById('game-over').classList.add('active');
        
        document.getElementById('winner-text').textContent = 
            winner === this.player ? 'VICTORY!' : 'DEFEAT!';
        document.getElementById('winner-name').textContent = winner.name.toUpperCase();
        
        const minutes = Math.floor(this.gameStats.matchTime / 60000);
        const seconds = Math.floor((this.gameStats.matchTime % 60000) / 1000);
        document.getElementById('match-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('max-combo').textContent = this.gameStats.maxCombo;
        document.getElementById('perfect-win').textContent = this.gameStats.perfectWin ? 'YES' : 'NO';
    }
    
    showTutorial() {
        document.getElementById('tutorial-overlay').style.display = 'flex';
        this.state = 'tutorial';
    }
    
    hideTutorial() {
        document.getElementById('tutorial-overlay').style.display = 'none';
        this.state = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    toggleControlHints() {
        const hints = document.getElementById('control-hints');
        if (hints.style.display === 'none') {
            hints.style.display = 'block';
        } else {
            hints.style.display = 'none';
        }
    }
    
    checkUltimateReady() {
        const ultimateNotification = document.getElementById('ultimate-ready');
        
        // Show notification when ultimate is ready
        if (this.player.specialEnergy >= 80 && !this.ultimateNotificationShown) {
            ultimateNotification.classList.add('active');
            this.ultimateNotificationShown = true;
            
            // Hide after 3 seconds
            setTimeout(() => {
                ultimateNotification.classList.remove('active');
            }, 3000);
        }
        
        // Reset flag when energy drops below ultimate cost
        if (this.player.specialEnergy < 80) {
            this.ultimateNotificationShown = false;
        }
    }
}

const game = new Game();