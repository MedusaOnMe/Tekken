class FighterAI {
    constructor(character, difficulty = 'medium') {
        this.character = character;
        this.difficulty = difficulty;
        this.opponent = null;
        
        this.reactionTime = this.getReactionTime();
        this.aggressiveness = this.getAggressiveness();
        this.defensiveness = this.getDefensiveness();
        this.comboChance = this.getComboChance();
        this.adaptationRate = this.getAdaptationRate();
        this.predictionAccuracy = this.getPredictionAccuracy();
        
        this.lastAction = null;
        this.actionTimer = 0;
        this.decisionTimer = 0;
        this.currentStrategy = 'neutral';
        this.patternMemory = [];
        this.dodgeTimer = 0;
        this.adaptiveMemory = [];
        this.playerPatterns = {
            attackFrequency: 0,
            favoriteAttacks: {},
            movementStyle: 'balanced',
            reactionTime: 300
        };
        this.anticipatedAction = null;
        this.feintChance = 0.1;
        this.pressureLevel = 0;
        
        this.behaviors = {
            aggressive: this.aggressiveBehavior.bind(this),
            defensive: this.defensiveBehavior.bind(this),
            balanced: this.balancedBehavior.bind(this),
            combo: this.comboBehavior.bind(this),
            special: this.specialBehavior.bind(this),
            counter: this.counterBehavior.bind(this),
            intercept: this.interceptBehavior.bind(this),
            pressure: this.pressureBehavior.bind(this)
        };
    }
    
    getReactionTime() {
        const times = {
            easy: 300,
            medium: 200,
            hard: 100,
            insane: 50
        };
        return times[this.difficulty] || 200;
    }
    
    getAggressiveness() {
        const levels = {
            easy: 0.4,
            medium: 0.6,
            hard: 0.8,
            insane: 0.95
        };
        return levels[this.difficulty] || 0.6;
    }
    
    getDefensiveness() {
        const levels = {
            easy: 0.2,
            medium: 0.4,
            hard: 0.6,
            insane: 0.8
        };
        return levels[this.difficulty] || 0.4;
    }
    
    getComboChance() {
        const chances = {
            easy: 0.1,
            medium: 0.3,
            hard: 0.5,
            insane: 0.8
        };
        return chances[this.difficulty] || 0.3;
    }
    
    getAdaptationRate() {
        const rates = {
            easy: 0.02,
            medium: 0.05,
            hard: 0.1,
            insane: 0.2
        };
        return rates[this.difficulty] || 0.05;
    }
    
    getPredictionAccuracy() {
        const accuracy = {
            easy: 0.3,
            medium: 0.5,
            hard: 0.7,
            insane: 0.9
        };
        return accuracy[this.difficulty] || 0.5;
    }
    
    update(deltaTime, opponent) {
        this.opponent = opponent;
        
        this.actionTimer -= deltaTime;
        this.decisionTimer -= deltaTime;
        this.dodgeTimer -= deltaTime;
        
        if (this.decisionTimer <= 0) {
            this.analyzeOpponent();
            this.adaptToPlayer();
            this.predictPlayerAction();
            this.chooseStrategy();
            this.decisionTimer = this.reactionTime + Math.random() * 200;
        }
        
        if (this.actionTimer <= 0) {
            this.executeAction();
            this.actionTimer = this.reactionTime * 0.5; // Much faster action rate
        }
        
        if (this.character.health < 30 && this.character.specialEnergy >= 100) {
            this.currentStrategy = 'special';
        }
    }
    
    analyzeOpponent() {
        if (!this.opponent) return;
        
        const distance = Math.abs(this.character.x - this.opponent.x);
        const healthRatio = this.character.health / this.character.maxHealth;
        const opponentHealthRatio = this.opponent.health / this.opponent.maxHealth;
        
        this.patternMemory.push({
            distance,
            opponentAttacking: this.opponent.isAttacking,
            opponentBlocking: this.opponent.isBlocking,
            opponentMoving: this.opponent.velocityX !== 0,
            opponentHealth: this.opponent.health,
            timestamp: Date.now()
        });
        
        // Track player attack patterns
        if (this.opponent.isAttacking) {
            this.playerPatterns.attackFrequency++;
            const lastMove = this.opponent.lastMove || 'unknown';
            this.playerPatterns.favoriteAttacks[lastMove] = 
                (this.playerPatterns.favoriteAttacks[lastMove] || 0) + 1;
        }
        
        if (this.patternMemory.length > 10) {
            this.patternMemory.shift();
        }
        
        const recentAttacks = this.patternMemory.filter(p => p.opponentAttacking).length;
        const recentBlocks = this.patternMemory.filter(p => p.opponentBlocking).length;
        
        this.opponentTendency = {
            aggressive: recentAttacks > 6,
            defensive: recentBlocks > 4,
            distance: distance
        };
    }
    
    adaptToPlayer() {
        // Analyze recent patterns and adapt behavior
        const recentActions = this.patternMemory.slice(-5);
        
        // Detect if player is aggressive or defensive
        const aggressiveActions = recentActions.filter(p => p.opponentAttacking).length;
        const defensiveActions = recentActions.filter(p => p.opponentBlocking).length;
        
        if (aggressiveActions > 3) {
            this.defensiveness = Math.min(1, this.defensiveness + this.adaptationRate);
            this.aggressiveness = Math.max(0, this.aggressiveness - this.adaptationRate);
        } else if (defensiveActions > 3) {
            this.aggressiveness = Math.min(1, this.aggressiveness + this.adaptationRate);
            this.feintChance = Math.min(0.5, this.feintChance + this.adaptationRate);
        }
        
        // Adapt to player's favorite attacks
        const favoriteAttack = Object.keys(this.playerPatterns.favoriteAttacks)
            .reduce((a, b) => this.playerPatterns.favoriteAttacks[a] > this.playerPatterns.favoriteAttacks[b] ? a : b, 'punch');
        
        if (favoriteAttack === 'punch') {
            this.anticipatedAction = 'punch';
        } else if (favoriteAttack === 'kick') {
            this.anticipatedAction = 'kick';
        }
    }
    
    predictPlayerAction() {
        if (Math.random() < this.predictionAccuracy) {
            const distance = Math.abs(this.character.x - this.opponent.x);
            
            // Predict based on distance and player patterns
            if (distance < 120 && this.playerPatterns.attackFrequency > 5) {
                this.anticipatedAction = this.getMostLikelyAttack();
            } else if (distance > 200 && this.opponent.velocityX !== 0) {
                this.anticipatedAction = 'approach';
            }
        }
    }
    
    getMostLikelyAttack() {
        const attacks = this.playerPatterns.favoriteAttacks;
        return Object.keys(attacks).reduce((a, b) => attacks[a] > attacks[b] ? a : b, 'punch');
    }
    
    chooseStrategy() {
        const distance = Math.abs(this.character.x - this.opponent.x);
        const healthAdvantage = this.character.health - this.opponent.health;
        
        if (distance < 150 && Math.random() < this.comboChance) {
            this.currentStrategy = 'combo';
        } else if (this.character.specialEnergy >= 30 && Math.random() < 0.3) {
            this.currentStrategy = 'special';
        } else if (healthAdvantage > 20) {
            this.currentStrategy = 'aggressive';
        } else if (healthAdvantage < -20) {
            this.currentStrategy = 'defensive';
        } else {
            this.currentStrategy = 'balanced';
        }
        
        // Force aggressive behavior much more often
        if (distance < 200 && Math.random() < 0.9) {
            this.currentStrategy = 'aggressive';
        }
        
        // Enhanced strategy selection based on predictions
        if (this.anticipatedAction === 'approach' && distance > 150) {
            this.currentStrategy = 'aggressive'; // Changed from intercept to aggressive
        } else if (this.anticipatedAction && this.anticipatedAction !== 'approach') {
            this.currentStrategy = 'aggressive'; // Changed from counter to aggressive
        }
        
        // Almost never be defensive - AI should attack constantly
        if (this.opponentTendency && this.opponentTendency.aggressive && 
            Math.random() < this.defensiveness * 0.1) {
            this.currentStrategy = 'defensive';
        }
        
        // Add pressure strategy when opponent is low on health
        if (this.opponent.health < 50) {
            this.pressureLevel = Math.min(1, this.pressureLevel + 0.1);
            if (Math.random() < this.pressureLevel) {
                this.currentStrategy = 'pressure';
            }
        }
    }
    
    executeAction() {
        const behavior = this.behaviors[this.currentStrategy];
        if (behavior) {
            behavior();
        } else {
            this.balancedBehavior();
        }
    }
    
    aggressiveBehavior() {
        const distance = Math.abs(this.character.x - this.opponent.x);
        
        if (distance > 200) {
            this.moveTowardsOpponent();
            if (Math.random() < 0.4) {
                this.character.jump();
            }
        } else if (distance < 150) {
            // Much more likely to attack when in range
            const attackRoll = Math.random();
            if (attackRoll < 0.7) {
                this.character.attack('punch', this.opponent);
            } else if (attackRoll < 0.9) {
                this.character.attack('kick', this.opponent);
            } else if (this.character.specialEnergy >= 30) {
                this.character.attack('special', this.opponent);
            }
        } else {
            this.moveTowardsOpponent();
        }
    }
    
    defensiveBehavior() {
        const distance = Math.abs(this.character.x - this.opponent.x);
        
        // Even in defensive mode, attack more often
        if (distance < 120) {
            if (Math.random() < 0.7) {
                const attackType = Math.random() < 0.6 ? 'punch' : 'kick';
                this.character.attack(attackType, this.opponent);
            } else {
                this.moveAwayFromOpponent();
            }
        } else if (distance > 200) {
            this.moveTowardsOpponent();
        } else {
            // Mostly attack, rarely block
            if (Math.random() < 0.8) {
                const attackType = Math.random() < 0.6 ? 'punch' : 'kick';
                this.character.attack(attackType, this.opponent);
            } else {
                this.moveTowardsOpponent();
            }
        }
    }
    
    balancedBehavior() {
        const distance = Math.abs(this.character.x - this.opponent.x);
        
        if (distance > 200) {
            this.moveTowardsOpponent();
        } else if (distance < 150) {
            // Almost always attack when close
            const attackType = Math.random() < 0.6 ? 'punch' : 'kick';
            this.character.attack(attackType, this.opponent);
        } else {
            // Rarely block, mostly attack
            if (Math.random() < 0.9) {
                const attackType = Math.random() < 0.6 ? 'punch' : 'kick';
                this.character.attack(attackType, this.opponent);
            } else {
                this.moveTowardsOpponent();
            }
        }
    }
    
    comboBehavior() {
        const distance = Math.abs(this.character.x - this.opponent.x);
        
        if (distance > 150) {
            this.moveTowardsOpponent();
        } else {
            const comboSequence = this.getComboSequence();
            this.executeCombo(comboSequence);
        }
    }
    
    specialBehavior() {
        const distance = Math.abs(this.character.x - this.opponent.x);
        
        if (this.character.specialEnergy >= 100 && distance < 200) {
            this.character.attack('ultimate', this.opponent);
        } else if (this.character.specialEnergy >= 30 && distance < 180) {
            this.character.attack('special', this.opponent);
        } else {
            this.aggressiveBehavior();
        }
    }
    
    moveTowardsOpponent() {
        if (!this.opponent) return;
        
        const direction = this.character.x < this.opponent.x ? 1 : -1;
        this.character.move(direction);
        
        if (this.character.abilities && this.character.abilities.dashSpeed && 
            Math.random() < 0.2) {
            this.character.dash(direction);
        }
    }
    
    moveAwayFromOpponent() {
        if (!this.opponent) return;
        
        const direction = this.character.x < this.opponent.x ? -1 : 1;
        this.character.move(direction);
        
        if (Math.random() < 0.3) {
            this.character.jump();
        }
    }
    
    dodgeAttack() {
        const dodgeDirection = Math.random() < 0.5 ? -1 : 1;
        this.character.move(dodgeDirection);
        
        if (Math.random() < 0.5) {
            this.character.jump();
        }
    }
    
    counterAttack() {
        setTimeout(() => {
            if (Math.random() < 0.7) {
                this.character.attack('kick', this.opponent);
            } else if (this.character.specialEnergy >= 30) {
                this.character.attack('special', this.opponent);
            }
        }, 100);
    }
    
    getComboSequence() {
        const sequences = [
            ['punch', 'punch', 'kick'],
            ['kick', 'punch', 'special'],
            ['punch', 'kick', 'punch'],
            ['kick', 'kick', 'special']
        ];
        
        if (this.character.type === 'trump') {
            return sequences[0];
        } else {
            return sequences[1];
        }
    }
    
    executeCombo(sequence) {
        let delay = 0;
        sequence.forEach((move, index) => {
            setTimeout(() => {
                if (move === 'special' && this.character.specialEnergy < 30) {
                    this.character.attack('kick', this.opponent);
                } else {
                    this.character.attack(move, this.opponent);
                }
            }, delay);
            delay += 200;
        });
    }
    
    counterBehavior() {
        const distance = Math.abs(this.character.x - this.opponent.x);
        
        // Wait for opponent to attack, then counter
        if (this.opponent.isAttacking && distance < 150) {
            setTimeout(() => {
                if (Math.random() < 0.8) {
                    // Quick counter-attack
                    this.character.attack('kick', this.opponent);
                }
            }, 100);
        } else if (distance > 180) {
            this.moveTowardsOpponent();
        } else {
            // Stay in counter range and block
            this.character.block(true);
            setTimeout(() => this.character.block(false), 200);
        }
    }
    
    interceptBehavior() {
        const distance = Math.abs(this.character.x - this.opponent.x);
        
        // Move to intercept approaching opponent
        if (distance > 120) {
            this.moveTowardsOpponent();
            
            // Jump to change trajectory
            if (Math.random() < 0.4) {
                this.character.jump();
            }
        } else {
            // Intercept with attack
            const attackType = Math.random() < 0.6 ? 'punch' : 'kick';
            this.character.attack(attackType, this.opponent);
        }
    }
    
    pressureBehavior() {
        const distance = Math.abs(this.character.x - this.opponent.x);
        
        // Relentless pressure when opponent is weak
        if (distance > 100) {
            this.moveTowardsOpponent();
            
            // Use dash if available
            if (this.character.abilities && this.character.abilities.dashSpeed && 
                Math.random() < 0.5) {
                const direction = this.character.x < this.opponent.x ? 1 : -1;
                this.character.dash(direction);
            }
        } else {
            // Constant attacks
            const attackRoll = Math.random();
            if (attackRoll < 0.5) {
                this.character.attack('punch', this.opponent);
            } else if (attackRoll < 0.8) {
                this.character.attack('kick', this.opponent);
            } else if (this.character.specialEnergy >= 30) {
                this.character.attack('special', this.opponent);
            }
        }
    }
    
    reset() {
        this.lastAction = null;
        this.actionTimer = 0;
        this.decisionTimer = 0;
        this.currentStrategy = 'neutral';
        this.patternMemory = [];
        this.dodgeTimer = 0;
        this.adaptiveMemory = [];
        this.playerPatterns = {
            attackFrequency: 0,
            favoriteAttacks: {},
            movementStyle: 'balanced',
            reactionTime: 300
        };
        this.anticipatedAction = null;
        this.pressureLevel = 0;
    }
}

// Expose FighterAI class globally
window.FighterAI = FighterAI;