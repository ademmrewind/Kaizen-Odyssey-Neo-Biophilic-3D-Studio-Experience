# Kaizen Odyssey — Neo-Biophilic 3D Studio Experience

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-Vite-646CFF.svg)
![WebGL](https://img.shields.io/badge/graphics-Three.js-black.svg)

**KAIZEN ODYSSEY** is a high-performance, organically minimalist landing page for a multi-disciplinary spatial and sensory design studio based in Tokyo, JP. The project is a study in "Silent Equilibrium" — balancing high-end 3D graphics with the Japanese spatial philosophy of *Ma* (間).

## 🌿 Core Philosophy

True design begins in silence. This project translates the meditative act of shaping light, texture, and emptiness into a digital experience. Every interaction is slow, deliberate, and fluid, designed to awaken embodied presence.

## 🚀 Key Features

*   **Ascending Helix Geometry**: A custom-coded 3D spiral (inverted cone) functions as a floating DNA-like structural ribbon that carries architectural imagery with slow, liquid transitions.
*   **Liquid Glass Shaders**: Custom GLSL fragment shaders using **2D Simplex Noise** to create a subtle "water-refraction" and "ink-in-water" edge dissolution driven by scroll velocity.
*   **Meditative Interaction**: High inertia smoothing (0.04) and zero-gravity mouse parallax make the helix feel like it is floating in oil or water.
*   **Performance First**: Uses `requestIdleCallback` to delay WebGL texture compilation, ensuring near-instantaneous typography rendering (FCP).

## 🛠 Tech Stack

*   **Core**: Vite 5 + Vanilla JavaScript
*   **3D Engine**: Three.js
*   **Physics & Animation**: GSAP + ScrollTrigger
*   **Smooth Scrolling**: Lenis (by Studio Freight)
*   **Shaders**: GLSL (Custom Simplex Noise & Liquid Masking)

## 📁 Project Structure

```text
├── index.html          # Semantic HTML5 & Zen Sections
├── src/
│   ├── script.js       # Scene orchestration & Helix Logic
│   ├── shaders.js      # GLSL Vertex & Fragment code
│   ├── styles.css      # Design system & Organic animations
│   └── assets/         # High-end architectural imagery
```

## ⚙️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ademmrewind/Kaizen-Odyssey-Neo-Biophilic-3D-Studio-Experience.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License.

---
*Designed with ademrewind*
