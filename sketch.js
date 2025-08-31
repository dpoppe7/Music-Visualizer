// Asset variables
let cardFrontTexture;
let cardBackTexture;

// Audio manager class: audio control
class AudioManager{
    constructor() {
        this.audio = null;
        this.isLoaded = false;
        this.isPlaying = false;
        this.amp = new p5.Amplitude(); // analyze volume. 
        // analyze must be called prior to getEnergy():
        this.fft = new p5.FFT(0.3, 512); // analysis algorithm that isolates individual audio frequencies within a waveform. Documentation: https://p5js.org/reference/p5.sound/p5.FFT/
    }

    update() {
        if (this.isLoaded && this.isPlaying) {
            this.fft.analyze(); // must be called before getEnergy()
        }
    }
    
    loadAudio(file, callback) {
        if (this.audio) this.audio.stop();
            this.audio = loadSound(file, () => {
                this.fft.setInput(this.audio); // Set the input source for the FFT analysis. If no source is provided, FFT will analyze all sound in the sketch.
                this.isLoaded = true;
                console.log('Audio loaded');
                callback && callback();
        });
    }

    // play if loaded
    play() {
        if (this.isLoaded && !this.isPlaying) {
            this.audio.play();
            this.isPlaying = true;
        }
    }

    pause() {
        if (this.isLoaded && this.isPlaying) {
            this.audio.pause(); 
            this.isPlaying = false;
        }
    }

    // stop if audio playing
    stop() {
        if (this.isLoaded) {
            this.audio.stop();
            this.isPlaying = false;
        }
    }

    // toggle play/pause
    toggle() {
        this.isPlaying ? this.pause() : this.play();
    }

    getLevel() {
        if (this.isLoaded && this.isPlaying) {
            return this.amp.getLevel();
        }
        return 0;
    }

    // Returns the amount of energy (volume) at a specific frequency, or the average amount of energy between two frequencies. 
    // Accepts Number(s) corresponding to frequency (in Hz), or a "string" corresponding to predefined frequency ranges ("bass", "lowMid", "mid", "highMid", "treble")
    // Documentation: https://p5js.org/reference/p5.sound/p5.FFT/
    
    getBassEnergy() {
        if (!this.isLoaded || !this.isPlaying) return 0;
        this.fft.analyze(); // Ensure analysis is current
        return this.fft.getEnergy("bass");
    }

    getMidEnergy() {
        if (!this.isLoaded || !this.isPlaying) return 0;
        this.fft.analyze();
        return this.fft.getEnergy("mid");
    }

    getTrebleEnergy() {
        if (!this.isLoaded || !this.isPlaying) return 0;
        this.fft.analyze();
        return this.fft.getEnergy("treble");
    }
}
//Visual elements for the visualizer: Cards (playing cards like poker :D)
/*
    GoldenCard represents a single animated card on screen.
    Handles position, velocity, angle, size, suit, and color.
*/
class GoldenCard {
    // x, y - position
    constructor(x, y, z) {
        this.pos = createVector(x, y, z); // position vector, z for 3d
        // this.vel = createVector(random(-1, 1), random(-1, 1)); // velocity: random movement
        this.vel = p5.Vector.random3D().mult(random(0.5, 1.5));
        // this.vel = p5.Vector.random3D().mult(random(0.5, 1.5)); // velocitry 3d test
        this.rotation = p5.Vector.random3D().mult(random(0.01, 0.05)); // 3d rotation
        this.rotationSpeed = p5.Vector.random3D().mult(random(0.001, 0.005)); //

        // this.angle = random(TWO_PI); // rotation angle

        this.suit = random(['♠', '♥', '♦', '♣']); // random suit symbol
        this.baseSize = random(40, 80); // size of card
        this.currentSize = this.baseSize;
        this.suitColor = this.suit === '♥' || this.suit === '♦' ? color(220, 20, 60) : color(0); // heart or diamond are red, otherwise black 

        // (improved visual effects on cards) 
        // properties: wave rings on cards
        // this.wavePhase = random(TWO_PI);
        // this.waveSpeed = random(0.02, 0.05);
        // this.numRings = 8; // number of wwave rings
    }

    // renderWavesOnCard(w, h) {
    //     push();

    //     // Creates the radial wave pattern
    //     for (let ring = 0; ring < this.numRings; ring++) { // This loop iterates to create multiple rings
    //         const ringRadius = map(ring, 0, this.numRings - 1, w * 0.4, w * 0.05);
    //         const waveHeight = map(ring, 0, this.numRings - 1, 8, 3);
    //         const opacity = map(ring, 0, this.numRings - 1, 80, 120);
            
    //         stroke(255, 255, 255, opacity);
    //         strokeWeight(0.5);
    //         noFill();
            
    //         beginShape();
    //         for (let angle = 0; angle < TWO_PI + 0.1; angle += 0.1) {
    //             const waveOffset = sin(this.wavePhase + angle * 6 + ring * 0.5) * waveHeight;
    //             const r = ringRadius + waveOffset;
    //             const x = cos(angle) * r;
    //             const y = sin(angle) * r;
    //             vertex(x, y);
    //         }
    //         endShape();
    //     }
        
    //     pop();
    // }

    // this function adds radial lines from center of the card.
    // renderRadialLinesOnCard(w, h) {
    //     stroke(255, 255, 255, 60);
    //     strokeWeight(0.3);
        
    //     const numLines = 24; // Number of lines radiating from center
    //     for (let i = 0; i < numLines; i++) {
    //         const angle = map(i, 0, numLines, 0, TWO_PI);
    //         const lineLength = w * 0.45;
            
    //         // Add subtle shimmer to lines
    //         const shimmer = sin(this.wavePhase + i * 0.3) * 3;
    //         const x1 = cos(angle) * (lineLength + shimmer);
    //         const y1 = sin(angle) * (lineLength + shimmer);
            
    //         line(0, 0, x1, y1);
    //     }
    // }

    // function updates card position and angle
    // added: reacts to audio volume
    update(audioLevel = 0, bassEnergy = 0, animSpeed = 1) {
        // Increase velocity slightly based on audio level
        this.pos.add(this.vel.copy().mult((1 + audioLevel * 5) * animSpeed));

        // this.angle += (0.01 + audioLevel * 0.05) * animSpeed; // rotate faster with volume
        this.rotation.add(p5.Vector.mult(this.rotation, (1 + audioLevel * 2) * animSpeed));
        
        // // Animating the wave pattern
        // this.wavePhase += this.waveSpeed * animSpeed;

        // also assing bass-reactive scaling
        const bassReaction = map(bassEnergy, 0, 255, 1, 2);
        this.currentSize = this.baseSize * (1 + audioLevel * 1.5) * bassReaction; // scale size with volume
        this.wrapScreen();
    }

    // card wrap around canvas edges (prevents the cards from disappearing from canvas)
    wrapScreen() {
        const margin = this.currentSize * 0.6;
        if (this.pos.x < -margin) this.pos.x = width + margin;
        if (this.pos.x > width + margin) this.pos.x = -margin;
        if (this.pos.y < -margin) this.pos.y = height + margin;
        if (this.pos.y > height + margin) this.pos.y = -margin;

        if (this.pos.z < -100) this.pos.z = 100;
        if (this.pos.z > 100) this.pos.z = -100;
    }

    render(audioManager) {
        push(); // start of properties
        translate(this.pos.x, this.pos.y, this.pos.z);
        // rotate(this.angle);
        rotateX(this.rotation.x);
        rotateY(this.rotation.y);
        rotateZ(this.rotation.z);

        const w = this.currentSize;
        const h = w * 1.4;

        // Here drawing each card :D
        // FRONT face asset(image) + symbol
        push();
        translate(0, 0, 1);
        if (cardFrontTexture && cardFrontTexture.width > 0) {
            texture(cardFrontTexture);
        } else {
            // asset not loaded :c
            fill(255, 255, 255); // white card
        }
        noStroke();
        plane(w, h);

        // adding the symbol on top of the asset :D
         if (cardFrontTexture && cardFrontTexture.width > 0) { // if loaded
            // Suit symbol
            push(); 
            translate(0, 0, 1.1); // sligthly above texture
            fill(this.suitColor);
            textAlign(CENTER, CENTER);
            textSize(w * 0.4);
            text(this.suit, 0, 0);
            pop(); 
        } 
        pop();

        // BACK back asset(image)
        push();
        translate(0, 0, -1);
        rotateY(PI);    // flips the back face
        if (cardBackTexture && cardBackTexture.width > 0) {
            texture(cardBackTexture);
        } else {
            fill(255, 0, 0);
        }
        noStroke();
        plane(w, h);
        pop();
        
        pop(); // end
        
        // Shadow
        // push();
        // translate(3, 3);
        // fill(0, 0, 0, 100);
        // noStroke();
        // rect(-w/2, -h/2, w, h, 10);
        // pop();
        
        // Inner border
        // fill(255, 235, 59);
        // noStroke();
        // const innerW = w * 0.9;
        // const innerH = h * 0.9;
        // rect(-innerW/2, -innerH/2, innerW, innerH, 8);

        // Metallic silver/gold card base
        // fill(220, 220, 230); // yellow
        // fill(0, 0, 20); // blue
        // stroke(200, 200, 210);
        // strokeWeight(5);
        // rect(-w/2, -h/2, w, h, 8);

        // // Render the concentric wave pattern
        // this.renderWavesOnCard(w, h);
        
        // // Render radial lines
        // this.renderRadialLinesOnCard(w, h);
        
        
    }
}

// particle system
// class SmokeParticle {
//     constructor() {
//         this.reset();
//         this.age = random(this.lifetime * 0.5);
//     }
    
//     reset() {
//         this.pos = createVector(random(width), height + 50);
//         this.vel = createVector(random(-0.5, 0.5), random(-2, -0.5));
//         this.size = random(30, 80);
//         this.maxSize = this.size * random(1.5, 2.5);
//         this.lifetime = random(200, 400);
//         this.age = 0;
//         this.noiseOffset = random(1000);
//     }
    
//     update(audioManager, animSpeed = 1) {
//         // Organic movement with noise
//         const noiseForce = createVector(
//             noise(this.pos.x * 0.01, millis() * 0.0005 + this.noiseOffset) - 0.5,
//             noise(this.pos.y * 0.01, millis() * 0.0005 + this.noiseOffset + 1000) - 0.5
//         );
        
//         noiseForce.mult(0.2);
//         this.vel.add(noiseForce);
//         this.vel.mult(0.99);
        
//         this.pos.add(p5.Vector.mult(this.vel, animSpeed));
//         this.age += animSpeed;
        
//         // Size evolution
//         this.size = lerp(this.size, this.maxSize, 0.01);
        
//         // Reset if too old
//         if (this.age > this.lifetime) {
//             this.reset();
//         }
//     }
    
//     render() {
//         push();
//         translate(this.pos.x, this.pos.y);
        
//         const ageRatio = this.age / this.lifetime;
//         const alpha = map(ageRatio, 0, 1, 60, 0);
        
//         fill(200, 220, 255, alpha);
//         noStroke();
//         ellipse(0, 0, this.size);
        
//         pop();
//     }
// }


// Visualizer Class: manages all cards and animation settings
class VisualizerApp {
    constructor(audioMgr) {
        this.cards = [];
        this.audioManager = audioMgr; // link to audio manager
        // this.smokeParticles = []; // particles system "floating spheres"
        // this.particleTrails = []; // particles systme trail :D
        this.settings = { 
            cardCount: 20,
            bgColor: '#000000',
            animSpeed: 1.0,
        };
    }

    // initialize smoke particle system
    // initializeSmoke() {
    //     this.smokeParticles = [];
    //     for (let i = 0; i < 30; i++) {
    //         this.smokeParticles.push(new SmokeParticle());
    //     }
    // }

    // Initialize cards array with random positions
    initialize() {
        this.cards = [];
        for (let i = 0; i < this.settings.cardCount; i++) {
            this.cards.push(new GoldenCard(random(-width / 2, width / 2), random(-height / 2, height / 2), random(-100, 100)));
        }
        //this.initializeSmoke(); // particle system intializer call
    }

    // Not using particle trails yet
    // updateTrails() {
    //     if (this.settings.particleTrails) {
    //         // Add trail points at mouse position
    //         this.particleTrails.push({
    //             pos: createVector(mouseX, mouseY), // reacts to mouse movement
    //             life: 60 // how many frames the trail point will last before it disappears
    //         });
            
    //         // Update and remove old trails
    //         for (let i = this.particleTrails.length - 1; i >= 0; i--) {
    //             this.particleTrails[i].life--;
    //             if (this.particleTrails[i].life <= 0) {
    //                 this.particleTrails.splice(i, 1);
    //             }
    //         }
    //     }
    // }

    // renderTrails() {
    //     if (this.settings.particleTrails && this.particleTrails.length > 1) {
    //         stroke(255, 215, 0, 100);
    //         strokeWeight(2);
    //         noFill();
            
    //         // creating partile shape
    //         beginShape();
    //         for (let trail of this.particleTrails) {
    //             const alpha = map(trail.life, 0, 60, 0, 100);
    //             vertex(trail.pos.x, trail.pos.y);
    //         }
    //         endShape();
    //     }
    // }


    // Update all cards positions 
    update() {
        this.audioManager.update();
        const level = this.audioManager.getLevel(); // get audio amplitude
        const bassEnergy = this.audioManager.getBassEnergy();
        
        for (let card of this.cards) {
            card.update(level, bassEnergy, this.settings.animSpeed);
        }

        // Updates smoke particles
        // for (let particle of this.smokeParticles) {
        //     particle.update(this.audioManager, this.settings.animSpeed);
        // }

        // updates trail particles
        // this.updateTrails();
    }

    // Draws all cards 
    render() {
        background(this.settings.bgColor);

        // Might add this later: Bass-reactive background pulse
        // if (this.audioManager.isLoaded && this.audioManager.isPlaying) {
        //     const bassEnergy = this.audioManager.getBassEnergy();
        //     const bassPulse = map(bassEnergy, 0, 255, 0, 30);
        //     fill(255, 215, 0, bassPulse);
        //     noStroke();
        //     ellipse(width/2, height/2, width * 1.5, height * 1.5);
        // }

        // Renders smoke particles first (background)
        // for (let particle of this.smokeParticles) {
        //     particle.render();
        // }

        // Rendera particle trails
        // this.renderTrails();

        // Then renders cards on top
        for (let card of this.cards) {
            card.render(this.audioManager);
        }
    }

    // dynamically update card count
    setCardCount(count) {
        this.settings.cardCount = count;
        this.initialize(); // re-initialize cards
    }

    updatePlayButton() {
        const playIcon = document.getElementById('playIcon');
        const playText = document.getElementById('playText');
        
        if (this.audioManager.isPlaying) {
            playIcon.textContent = '⏸️';
            playText.textContent = 'Pause';
        } else {
            playIcon.textContent = '▶️';
            playText.textContent = 'Play';
        }
    }

    setupEventListeners() {
        const fileInput = document.getElementById('audioUpload');   // file
        const playBtn = document.getElementById('playPause');   // play
        const stopBtn = document.getElementById('stop');    // stop
        const cardSlider = document.getElementById('cardCountSlider');  // slider nume of cards
        const cardLabel = document.getElementById('cardCountLabel');    
        const bgColorInput = document.getElementById('bgColor');    // background color
        const animSpeedSlider = document.getElementById('animSpeed');   // animation
        const animSpeedValue = document.getElementById('animSpeedValue');

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.loadAudioFile(e.target.files[0]);
            }
        });

        playBtn.addEventListener('click', () => {
            this.audioManager.toggle();
            this.updatePlayButton();
            // console.log('Audio playing:', this.audioManager.isPlaying);
        });

        stopBtn.addEventListener('click', () => {
            this.audioManager.stop();
            this.updatePlayButton();
        });

        cardSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            cardLabel.textContent = val;
            this.setCardCount(val);
        });

        bgColorInput.addEventListener('input', (e) => {
            this.settings.bgColor = e.target.value;
        });

        animSpeedSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            animSpeedValue.textContent = val.toFixed(1);
            this.settings.animSpeed = val;
        });

        this.setupDropZone();
    }

    // drag-and-drop event listeners for the drop zone
    setupDropZone() {
        const dropZone = document.getElementById('dropZone');

        dropZone.addEventListener('click', () => {
            document.getElementById('audioUpload').click();  // Clicking the drop zone opens the file browser
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over'); // Add hover styles effect - visual feedback for dragging
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over'); // Add hover styles effect - visual feedback for dragging
        });

        // Handlea the dropped file
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.includes('audio')) {
            this.loadAudioFile(files[0]);
            }
        });
    }

    loadAudioFile(file) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.classList.add('visible');

        this.audioManager.loadAudio(file, () => {
            loadingIndicator.classList.remove('visible');
            console.log('Audio loaded successfully');
            this.hideDropZone();
        });
    }

    hideDropZone() {
        document.getElementById('dropZone').classList.add('hidden');
    }
}

// Test: Visualizer app class - working
let app;
let audioManager;
// preload will load the assets :3
function preload() {
    try {
        cardFrontTexture = loadImage('assets/card/card-front.jpg');
        cardBackTexture = loadImage('assets/card/card-back.jpg');
    } catch(e) {
        console.log('Could not load card textures:', e);
        cardFrontTexture = null;
        cardBackTexture = null;
    }
}

function setup() {
    // createCanvas(windowWidth, windowHeight); //size of screen
    createCanvas(windowWidth, windowHeight, WEBGL); // webgl canvas
    audioManager = new AudioManager();

    // Initialize visualizer cards
    app = new VisualizerApp(audioManager);
    app.initialize();
    app.setupEventListeners();
}

function draw() {
    app.update();
    app.render();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}