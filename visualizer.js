const VU_STYLES = [
    'classic', 'led', 'circular', 'waveform', 'spectrum', 'retro'
];

let state;
let leftVu, rightVu, vuMeters;
let analyserLeft, analyserRight;
let dataArrayLeft, dataArrayRight, frequencyDataLeft, frequencyDataRight;

export function initVisualizer(appState, audioContext, source) {
    state = appState;

    // Get DOM elements
    leftVu = document.getElementById('left-vu');
    rightVu = document.getElementById('right-vu');
    vuMeters = document.querySelector('.vu-meters');

    // Create and connect analyser nodes
    const splitter = audioContext.createChannelSplitter(2);
    analyserLeft = audioContext.createAnalyser();
    analyserRight = audioContext.createAnalyser();
    analyserLeft.fftSize = 1024;
    analyserRight.fftSize = 1024;

    source.connect(splitter);
    splitter.connect(analyserLeft, 0);
    splitter.connect(analyserRight, 1);

    // Store analysers in state for other modules if needed
    state.analyserLeft = analyserLeft;
    state.analyserRight = analyserRight;

    // Prepare data arrays
    const bufferLength = analyserLeft.frequencyBinCount;
    dataArrayLeft = new Uint8Array(bufferLength);
    dataArrayRight = new Uint8Array(bufferLength);
    frequencyDataLeft = new Uint8Array(bufferLength);
    frequencyDataRight = new Uint8Array(bufferLength);

    // Create UI
    createVuStyleButton();

    // Initial setup
    updateVuStyle();
    updateVUMeters();
}

function createVuStyleButton() {
    if (document.getElementById('vu-style-btn')) return;

    const vuStyleBtn = document.createElement('button');
    vuStyleBtn.id = 'vu-style-btn';
    vuStyleBtn.className = 'vu-style-btn';
    vuStyleBtn.innerHTML = '◉';
    vuStyleBtn.title = 'Cycle VU Meter Style';
    vuStyleBtn.setAttribute('aria-label', 'Cycle VU Meter Style');
    vuMeters.appendChild(vuStyleBtn);

    vuStyleBtn.addEventListener('click', () => {
        state.vuStyle = (state.vuStyle + 1) % VU_STYLES.length;
        updateVuStyle();
    });
}

function updateVuStyle() {
    const vuStyleBtn = document.getElementById('vu-style-btn');
    const currentStyle = VU_STYLES[state.vuStyle];
    vuMeters.className = `vu-meters vu-${currentStyle}`;

    if (vuStyleBtn) {
        const styleName = currentStyle.charAt(0).toUpperCase() + currentStyle.slice(1);
        vuStyleBtn.title = `Style: ${styleName}`;
    }

    // Clear existing content and rebuild based on style
    leftVu.innerHTML = '';
    rightVu.innerHTML = '';

    switch (currentStyle) {
        case 'classic':
            createClassicVu(leftVu, 'left');
            createClassicVu(rightVu, 'right');
            break;
        case 'led':
            createLedVu(leftVu, 'left');
            createLedVu(rightVu, 'right');
            break;
        case 'circular':
            createCircularVu(leftVu, 'left');
            createCircularVu(rightVu, 'right');
            break;
        case 'waveform':
            createWaveformVu(leftVu, 'left');
            createWaveformVu(rightVu, 'right');
            break;
        case 'spectrum':
            createSpectrumVu(leftVu, 'left');
            createSpectrumVu(rightVu, 'right');
            break;
        case 'retro':
            createRetroVu(leftVu, 'left');
            createRetroVu(rightVu, 'right');
            break;
    }
}

function createClassicVu(container, channel) {
    const level = document.createElement('div');
    level.className = 'vu-level';
    level.id = `${channel}-vu-level`;
    container.appendChild(level);
}

function createLedVu(container, channel) {
    const ledContainer = document.createElement('div');
    ledContainer.className = 'led-container';
    for (let i = 0; i < 20; i++) {
        const led = document.createElement('div');
        led.className = 'led-segment';
        led.dataset.index = i;
        ledContainer.appendChild(led);
    }
    container.appendChild(ledContainer);
}

function createCircularVu(container, channel) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 34 34');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '17');
    circle.setAttribute('cy', '17');
    circle.setAttribute('r', '13');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#333');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('opacity', '0.3');
    
    const levelCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    levelCircle.setAttribute('cx', '17');
    levelCircle.setAttribute('cy', '17');
    levelCircle.setAttribute('r', '13');
    levelCircle.setAttribute('fill', 'none');
    levelCircle.setAttribute('stroke', '#00ff00');
    levelCircle.setAttribute('stroke-width', '4');
    levelCircle.setAttribute('stroke-linecap', 'round');
    levelCircle.setAttribute('stroke-dasharray', '81.68');
    levelCircle.setAttribute('stroke-dashoffset', '81.68');
    levelCircle.setAttribute('transform', 'rotate(-90 17 17)');
    levelCircle.id = `${channel}-circular-level`;
    levelCircle.className = 'circular-level';
    
    svg.appendChild(circle);
    svg.appendChild(levelCircle);
    container.appendChild(svg);
}

function createWaveformVu(container, channel) {
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 100;
    canvas.className = 'waveform-canvas';
    container.appendChild(canvas);
}

function createSpectrumVu(container, channel) {
    const spectrumContainer = document.createElement('div');
    spectrumContainer.className = 'spectrum-container';
    for (let i = 0; i < 16; i++) {
        const bar = document.createElement('div');
        bar.className = 'spectrum-bar';
        bar.dataset.index = i;
        spectrumContainer.appendChild(bar);
    }
    container.appendChild(spectrumContainer);
}

function createRetroVu(container, channel) {
    const retro = document.createElement('div');
    retro.className = 'retro-vu';
    const needle = document.createElement('div');
    needle.className = 'retro-needle';
    const scale = document.createElement('div');
    scale.className = 'retro-scale';
    scale.innerHTML = '0&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;40&nbsp;&nbsp;&nbsp;60&nbsp;&nbsp;&nbsp;80&nbsp;&nbsp;&nbsp;100';
    retro.appendChild(scale);
    retro.appendChild(needle);
    container.appendChild(retro);
}

function updateVUMeters() {
    state.animationFrameId = requestAnimationFrame(updateVUMeters);

    if (!state.isPlaying) {
        resetVuMeters();
        return;
    }

    analyserLeft.getByteTimeDomainData(dataArrayLeft);
    analyserRight.getByteTimeDomainData(dataArrayRight);
    analyserLeft.getByteFrequencyData(frequencyDataLeft);
    analyserRight.getByteFrequencyData(frequencyDataRight);

    const levelLeft = calculateRMSLevel(dataArrayLeft);
    const levelRight = calculateRMSLevel(dataArrayRight);

    const currentStyle = VU_STYLES[state.vuStyle];
    switch (currentStyle) {
        case 'classic': updateClassicVu(levelLeft, levelRight); break;
        case 'led': updateLedVu(levelLeft, levelRight); break;
        case 'circular': updateCircularVu(levelLeft, levelRight); break;
        case 'waveform': updateWaveformVu(); break;
        case 'spectrum': updateSpectrumVu(); break;
        case 'retro': updateRetroVu(levelLeft, levelRight); break;
    }
}

function calculateRMSLevel(dataArray) {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const sample = (dataArray[i] - 128) / 128;
        sum += sample * sample;
    }
    return Math.min(Math.sqrt(sum / dataArray.length) * 300, 100);
}

function getLevelColor(level) {
    if (level < 60) return '#00ff00';
    if (level < 85) return '#ffff00';
    return '#ff0000';
}

function updateClassicVu(levelLeft, levelRight) {
    const leftLevel = document.getElementById('left-vu-level');
    const rightLevel = document.getElementById('right-vu-level');
    if (leftLevel) {
        leftLevel.style.height = `${levelLeft}%`;
        leftLevel.style.background = getLevelColor(levelLeft);
    }
    if (rightLevel) {
        rightLevel.style.height = `${levelRight}%`;
        rightLevel.style.background = getLevelColor(levelRight);
    }
}

function updateLedVu(levelLeft, levelRight) {
    updateLedChannel(leftVu, levelLeft);
    updateLedChannel(rightVu, levelRight);
}

function updateLedChannel(container, level) {
    const leds = container.querySelectorAll('.led-segment');
    const activeLeds = Math.floor((level / 100) * leds.length);
    leds.forEach((led, index) => {
        if (index < activeLeds) {
            const ratio = index / leds.length;
            if (ratio < 0.6) led.style.background = '#00ff00';
            else if (ratio < 0.85) led.style.background = '#ffff00';
            else led.style.background = '#ff0000';
            led.style.opacity = '1';
        } else {
            led.style.opacity = '0.1';
        }
    });
}

function updateCircularVu(levelLeft, levelRight) {
    const leftCircle = document.getElementById('left-circular-level');
    const rightCircle = document.getElementById('right-circular-level');
    const circumference = 81.68;
    if (leftCircle) {
        const offset = circumference - (levelLeft / 100) * circumference;
        leftCircle.setAttribute('stroke-dashoffset', offset);
        leftCircle.setAttribute('stroke', getLevelColor(levelLeft));
    }
    if (rightCircle) {
        const offset = circumference - (levelRight / 100) * circumference;
        rightCircle.setAttribute('stroke-dashoffset', offset);
        rightCircle.setAttribute('stroke', getLevelColor(levelRight));
    }
}

function updateWaveformVu() {
    updateWaveformChannel(leftVu, dataArrayLeft);
    updateWaveformChannel(rightVu, dataArrayRight);
}

function updateWaveformChannel(container, dataArray) {
    const canvas = container.querySelector('.waveform-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--console-bg');
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    const sliceHeight = height / dataArray.length;
    let y = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        const x = (v * width / 2) + width / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        y += sliceHeight;
    }
    ctx.stroke();
}

function updateSpectrumVu() {
    updateSpectrumChannel(leftVu, frequencyDataLeft);
    updateSpectrumChannel(rightVu, frequencyDataRight);
}

function updateSpectrumChannel(container, frequencyData) {
    const bars = container.querySelectorAll('.spectrum-bar');
    const barWidth = Math.floor(frequencyData.length / bars.length);
    bars.forEach((bar, index) => {
        let sum = 0;
        const start = index * barWidth;
        for (let i = start; i < start + barWidth; i++) {
            sum += frequencyData[i];
        }
        const average = sum / barWidth;
        const height = (average / 255) * 100;
        bar.style.height = `${height}%`;
        bar.style.background = getLevelColor(height * 1.5);
    });
}

function updateRetroVu(levelLeft, levelRight) {
    updateRetroChannel(leftVu, levelLeft);
    updateRetroChannel(rightVu, levelRight);
}

function updateRetroChannel(container, level) {
    const needle = container.querySelector('.retro-needle');
    if (needle) {
        const rotation = -45 + (level / 100) * 90;
        needle.style.transform = `rotate(${rotation}deg)`;
        needle.style.borderColor = getLevelColor(level);
    }
}

function resetVuMeters() {
    const currentStyle = VU_STYLES[state.vuStyle];
    switch (currentStyle) {
        case 'classic':
            document.querySelectorAll('.vu-level').forEach(level => {
                level.style.height = '0%';
                level.style.background = '#00ff00';
            });
            break;
        case 'led':
            document.querySelectorAll('.led-segment').forEach(led => led.style.opacity = '0.1');
            break;
        case 'circular':
            document.querySelectorAll('.circular-level').forEach(circle => {
                circle.setAttribute('stroke-dashoffset', '81.68');
                circle.setAttribute('stroke', '#00ff00');
            });
            break;
        case 'retro':
            document.querySelectorAll('.retro-needle').forEach(needle => {
                needle.style.transform = 'rotate(-45deg)';
                needle.style.borderColor = '#00ff00';
            });
            break;
    }
}