const Characters = {
    trump: {
        name: "Donald Trump",
        health: 200,
        maxHealth: 200,
        specialEnergy: 0,
        maxSpecialEnergy: 100,
        speed: 3,
        jumpPower: 15,
        weight: 1.2,
        width: 200,
        height: 300,
        color: "#ff6b6b",
        imageSrc: "trump.png", // User will need to add this image
        
        moves: {
            punch: {
                damage: 8,
                range: 120,
                cooldown: 300,
                knockback: 5,
                specialGain: 5,
                animation: "punch",
                sound: "punch_heavy"
            },
            kick: {
                damage: 10,
                range: 140,
                cooldown: 400,
                knockback: 8,
                specialGain: 7,
                animation: "kick",
                sound: "kick_heavy"
            },
            special: {
                name: "Executive Order",
                damage: 15,
                range: 180,
                cooldown: 1000,
                knockback: 12,
                specialCost: 30,
                animation: "special",
                sound: "special_trump",
                effect: "executive_order"
            },
            ultimate: {
                name: "Big League Slam",
                damage: 35,
                range: 200,
                cooldown: 3000,
                knockback: 20,
                specialCost: 80,
                animation: "ultimate",
                sound: "ultimate_trump",
                effect: "big_league_slam"
            },
            block: {
                damageReduction: 0.8,
                specialGain: 2,
                animation: "block"
            }
        },
        
        combos: {
            "punch,punch,kick": {
                name: "Twitter Storm",
                damage: 25,
                specialGain: 15,
                effect: "twitter_storm"
            },
            "kick,punch,special": {
                name: "Wall Combo",
                damage: 30,
                specialGain: 20,
                effect: "wall_combo"
            }
        },
        
        voiceLines: {
            intro: ["You're fired!", "Let's make this fight great again!", "Nobody fights better than me!"],
            win: ["I won bigly!", "That was tremendous!", "Another victory for Trump!"],
            lose: ["This is fake news!", "The fight was rigged!", "I demand a rematch!"],
            taunt: ["Sad!", "Wrong!", "You're a loser!"],
            hurt: ["Ow!", "Not fair!", "Stop it!"],
            special: ["Executive order!", "You're fired!", "Big league move!"],
            ultimate: ["This is huge!", "Nobody beats Trump!", "Make fighting great again!"]
        }
    },
    
    elon: {
        name: "Elon Musk",
        health: 200,
        maxHealth: 200,
        specialEnergy: 0,
        maxSpecialEnergy: 100,
        speed: 5,
        jumpPower: 18,
        weight: 0.9,
        width: 180,
        height: 300,
        color: "#667eea",
        imageSrc: "elon.png", // User will need to add this image
        
        moves: {
            punch: {
                damage: 6,
                range: 110,
                cooldown: 200,
                knockback: 4,
                specialGain: 6,
                animation: "punch",
                sound: "punch_light"
            },
            kick: {
                damage: 8,
                range: 130,
                cooldown: 300,
                knockback: 6,
                specialGain: 8,
                animation: "kick",
                sound: "kick_light"
            },
            special: {
                name: "Rocket Punch",
                damage: 12,
                range: 250,
                cooldown: 800,
                knockback: 10,
                specialCost: 25,
                animation: "special",
                sound: "special_elon",
                effect: "rocket_punch",
                projectile: true
            },
            ultimate: {
                name: "Mars Strike",
                damage: 30,
                range: 300,
                cooldown: 3000,
                knockback: 25,
                specialCost: 80,
                animation: "ultimate",
                sound: "ultimate_elon",
                effect: "mars_strike"
            },
            block: {
                damageReduction: 0.7,
                specialGain: 3,
                animation: "block"
            }
        },
        
        combos: {
            "punch,punch,punch,kick": {
                name: "Tesla Coil",
                damage: 20,
                specialGain: 18,
                effect: "tesla_coil"
            },
            "kick,kick,special": {
                name: "Hyperloop Dash",
                damage: 28,
                specialGain: 25,
                effect: "hyperloop_dash"
            }
        },
        
        abilities: {
            doubleJump: true,
            dashSpeed: 8
        },
        
        voiceLines: {
            intro: ["Let's go to Mars!", "Innovation time!", "Physics don't lie!"],
            win: ["Mission accomplished!", "That's how we do it at SpaceX!", "Another successful launch!"],
            lose: ["Need to iterate...", "Back to the drawing board!", "Failure is an option here"],
            taunt: ["How's that for innovation?", "You need an upgrade!", "Outdated tech!"],
            hurt: ["Systems damaged!", "Hull breach!", "Malfunction!"],
            special: ["Rocket punch!", "Full thrust!", "Engaging boosters!"],
            ultimate: ["To Mars and beyond!", "Maximum acceleration!", "Orbital strike incoming!"]
        }
    }
};

class Character {
    constructor(type, x, y, isPlayer = true) {
        const charData = Characters[type];
        Object.assign(this, JSON.parse(JSON.stringify(charData)));
        
        this.type = type;
        this.x = x;
        this.y = y;
        this.isPlayer = isPlayer;
        
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.isBlocking = false;
        this.isCrouching = false;
        this.facingRight = true;
        this.isAttacking = false;
        this.isDamaged = false;
        this.isInvulnerable = false;
        
        this.currentAnimation = "idle";
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.damageTimer = 0;
        this.invulnerableTimer = 0;
        this.lastAttack = null;
        
        this.cooldowns = {};
        this.comboBuffer = [];
        this.comboTimer = 0;
        this.currentCombo = 0;
        this.maxCombo = 0;
        
        this.doubleJumpUsed = false;
        this.dashCooldown = 0;
        
        // Victory/Defeat animation states
        this.isVictorious = false;
        this.isDefeated = false;
        this.victoryAnimationTimer = 0;
        this.defeatAnimationTimer = 0;
        
        this.ai = null;
        this.projectiles = [];
        
        // Load character sprites
        this.image = null;
        this.imageLoaded = false;
        this.loadImage();
    }
    
    loadImage() {
        // Define individual sprite files
        this.sprites = {
            idle: { file: `${this.type}_idle.png` },
            walk: { file: `${this.type}_walk.png` },
            jump: { file: `${this.type}_idle.png` }, // Use idle for jump
            punch: { file: `${this.type}_punch.png` },
            kick: { file: `${this.type}_kick.png` },
            block: { file: `${this.type}_block.png` },
            hurt: { file: `${this.type}_hurt.png` },
            special: { file: `${this.type}_punch.png` }, // Use punch for special
            ultimate: { file: `${this.type}_kick.png` }, // Use kick for ultimate
            win: { file: `${this.type}_idle.png` }, // Use idle for win
            defeat: { file: `${this.type}_hurt.png` } // Use hurt for defeat
        };
        
        // Load all individual sprite images
        this.spriteImages = {};
        this.loadedSprites = 0;
        this.totalSprites = 6; // Only count the unique files we actually have
        
        // List of actual sprite files to load
        const spritesToLoad = [
            `${this.type}_idle.png`,
            `${this.type}_walk.png`, 
            `${this.type}_punch.png`,
            `${this.type}_kick.png`,
            `${this.type}_block.png`,
            `${this.type}_hurt.png`
        ];
        
        spritesToLoad.forEach(fileName => {
            this.spriteImages[fileName] = new Image();
            this.spriteImages[fileName].onload = () => {
                this.loadedSprites++;
                console.log(`Loaded ${fileName} for ${this.type} (${this.loadedSprites}/${this.totalSprites})`);
                if (this.loadedSprites >= this.totalSprites) {
                    this.imageLoaded = true;
                    console.log(`✅ All sprites loaded for ${this.type}`);
                }
            };
            this.spriteImages[fileName].onerror = () => {
                console.warn(`❌ Failed to load sprite: ${fileName} for ${this.type}`);
                this.loadedSprites++; // Still count to prevent hanging
                if (this.loadedSprites >= this.totalSprites) {
                    this.imageLoaded = true;
                    console.log(`⚠️ Sprite loading completed for ${this.type} (with errors)`);
                }
            };
            this.spriteImages[fileName].src = `sprites/${this.type}/${fileName}`;
            console.log(`Loading: sprites/${this.type}/${fileName}`);
        });
    }
    
    update(deltaTime, opponent, canvas) {
        // Handle victory/defeat animations first
        if (this.isVictorious) {
            this.victoryAnimationTimer += deltaTime;
            // Add some celebration bouncing
            if (this.victoryAnimationTimer % 1000 < 500) {
                this.y -= Math.sin(this.victoryAnimationTimer * 0.01) * 2;
            }
            return; // Skip normal physics when celebrating
        }
        
        if (this.isDefeated) {
            this.defeatAnimationTimer += deltaTime;
            // Character falls down gradually
            if (this.defeatAnimationTimer < 2000) {
                this.velocityY += 0.5;
                this.y += this.velocityY;
                if (this.y + this.height >= canvas.height - 100) {
                    this.y = canvas.height - 100 - this.height;
                    this.velocityY = 0;
                }
            }
            return; // Skip normal physics when defeated
        }
        
        // Simple animation timer (not needed for single frames but kept for consistency)
        this.animationTimer += deltaTime;
        if (this.animationTimer > 100) {
            this.animationTimer = 0;
            this.animationFrame = 0; // Always frame 0 for single frame sprites
        }
        
        this.velocityY += 0.8 * this.weight;
        
        if (this.dashCooldown > 0) {
            this.dashCooldown -= deltaTime;
        }
        
        if (!this.isDamaged && !this.isAttacking) {
            this.x += this.velocityX;
        }
        this.y += this.velocityY;
        
        if (this.y + this.height >= canvas.height - 100) {
            this.y = canvas.height - 100 - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
            this.doubleJumpUsed = false;
        }
        
        this.x = Math.max(0, Math.min(this.x, canvas.width - this.width));
        
        if (this.isGrounded && !this.isAttacking && !this.isDamaged) {
            this.velocityX *= 0.8;
        }
        
        for (let move in this.cooldowns) {
            if (this.cooldowns[move] > 0) {
                this.cooldowns[move] -= deltaTime;
            }
        }
        
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.comboBuffer = [];
                this.currentCombo = 0;
            }
        }
        
        if (this.isDamaged) {
            this.damageTimer += deltaTime;
            if (this.damageTimer > 300) {
                this.isDamaged = false;
                this.damageTimer = 0;
                this.currentAnimation = "idle";
            }
        }
        
        if (this.isInvulnerable) {
            this.invulnerableTimer += deltaTime;
            if (this.invulnerableTimer > 500) {
                this.isInvulnerable = false;
                this.invulnerableTimer = 0;
            }
        }
        
        this.updateProjectiles(deltaTime, opponent);
        
        if (opponent) {
            this.facingRight = this.x < opponent.x;
        }
    }
    
    move(direction) {
        if (this.isDamaged || this.isAttacking) return;
        
        const moveSpeed = this.isGrounded ? this.speed : this.speed * 0.8;
        this.velocityX = direction * moveSpeed;
        
        if (this.isGrounded) {
            this.currentAnimation = "walk";
        }
    }
    
    jump() {
        if (this.isDamaged) return;
        
        if (this.isGrounded) {
            this.velocityY = -this.jumpPower;
            this.isGrounded = false;
            this.currentAnimation = "jump";
            return true;
        } else if (this.abilities && this.abilities.doubleJump && !this.doubleJumpUsed) {
            this.velocityY = -this.jumpPower * 0.8;
            this.doubleJumpUsed = true;
            return true;
        }
        return false;
    }
    
    attack(moveType, opponent) {
        if (this.isDamaged || this.isAttacking || this.cooldowns[moveType] > 0) {
            return false;
        }
        
        const move = this.moves[moveType];
        if (!move) return false;
        
        if (move.specialCost && this.specialEnergy < move.specialCost) {
            return false;
        }
        
        this.isAttacking = true;
        this.currentAnimation = move.animation;
        this.cooldowns[moveType] = move.cooldown;
        
        if (move.specialCost) {
            this.specialEnergy -= move.specialCost;
        }
        
        this.comboBuffer.push(moveType);
        this.comboTimer = 500;
        
        if (move.projectile) {
            this.createProjectile(move, opponent);
        } else {
            // Store attack info for game to process
            this.lastAttack = {
                move: move,
                target: opponent,
                timestamp: Date.now()
            };
            
            // console.log(`${this.name} attacking with ${moveType}! Attack stored.`);
            
            // Immediate hit check for melee attacks
            setTimeout(() => {
                this.isAttacking = false;
            }, 300);
        }
        
        return true;
    }
    
    block(isBlocking) {
        if (this.isDamaged || this.isAttacking) return;
        
        this.isBlocking = isBlocking;
        if (isBlocking) {
            this.currentAnimation = "block";
            this.velocityX = 0;
        } else {
            this.currentAnimation = "idle";
        }
    }
    
    dash(direction) {
        if (!this.abilities || !this.abilities.dashSpeed) return false;
        if (this.dashCooldown > 0 || this.isDamaged || this.isAttacking) return false;
        
        this.velocityX = direction * this.abilities.dashSpeed;
        this.dashCooldown = 500;
        return true;
    }
    
    checkHit(opponent, move) {
        if (!opponent || opponent.isInvulnerable) return false;
        
        // More precise hit detection
        const attackerCenterX = this.x + this.width/2;
        const opponentCenterX = opponent.x + opponent.width/2;
        const distance = Math.abs(attackerCenterX - opponentCenterX);
        
        // Check if opponent is in front of attacker
        const inFront = this.facingRight ? (opponentCenterX > attackerCenterX) : (opponentCenterX < attackerCenterX);
        
        // Check vertical alignment (simple check)
        const verticalOverlap = !(this.y + this.height < opponent.y || opponent.y + opponent.height < this.y);
        
        return distance <= move.range && inFront && verticalOverlap;
    }
    
    dealDamage(opponent, move) {
        let damage = move.damage;
        let wasBlocked = false;
        
        if (opponent.isBlocking) {
            damage *= (1 - opponent.moves.block.damageReduction);
            opponent.specialEnergy = Math.min(opponent.maxSpecialEnergy, 
                opponent.specialEnergy + opponent.moves.block.specialGain);
            wasBlocked = true;
            console.log(`Attack blocked! Reduced damage: ${damage}`);
        }
        
        // Apply damage
        opponent.takeDamage(damage, move.knockback, this.facingRight);
        
        // Gain special energy for successful hit
        this.specialEnergy = Math.min(this.maxSpecialEnergy, this.specialEnergy + move.specialGain);
        
        // Update combo only for unblocked hits
        if (!wasBlocked) {
            this.currentCombo++;
            if (this.currentCombo > this.maxCombo) {
                this.maxCombo = this.currentCombo;
            }
        } else {
            this.currentCombo = 0; // Reset combo on blocked attack
        }
        
        this.checkCombos();
        
        console.log(`Damage dealt: ${damage}, Target health: ${opponent.health}`);
        return { blocked: wasBlocked, damage, targetHealth: opponent.health };
    }
    
    takeDamage(damage, knockback, fromRight) {
        if (this.isInvulnerable) return;
        
        // Apply damage
        const oldHealth = this.health;
        this.health = Math.max(0, this.health - damage);
        
        console.log(`${this.name} took ${damage} damage. Health: ${oldHealth} -> ${this.health}`);
        
        // Set damage state
        this.isDamaged = true;
        this.isAttacking = false;
        this.isBlocking = false;
        this.currentAnimation = "hurt";
        this.damageTimer = 0;
        
        // Apply knockback
        this.velocityX = (fromRight ? -1 : 1) * knockback;
        this.velocityY = -5;
        
        // Reset combo
        this.currentCombo = 0;
        
        // Brief invulnerability after taking damage
        this.isInvulnerable = true;
        this.invulnerableTimer = 0;
    }
    
    checkCombos() {
        const comboString = this.comboBuffer.join(",");
        
        for (let combo in this.combos) {
            if (comboString.endsWith(combo)) {
                const comboData = this.combos[combo];
                this.specialEnergy = Math.min(this.maxSpecialEnergy, 
                    this.specialEnergy + comboData.specialGain);
                return comboData;
            }
        }
        return null;
    }
    
    createProjectile(move, opponent) {
        const projectile = {
            x: this.x + (this.facingRight ? this.width : 0),
            y: this.y + this.height / 2,
            velocityX: (this.facingRight ? 1 : -1) * 10,
            width: 30,
            height: 20,
            damage: move.damage,
            knockback: move.knockback,
            active: true,
            effect: move.effect
        };
        
        this.projectiles.push(projectile);
        
        setTimeout(() => {
            this.isAttacking = false;
        }, 300);
    }
    
    updateProjectiles(deltaTime, opponent) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += proj.velocityX;
            
            if (proj.x < -50 || proj.x > 2000) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            if (opponent && proj.active) {
                const hit = proj.x < opponent.x + opponent.width &&
                           proj.x + proj.width > opponent.x &&
                           proj.y < opponent.y + opponent.height &&
                           proj.y + proj.height > opponent.y;
                
                if (hit) {
                    if (!opponent.isBlocking) {
                        opponent.takeDamage(proj.damage, proj.knockback, proj.velocityX > 0);
                    }
                    proj.active = false;
                    this.projectiles.splice(i, 1);
                }
            }
        }
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.health = this.maxHealth;
        this.specialEnergy = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.isBlocking = false;
        this.isAttacking = false;
        this.isDamaged = false;
        this.isInvulnerable = false;
        this.currentAnimation = "idle";
        this.cooldowns = {};
        this.comboBuffer = [];
        this.currentCombo = 0;
        this.projectiles = [];
        this.isVictorious = false;
        this.isDefeated = false;
        this.victoryAnimationTimer = 0;
        this.defeatAnimationTimer = 0;
    }
    
    playVictoryAnimation() {
        this.isVictorious = true;
        this.isDefeated = false;
        this.currentAnimation = "win";
        this.victoryAnimationTimer = 0;
        this.isAttacking = false;
        this.isDamaged = false;
        this.velocityX = 0;
        this.velocityY = 0;
    }
    
    playDefeatAnimation() {
        this.isDefeated = true;
        this.isVictorious = false;
        this.currentAnimation = "defeat";
        this.defeatAnimationTimer = 0;
        this.isAttacking = false;
        this.isDamaged = false;
        this.velocityX = 0;
        this.velocityY = 0;
    }
    
    getCurrentFrameCount() {
        return 1; // All sprites are single frame now
    }
    
    getCurrentSpriteImage() {
        if (!this.imageLoaded || !this.sprites || !this.sprites[this.currentAnimation]) {
            return null;
        }
        
        const spriteData = this.sprites[this.currentAnimation];
        const fileName = spriteData.file;
        
        return this.spriteImages[fileName] || null;
    }
}

// Expose Character class globally
window.Character = Character;