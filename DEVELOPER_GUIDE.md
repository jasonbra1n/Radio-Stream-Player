# Developer Guide: Radio Stream Player

Welcome to the developer guide for the Radio Stream Player. This document is intended for developers and AI assistants who want to understand, maintain, or contribute to the project.

## 1. Project Overview

This project is a single-page web application that plays radio streams and provides real-time audio visualizations. It is built with vanilla HTML, CSS, and JavaScript, with no external frameworks or build steps, making it lightweight and easy to run.

**Core Goals:**
- Provide a simple, elegant user interface.
- Offer dynamic and engaging audio visualizations using the Web Audio API.
- Be self-contained and easy to deploy.

## 2. Codebase Structure

The project consists of a few key files:

- `index.html`: The main entry point and structure for the application. It contains the player UI, station list, and control buttons.
- `popout.html`: A minimal version of the UI for the pop-out player window. It communicates with the main window via `postMessage`.
- `stations.js`: A simple ES module that exports the array of default radio stations.
- `player.js`: An ES module that handles all core player logic, including audio playback, UI controls (play, volume, station select), and state management.
- `visualizer.js`: An ES module responsible for all Web Audio API analysis, canvas/DOM drawing, and VU meter style logic.
- `styles.css`: Contains all styling for the application, including layout, theming (light/dark modes), and the appearance of all VU meter styles.
- `script.js`: The main entry point. It imports the other modules (`player.js`, `visualizer.js`) and initializes the application. It also contains the theme management logic.
- `README.md`: The user-facing documentation.
- `DEVELOPER_GUIDE.md`: (This file) The technical documentation for contributors.

## 3. Core Architecture & Concepts

### 3.1. Global State Management (`radioStreamState`)

To manage state across different contexts (main window vs. pop-out) and to persist state if the script were re-initialized, a single global object `radioStreamState` is attached to the `window` object. It is defined and exported from `player.js`.

```javascript
const radioStreamState = window.radioStreamState || {
    audio: null,
    isPlaying: false,
    currentStation: null,
    volume: 0.5,
    audioContext: null,
    // ... other audio nodes
    vuStyle: 1
};
window.radioStreamState = radioStreamState;
```

- **Purpose**: It acts as a singleton, holding all critical application state like the current station, volume, playback status, and references to the `AudioContext` and its nodes.
- **Limitation**: This is a simple approach. For larger applications, this could become difficult to manage. Future work could involve refactoring this into a more robust state management pattern (e.g., a class-based service or a pub/sub model).

### 3.2. Web Audio API Graph

The audio visualization is powered by the Web Audio API. The audio signal flows through a series of connected nodes, all of which are created and managed within `visualizer.js`.

1.  **`<audio>` Element**: The source of the stream.
2.  **`MediaElementAudioSourceNode`**: Connects the `<audio>` element to the Web Audio API graph.
3.  **`ChannelSplitterNode`**: Splits the stereo source into two separate mono channels (Left and Right).
4.  **`AnalyserNode` (x2)**: One for each channel. These nodes do not affect the audio but provide data for visualization (time-domain and frequency-domain).
5.  **`AudioDestinationNode`**: The output, which is the user's speakers. The original source is connected directly to the destination so the analysis doesn't interfere with playback.

**Diagram:**
```
                   ┌──────────────────────────┐
<audio> element -> │ MediaElementAudioSource  ├─> speakers (AudioDestination)
                   └──────────────────────────┘
                                │
                   ┌──────────────────────────┐
                   │    ChannelSplitter       │
                   └──────────────────────────┘
                                │
           ┌────────────────────┴────────────────────┐
           │ (Channel 0)                  (Channel 1) │
           ▼                                          ▼
┌───────────────────┐                      ┌───────────────────┐
│ AnalyserNode (L)  │                      │ AnalyserNode (R)  │
└───────────────────┘                      └───────────────────┘
           │                                          │
           ▼                                          ▼
     (JS Analysis)                            (JS Analysis)
```

### 3.3. Visualization Engine

The visualization is handled by a `requestAnimationFrame` loop inside the `updateVUMeters` function within `visualizer.js`.

- **Loop**: On each frame, it gets the latest audio data from the `AnalyserNode`s.
- **Style Switching**: A `switch` statement checks the current `state.vuStyle` and calls the appropriate rendering function (e.g., `updateClassicVu`, `updateLedVu`).
- **DOM Manipulation**: The rendering functions update the DOM directly—by changing CSS properties (`height`, `transform`), updating SVG attributes, or drawing on a `<canvas>`.

### 3.4. Pop-out Player

The pop-out feature uses `window.open()` to create a new, smaller browser window.

- **State Transfer**: The main window is paused, and the new pop-out window is initialized with the current station URL passed as a query parameter.
- **Communication**: When the pop-out window is closed, it uses `window.opener.postMessage()` to notify the main window. The main window listens for this message to restore its UI and resume playback if necessary.

## 4. How to Contribute

### 4.1. Adding a New Radio Station

This is the simplest contribution. The station list is now managed in its own file.
1.  Open `stations.js`.
2.  Add a new object to the `stations` array.
3.  The object must have a `name` (string) and a `url` (string) to the audio stream.

```javascript
export const stations = [
    // ... existing stations
    { name: "My New Station", url: "https://your-stream-url/stream" }
];
```

### 4.2. Adding a New VU Meter Style

Follow these steps to add a new visualization style (e.g., "neon").

1.  **`script.js` - Register the Style**: Add your new style name to the `VU_STYLES` array.
    ```javascript
    const VU_STYLES = ['classic', 'led', /*...*/, 'retro', 'neon'];
    ```
2.  **`script.js` - Create Setup Function**: Create a function `createNeonVu(container, channel)` that builds the initial HTML/SVG/Canvas structure for one channel of your new meter. Add a call to it in the `updateVuStyle` function's `switch` statement.
3.  **`script.js` - Create Update Function**: Create a function `updateNeonVu(levelLeft, levelRight)` that updates your meter's visuals based on the audio data. Add a call to it in the `updateVUMeters` function's `switch` statement.
4.  **`script.js` - Create Reset Function** (Optional): If your meter needs to be reset to a zero state when paused, add logic to the `resetVuMeters` function.
5.  **`styles.css` - Add Styling**: Add the necessary CSS rules to style your new meter. Use a class selector based on the style name (e.g., `.vu-meters.vu-neon`).

---
*This guide should be kept up-to-date with any significant architectural changes.*