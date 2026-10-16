# 🌸 Xeranov Dreamland

An interactive, cozy 3D browser exploration game featuring an adorable chibi vinyl toy cat exploring a pastel floating island world.

Built for desktop and mobile browsers with zero external assets required.

---

## ✨ Features

- **🐾 Chibi Vinyl Cat**: Glossy vinyl toy aesthetic with procedural animation rigs (ear wiggles, tail sway, four-paw trot/gallop, jump stretch, landing squash-and-stretch).
- **🎀 Real-Time Cat Wardrobe**: 3 equippable 3D accessories attached to the cat mesh (Sakura Flower Pin, Pink Satin Ribbon Bow, Golden Starlight Crown) managed via the Dreamland Journal (`[I]` key or HUD backpack button).
- **🏝️ Seamless 5-Zone Archipelago**: Explore a continuous floating realm with zero loading screens:
  - **Sakura Meadow**: Blossoming cherry trees, rolling mounds, tutorial boards, and cozy cottage.
  - **Candy Garden**: Massive bouncy jelly mushrooms, pushable candy blocks & beach balls, and stepping sweets.
  - **Cloud Bridges**: Kinematic moving cloud shuttles and vertical lifts over the open void.
  - **Starlight Shrine**: Nocturnal celestial summit protected by a 12-star gate and 3-beacon constellation restoration puzzle.
  - **Hidden Grove**: Secret cliffside path and skyway with rare collectibles and panoramic views.
- **🕹️ Responsive Platformer Controls**: Velocity-driven locomotion with coyote time, jump buffering, air control, platform momentum transfer, and directional dash boost.
- **📷 3rd-Person Orbit Camera**: Smooth follow camera with spherical mouse drag / touch swipe rotation, zoom, and pitch clamping.
- **⭐ Collectibles & Progression**: 24 glowing Star Fragments and 8 golden Hidden Bells unlocking progression milestones and secret endings.
- **🎶 Web Audio API Synthesizer**: Pure procedural sound engine featuring cute vocal meows, pentatonic collection chimes, bell rings, bounce boings, whooshes, and warm ambient synth pad chords.
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

# Run automated tests
npm test

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
| **Inventory / Journal** | `I` or click backpack button |
| **Camera Orbit** | Left-click & drag mouse |
| **Zoom** | Mouse scroll wheel |
| **Pause / Settings** | `Escape` or Pause button |

### Mobile
- **Move**: Virtual joystick on bottom-left.
- **Camera**: Swipe anywhere across the right side of the screen.
- **Actions**: Tap `Jump`, `Dash`, or `Meow` buttons on bottom-right.
- **Backpack**: Tap the 🎒 button on top-right to manage accessories and check progress.

---

## 📜 License

Created with ❤️ for `xeranov.com`.
