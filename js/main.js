// Global variables
let app;
let audioManager;
let sparkleBackground;
let cardFrontTexture;
let cardBackTexture;
let backgroundGraphics;

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
    backgroundGraphics.resizeCanvas(windowWidth, windowHeight);
}