// Asset variables
let cardFrontTexture;
let cardBackTexture;
let backgroundGraphics;

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
                this.amp.setInput(this.audio);
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
//Visual elements for the visualizer: Cards (playing cards - like poker :D)
/*
    GoldenCard represents a single animated card on screen.
    Handles position, velocity, angle, size, suit, color, etc..
*/
class GoldenCard {
    // x, y - position
    constructor(x, y) {
        this.pos = createVector(x, y, random(-50, 50)); // position vector, z for 3d
        this.vel = createVector(random(-1, 1), random(-1, 1));
        this.rotation = createVector(0, 0, random(TWO_PI)); // 3d rotation
        this.rotationSpeed = createVector(random(-0.02, 0.02), random(-0.02, 0.02), random(-0.01, 0.01));//

        this.baseSize = random(20, 60); // size of card
        this.currentSize = this.baseSize;

        this.suit = random(['♠', '♥', '♦', '♣']); // random suit symbol
        this.suitColor = this.suit === '♥' || this.suit === '♦' ? color(160, 32, 17) : color(0); // heart or diamond are red, otherwise black 
        // symbols for the cards
        this.symbolBuffer = createGraphics(100, 140);
        this.drawSymbol();
    }

    drawSymbol() {
        this.symbolBuffer.clear();
        this.symbolBuffer.fill(this.suitColor);
        this.symbolBuffer.textAlign(CENTER, CENTER);
        this.symbolBuffer.textSize(this.symbolBuffer.width * 0.4);
        this.symbolBuffer.text(this.suit, this.symbolBuffer.width / 2, this.symbolBuffer.height / 2);
    }
    
    // function updates card position and angle
    // added: reacts to audio volume
    update(audioLevel = 0, bassEnergy = 0, animSpeed = 1) {
        // Increase velocity slightly based on audio level
        const movementMultiplier = (1 + audioLevel * 3) * animSpeed;
        this.pos.add(this.vel.copy().mult(movementMultiplier));

        // rotate faster with volume
        this.rotation.x += (this.rotationSpeed.x + audioLevel * 0.05) * animSpeed;
        this.rotation.y += (this.rotationSpeed.y + audioLevel * 0.08) * animSpeed;
        this.rotation.z += (this.rotationSpeed.z + audioLevel * 0.03) * animSpeed;
        
        // bass-reactive scaling
        const bassReaction = map(bassEnergy, 0, 255, 1, 2);
        this.currentSize = this.baseSize * (1 + audioLevel * 0.8) * bassReaction; // scale size with volume
        this.wrapScreen();
    }

    // card wrap around canvas edges (prevents the cards from disappearing from canvas)
    wrapScreen() {
        const margin = this.currentSize * 0.6;
        if (this.pos.x < -width/2 - margin) this.pos.x = width/2 + margin;
        if (this.pos.x > width/2 + margin) this.pos.x = -width/2 - margin;
        if (this.pos.y < -height/2 - margin) this.pos.y = height/2 + margin;
        if (this.pos.y > height/2 + margin) this.pos.y = -height/2 - margin;
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
        const cardDepth = 0.5; // defines the thickness of the cards

        // Here drawing each card :D

        // FRONT face asset(image) + symbol
        push();
        translate(0, 0, cardDepth / 2);
        if (cardFrontTexture && cardFrontTexture.width > 0) {
            texture(cardFrontTexture);
        } else {
            // when asset not loaded, card white :c
            fill(255, 255, 255); // white card
        }
        noStroke();
        box(w, h, cardDepth);

        // adding the symbol on top of the asset, card front :D
        if (cardFrontTexture && cardFrontTexture.width > 0) { // if loaded
            // Suit symbol
            push(); 
            translate(0, 0, cardDepth / 2 + 0.01); // positions just in front of the card face
            noStroke();
            texture(this.symbolBuffer);
            plane(w, h);
            pop(); 
        } 

        pop();

        // BACK back asset(image)
        push();
        translate(0, 0, -cardDepth/ 2);
        rotateY(PI);    // flips the back face
        if (cardBackTexture && cardBackTexture.width > 0) {
            texture(cardBackTexture);
        } else {
            fill(255, 0, 0);
        }
        noStroke();
        box(w, h, cardDepth);
        pop();

        
        pop(); // end
    }
}

class SparkleBackground {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.particles = [];
        this.maxParticles = 1000; // max particle count (page's performance improves with less particles)
        this.colorHue = 0; // Starting hue for the color transition
    }

    update() {
        const audioLevel = this.audioManager.getLevel();
        
        // Creates particles only when there's audio
        if (audioLevel > 0.05) {
            let numNewParticles = floor(map(audioLevel, 0, 1, 1, 5));
            
            for (let i = 0; i < numNewParticles; i++) {
                this.particles.push({
                    pos: createVector(width / 2, height / 2),
                    vel: createVector(random(-2, 2), random(-2, 2)),
                    lifespan: 255
                });
            }

            if (numNewParticles > 0) {
                console.log(`Created ${numNewParticles} particles. Total: ${this.particles.length}`);
            }
        }

        

        // this handles particle movement lyfecycle
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].pos.add(this.particles[i].vel);
            this.particles[i].lifespan -= 2;
            
            // Removes "fade" dead particles
            if (this.particles[i].lifespan < 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        backgroundGraphics.background(0, 0, 0, 50);
        
        for (let p of this.particles) {
            backgroundGraphics.stroke(255, 0, 0, p.lifespan);
            backgroundGraphics.strokeWeight(2);
            backgroundGraphics.point(p.pos.x, p.pos.y);
        }
    }
}

// Visualizer Class: manages all cards and animation settings
class VisualizerApp {
    constructor(audioMgr) {
        this.cards = [];
        this.audioManager = audioMgr; // link to audio manager
        this.sparkleBackground = sparkleBackground;
        this.settings = { 
            cardCount: 20,
            bgColor: '#000000',
            animSpeed: 1.0,
        };
    }

    // Initialize cards array with random positions
    initialize() {
        this.cards = [];
        for (let i = 0; i < this.settings.cardCount; i++) {
            // this is WEBGL coordinate system
            this.cards.push(new GoldenCard(random(-width / 2, width / 2), random(-height / 2, height / 2), random(-100, 100)));
        }
        //this.initializeSmoke(); // particle system intializer call
    }


    // Update all cards positions 
    update() {
        this.audioManager.update();
        this.sparkleBackground.update();
        const level = this.audioManager.getLevel(); // get audio amplitude
        const bassEnergy = this.audioManager.getBassEnergy();
        
        for (let card of this.cards) {
            card.update(level, bassEnergy, this.settings.animSpeed);
        }
    }

    // Draws all cards 
    render() {
        background(this.settings.bgColor);


        this.sparkleBackground.render(); 
        // renders background graphic main canvas
        push();
        translate(-width/2, -height/2, -200); // Position of the background plane
        texture(backgroundGraphics);
        noStroke();
        plane(width, height);
        pop();


        // Then renders cards on top
        push();
        camera(0, 0, (height/2) / tan(PI/6), 0, 0, 0, 0, 1, 0);
        for (let card of this.cards) {
            card.render(this.audioManager);
        }
        pop();
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

let app;
let audioManager;

// preload will load the assets :3
function preload() {
    try {
        cardBackTexture = loadImage('assets/card/card-back.png');
        cardFrontTexture = loadImage('assets/card/card-front.png');
    } catch(e) {
        console.log('Could not load card textures:', e);
        cardFrontTexture = null;
        cardBackTexture = null;
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL); // webgl canvas
    // background graphics, it's an offscreen background buffer, doesnt affect the 3d canvas.
    backgroundGraphics = createGraphics(windowWidth, windowHeight); // background sparkle

    audioManager = new AudioManager();
    sparkleBackground = new SparkleBackground(audioManager); // Instance of SparkleBackground Class

    // Initialize visualizer cards
    app = new VisualizerApp(audioManager, sparkleBackground);
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