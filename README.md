# 🎵 Music-Visualizer
> A responsive and interactive music visualizer that reacts to music, built with p5.js and p5.sound.

#### Live Demo: https://music-visualizer-dpoppe7.netlify.app

## Inspiration + Process
This music visualizer is inspired by a deck of cards I bought in Las Vegas. The 2D background is a particle system that creates a fading sparkle effect. It's a separate layer that is rendered first. On top of that, there is the 3D space using WebGL to render the cards.

The cards themselves are not complex models. I simply scanned one of my card's front and back and applied those images as textures to thin boxes using WebGL. This approach makes them look realistic as they move, rotate, and react to the music. The 2D sparkle background is rendered onto a large plane positioned behind the cards in 3D space, creating depth while keeping the cards "floating". This made them look realistic as they move and spin. (I was quite excited seeing the cards on the screen :D)

## Technical Features

#### Audio-Reactive Animation

- Real-time FFT Analysis: Uses p5.sound's FFT to analyze frequency data (bass, mid, treble)
- Amplitude Detection: Cards scale and move faster based on audio volume
- Bass Response: Particle bursts and card size scaling react specifically to bass frequencies
- Dynamic Particle Generation: Creates 1-1000 sparkle particles based on audio intensity

3D Rendering System

- WebGL Integration: 3D scene
- Texture Mapping: Real card scans applied to 3D box primitives
- Dual-sided Cards: Front face shows suit symbols, back shows card design (sybmbol generated dynamically)
- 3D Rotations: Cards rotate on X, Y, Z axes with audio-reactive speed (speed adjustable)

Layered Visual 

- Background Layer: 2D particle system rendered to offscreen buffer
- 3D Scene: Cards float in WebGL space 
- Composite Rendering: Background plane positioned behind cards in 3D space

## Class Architecture

### Classes and dependencies
AudioManager
- Handles: Audio loading, playback control, FFT analysis
- Dependencies: p5.sound library **(version 1.11.10)**
- Provides: Volume levels, frequency data (bass/mid/treble)

GoldenCard
- Handles: Individual card physics, rendering, audio response  
- Dependencies: p5.js core, AudioManager data
- Features: 3D position/rotation, texture mapping, screen wrapping (infinite, continuous movement loop for the cards)

SparkleBackground  
- Handles: 2D particle system, color transitions
- Dependencies: AudioManager for reactive particle generation
- Renders: Sparkles with lifespan-based fading, bass-reactive flashes

VisualizerApp (Main Controller)
- Handles: Scene management, user controls, card collection
- Dependencies: All other classes
- Manages: Card array, settings, play/pause states
- Coordinates: Audio analysis | visual updates | rendering

Main Entry Point (main.js)
- Handles: p5.js lifecycle, asset loading, canvas setup
- Dependencies: All classes, WebGL context
- Orchestrates: Setup, draw loop, window resizing

## Key Technical Implementation

#### 3D Scene Setup:
- Background particles rendered to offscreen graphics buffer
- Buffer applied as texture to large plane positioned at z: -500
- Cards rendered in positive Z space (closer to camera)

#### Audio Processing:
- FFT analyzes 512 frequency bins with 0.3 smoothing
- Amplitude analysis for general volume response (cards respond to amplitude)
- Predefined frequency ranges ("bass", "mid", "treble") for targeted reactions
- Real-time analysis in update loop when audio playing

## Performance Optimizations:

Particle count limited to 1000 maximum (rendering starts to slow down the more particle count)

Dead particles removed from array each frame

Efficient texture reuse across card instances

## Features

★ Drag & Drop: Load audio files by dropping them onto the interface
★ Playback Controls: Play, pause, and stop functionality
★ Dynamic Settings: Adjust card count (20-40) and animation speed (1x-5x). Re-renders dynamically 
★ Responsive Design: Adapts to different screen sizes
★ File Support: MP3, WAV, and OGG audio formats
★ Collapsible UI: Clean interface that can be hidden during visualization

## Setup

1. Clone the repository
2. For custom card textures: add the texture or images to assets/card/ (card-front.png, card-back.png)
3. For custom icon display on app load ("drop music file"): Add a music icon to assets/ (music-icon.jpeg)
4. Open index.html in a web browser - Can use live server during development
5. Load an audio file and enjoy the visualization!

## Dependencies

p5.js - Creative coding library **(version 1.11.10)**
p5.sound - Audio analysis and playback **(version 1.11.10)**
- For visualization in p5.js' Web editor, be sure to use version 1.11.10 **and** in the settings option, turn ON the p5.sound.js add-on library.
Live code on p5' Web editor: https://editor.p5js.org/dpoppe7/sketches/IvaOTfa6E