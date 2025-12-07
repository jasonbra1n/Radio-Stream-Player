# Project Roadmap

This document outlines the future direction and planned features for the Radio Stream Player. The goals are divided into short-term, mid-term, and long-term milestones.

---

## 🎯 Short-Term Goals (v1.1)

*These are improvements focused on code quality, accessibility, and minor feature additions.*

-   **[x] Code Refactoring:**
    -   Modularize `script.js` by separating the core player logic from the VU meter visualization logic. This will improve maintainability and make it easier to add new visualizers.
-   **[x] Accessibility (A11y) Enhancements:**
    -   Add `aria-label` attributes to all interactive controls (buttons, sliders) for better screen reader support.
    -   Ensure full keyboard navigability for all player functions.
    -   Implement focus-visible states for better keyboard navigation feedback.
-   **[ ] UI/UX Improvements:**
    -   **[x]** Add a visual indicator or tooltip to the "Cycle VU Meter" button to show the name of the current style.
    -   Improve the pop-out window closing mechanism to be more robust.
-   **[ ] Content:**
    -   Add more high-quality radio streams to the default list.

---

## 🚀 Mid-Term Goals (v1.2)

*These goals focus on adding significant new user-facing features.*

-   **[ ] Custom Stations:**
    -   Implement a feature allowing users to add their own radio stream URLs.
    -   Use `localStorage` to save user-added stations so they persist between sessions.
-   **[ ] Favorites System:**
    -   Allow users to mark stations as "favorites" for quick access.
-   **[ ] Stream Metadata Display:**
    -   Investigate methods (e.g., ICY metadata) to fetch and display the currently playing song and artist information from the stream, where available. This may require a server-side proxy for CORS reasons.

---

## 🔭 Long-Term Goals (v2.0+)

*These are major architectural changes and features that would represent a significant evolution of the project.*

-   **[ ] Advanced State Management:**
    -   Refactor the simple global `radioStreamState` object into a more robust state management pattern (e.g., a class-based service or a small pub/sub library) to better handle application complexity.
-   **[ ] Build Process Integration:**
    -   Introduce a modern build tool like Vite or Parcel to enable features like ES modules, CSS pre-processing, and code minification for production builds.
-   **[ ] Backend Service:**
    -   Create an optional, lightweight backend (e.g., Node.js/Express) to act as a proxy for radio streams. This would solve most CORS issues and provide a reliable way to parse stream metadata.