# 🌸 Xeranov Dreamland

An interactive, cozy 3D browser exploration game featuring an adorable chibi vinyl toy cat exploring a pastel floating island world (Sakura Meadow).

Built for desktop and mobile browsers with zero external assets required.

---

## ✨ Features

- **🐾 Chibi Vinyl Cat**: Glossy vinyl toy aesthetic with procedural animation rigs (ear wiggles, tail sway, four-paw trot/gallop, jump stretch, and landing squash-and-stretch).
- **🕹️ Responsive Platformer Controls**: Tight, velocity-driven movement with coyote time, jump buffering, and directional dash boost.
- **📷 3rd-Person Orbit Camera**: Smooth follow camera with spherical mouse drag / touch swipe rotation, zoom, and pitch clamping.
- **🏝️ Sakura Meadow**: Floating island terrain with rolling grassy mounds, stepping stone sky platforms, cherry blossom trees, and a cozy pastel cottage.
- **🍄 Bounce Mushrooms & Physics Props**: Springy jelly mushrooms with spring-damping physics, plus pushable dynamic candy blocks and balls.
- **⭐ Collectibles & Checkpoints**: 6 glowing Star Fragments with floating rings, plus active checkpoint flags with auto-recovery when falling off the island.
- **🎶 Web Audio API Synthesizer**: Pure procedural sound engine featuring cute vocal meows, pentatonic collection chimes, bounce boings, whooshes, and warm ambient synth pad chords.
- **📱 Full Mobile Support**: Responsive virtual 360° joystick, camera swipe surface, and dedicated touch action buttons.
- **💾 Local Persistence**: Debounced `localStorage` saving with versioning, validation, and progress reset.

---

## 🛠️ Tech Stack

- **Framework**: [Vite](https://vite.dev/) + [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics**: [Three.js](https://threejs.org/) + [React Three Fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Physics**: [Rapier 3D](https://rapier.rs/) via [@react-three/rapier](https://github.com/pmndrs/react-three-rapier)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom Dreamland pastel design tokens
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Xeranov/Xera-Dreamland.git
cd Xera-Dreamland

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

The compiled output in `dist/` is ready to be hosted on Cloudflare Pages, Vercel, Netlify, or any static hosting service.

---

## 🎮 Controls

### Desktop
| Action | Key / Input |
|---|---|
| **Move** | `W`, `A`, `S`, `D` or Arrow Keys |
| **Jump** | `Space` |
| **Dash** | `Shift` |
| **Meow** | `M` or click HUD button |
| **Camera Orbit** | Left-click & drag mouse |
| **Zoom** | Mouse scroll wheel |
| **Pause / Settings** | `Escape` or Pause button |

### Mobile
- **Move**: Virtual joystick on bottom-left.
- **Camera**: Swipe anywhere across the right side of the screen.
- **Actions**: Tap `Jump`, `Dash`, or `Meow` buttons on bottom-right.

---

## 📜 License

Created with ❤️ for `xeranov.com`.
