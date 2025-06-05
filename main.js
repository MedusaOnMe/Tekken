// Main entry point that loads all dependencies in correct order
console.log('🚀 Loading main.js');

// Load all classes in dependency order
import './audio.js';
import './characters.js'; 
import './ai.js';
import './script.js';

console.log('✅ All modules loaded');