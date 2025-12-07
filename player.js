import { stations } from './stations.js';

export const radioStreamState = window.radioStreamState || {
    audio: null,
    isPlaying: false,
    currentStation: null,
    volume: 0.5,
    audioContext: null,
    source: null,
    animationFrameId: null,
    popoutWindow: null,
    vuStyle: 1 // Default to LED
};
window.radioStreamState = radioStreamState;

export function initPlayer(state) {
    // DOM Elements
    const stationSelect = document.getElementById('station-select');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const popoutBtn = document.getElementById('popout-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const nowPlaying = document.getElementById('now-playing');
    const popoutNotice = document.getElementById('popout-notice');

    // Populate stations
    stations.forEach((station, index) => {
        const option = document.createElement('option');
        option.value = station.url;
        option.textContent = station.name;
        if (index === 0) {
            option.selected = true;
        }
        stationSelect.appendChild(option);
    });

    // Audio Setup
    if (!state.audio) {
        state.audio = new Audio();
        state.audio.crossOrigin = 'anonymous';
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.source = state.audioContext.createMediaElementSource(state.audio);
        state.source.connect(state.audioContext.destination);
    }

    const { audio, audioContext } = state;

    // Initial State
    audio.src = state.currentStation || stationSelect.value;
    audio.volume = state.volume || volumeSlider.value;
    if (state.currentStation) {
        stationSelect.value = state.currentStation;
    }
    volumeSlider.value = audio.volume;
    playPauseBtn.textContent = state.isPlaying ? 'Pause' : 'Play';
    updateNowPlaying();

    // Event Listeners
    playPauseBtn.addEventListener('click', () => {
        if (state.isPlaying) {
            audio.pause();
        } else {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            audio.play().catch(err => {
                console.error('Playback failed:', err);
                nowPlaying.textContent = 'Error: Unable to play stream';
            });
        }
        state.isPlaying = !state.isPlaying;
        playPauseBtn.textContent = state.isPlaying ? 'Pause' : 'Play';
        updateNowPlaying();
    });

    stationSelect.addEventListener('change', () => {
        audio.src = stationSelect.value;
        state.currentStation = stationSelect.value;
        updateNowPlaying();
        if (state.isPlaying) {
            audio.play().catch(err => {
                console.error('Playback failed:', err);
                nowPlaying.textContent = 'Error: Unable to play stream';
            });
        }
    });

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
        state.volume = audio.volume;
    });

    popoutBtn.addEventListener('click', () => {
        if (state.popoutWindow && !state.popoutWindow.closed) {
            state.popoutWindow.focus();
            return;
        }

        if (state.isPlaying) {
            audio.pause();
            state.isPlaying = false;
            playPauseBtn.textContent = 'Play';
        }

        const isDark = document.documentElement.classList.contains('dark-theme');
        const popoutUrl = `popout.html?station=${encodeURIComponent(stationSelect.value)}&theme=${isDark ? 'dark' : 'light'}`;
        state.popoutWindow = window.open(popoutUrl, 'RadioStreamPopout', 'width=300,height=278');

        document.querySelector('.radiostream-player .player-content').style.display = 'none';
        if (popoutNotice) popoutNotice.style.display = 'block';
    });

    window.addEventListener('message', (event) => {
        if (event.data.type === 'popoutClosed') {
            document.querySelector('.radiostream-player .player-content').style.display = 'flex';
            if (popoutNotice) popoutNotice.style.display = 'none';

            state.popoutWindow = null;
            if (state.isPlaying) {
                audio.play().catch(err => {
                    console.error('Playback failed:', err);
                    nowPlaying.textContent = 'Error: Unable to play stream';
                });
                playPauseBtn.textContent = 'Pause';
            }
        }
    });

    window.addEventListener('beforeunload', cleanup);

    function updateNowPlaying() {
        const stationName = stationSelect.options[stationSelect.selectedIndex].text;
        nowPlaying.textContent = `Now Playing: ${stationName}`;
        state.currentStation = stationSelect.value;
    }

    function cleanup() {
        if (state.isPlaying) {
            audio.pause();
            state.isPlaying = false;
        }
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }
    }
}