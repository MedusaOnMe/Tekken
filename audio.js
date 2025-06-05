class AudioSystem {
    constructor() {
        this.context = null;
        this.sounds = {};
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.initialized = false;
        this.currentMusic = null;
        
        this.soundDefinitions = {
            punch_light: { frequency: 200, duration: 100, type: 'sawtooth' },
            punch_heavy: { frequency: 150, duration: 150, type: 'square' },
            kick_light: { frequency: 300, duration: 120, type: 'triangle' },
            kick_heavy: { frequency: 250, duration: 180, type: 'square' },
            block: { frequency: 100, duration: 200, type: 'sine' },
            hit: { frequency: 400, duration: 80, type: 'sawtooth' },
            special_trump: { frequency: 180, duration: 300, type: 'square' },
            special_elon: { frequency: 600, duration: 250, type: 'sawtooth' },
            ultimate_trump: { frequency: 100, duration: 500, type: 'square' },
            ultimate_elon: { frequency: 800, duration: 400, type: 'triangle' },
            menu_select: { frequency: 440, duration: 50, type: 'sine' },
            menu_hover: { frequency: 350, duration: 30, type: 'sine' },
            round_start: { frequency: 523, duration: 500, type: 'sine' },
            round_end: { frequency: 261, duration: 700, type: 'sine' },
            victory: { frequency: 659, duration: 1000, type: 'sine' },
            defeat: { frequency: 196, duration: 1000, type: 'square' }
        };
    }
    
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            this.createSounds();
            return true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.initialized = false;
            return false;
        }
    }
    
    createSounds() {
        for (let soundName in this.soundDefinitions) {
            this.sounds[soundName] = this.soundDefinitions[soundName];
        }
    }
    
    playSound(soundName, volume = 1.0) {
        if (!this.initialized || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName];
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.frequency, this.context.currentTime);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, 
            this.context.currentTime + sound.duration / 1000);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + sound.duration / 1000);
        
        if (soundName.includes('special') || soundName.includes('ultimate')) {
            this.addEcho(gainNode, sound.duration / 1000);
        }
    }
    
    addEcho(sourceNode, duration) {
        const delay = this.context.createDelay();
        const feedback = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        delay.delayTime.value = 0.2;
        feedback.gain.value = 0.5;
        filter.frequency.value = 2000;
        
        sourceNode.connect(delay);
        delay.connect(filter);
        filter.connect(feedback);
        feedback.connect(delay);
        feedback.connect(this.context.destination);
    }
    
    playBackgroundMusic() {
        if (!this.initialized) return;
        
        const musicNotes = [
            { freq: 130.81, duration: 500 },
            { freq: 146.83, duration: 500 },
            { freq: 164.81, duration: 500 },
            { freq: 174.61, duration: 500 },
            { freq: 196.00, duration: 500 },
            { freq: 174.61, duration: 500 },
            { freq: 164.81, duration: 500 },
            { freq: 146.83, duration: 500 }
        ];
        
        let currentTime = this.context.currentTime;
        
        const playSequence = () => {
            musicNotes.forEach((note, index) => {
                const oscillator = this.context.createOscillator();
                const gainNode = this.context.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(note.freq, currentTime);
                
                gainNode.gain.setValueAtTime(0, currentTime);
                gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.3, 
                    currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, 
                    currentTime + note.duration / 1000);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.context.destination);
                
                oscillator.start(currentTime);
                oscillator.stop(currentTime + note.duration / 1000);
                
                currentTime += note.duration / 1000;
            });
        };
        
        playSequence();
        
        this.currentMusic = setInterval(() => {
            currentTime = this.context.currentTime;
            playSequence();
        }, 4000);
    }
    
    stopBackgroundMusic() {
        if (this.currentMusic) {
            clearInterval(this.currentMusic);
            this.currentMusic = null;
        }
    }
    
    playComboSound(comboCount) {
        if (!this.initialized) return;
        
        const baseFreq = 440;
        const freqMultiplier = 1 + (comboCount * 0.1);
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(baseFreq * freqMultiplier, 
            this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * freqMultiplier * 2, 
            this.context.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(this.sfxVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.2);
    }
    
    playHitSound(damage) {
        if (!this.initialized) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100 + damage * 10, this.context.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.context.currentTime);
        filter.Q.setValueAtTime(10, this.context.currentTime);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.1);
        
        const noise = this.createNoise(0.05);
        const noiseGain = this.context.createGain();
        noiseGain.gain.setValueAtTime(this.sfxVolume * 0.3, this.context.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
        
        noise.connect(noiseGain);
        noiseGain.connect(this.context.destination);
    }
    
    createNoise(duration) {
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        noise.start(this.context.currentTime);
        
        return noise;
    }
    
    playVoiceLine(character, type) {
        }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}