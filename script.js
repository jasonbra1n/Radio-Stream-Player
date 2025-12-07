import { radioStreamState, initPlayer } from './player.js';
import { initVisualizer } from './visualizer.js';

/**
 * Manages the application's theme (light/dark) for the standalone player.
 */
const StandaloneThemeManager = {
    init() {
        this.addThemeToggleButton();
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme(prefersDark ? 'dark-theme' : 'light-theme');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) { // Only follow system if no theme is saved
                this.setTheme(e.matches ? 'dark-theme' : 'light-theme');
            }
        });
    },

    setTheme(themeName) {
        const isDark = themeName === 'dark-theme';
        document.documentElement.classList.toggle('dark-theme', isDark);
        localStorage.setItem('theme', themeName);
        this.updateThemeIcon(isDark);
    },

    toggleTheme() {
        const isDark = !document.documentElement.classList.contains('dark-theme');
        this.setTheme(isDark ? 'dark-theme' : 'light-theme');
    },

    updateThemeIcon(isDark) {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.textContent = isDark ? '☀️' : '🌙';
        }
    },

    addThemeToggleButton() {
        const header = document.querySelector('.tool-header');
        if (!header || document.getElementById('theme-toggle-btn')) return;

        const toggle = document.createElement('button');
        toggle.id = 'theme-toggle-btn';
        toggle.className = 'theme-btn';
        toggle.setAttribute('aria-label', 'Toggle light and dark theme');
        header.appendChild(toggle);
        toggle.addEventListener('click', () => this.toggleTheme());
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('station-select')) {
        StandaloneThemeManager.init();
        
        // Initialize the core player logic
        initPlayer(radioStreamState);

        // Once the player has created the audio context and source, initialize the visualizer
        if (radioStreamState.audioContext && radioStreamState.source) {
            initVisualizer(radioStreamState, radioStreamState.audioContext, radioStreamState.source);
        }
    }
});
