//Visual elements for the visualizer: Cards (playing cards like poker :D)
/*
    GoldenCard represents a single animated card on screen.
    Handles position, velocity, angle, size, suit, and color.
*/
class GoldenCard {
    // x, y - position
    constructor(x, y) {
        this.pos = createVector(x, y); // position vector
        this.vel = createVector(random(-1, 1), random(-1, 1)); // velocity: random movement
        this.angle = random(TWO_PI); // rotation angle
        this.suit = random(['♠', '♥', '♦', '♣']); // random suit symbol
        this.baseSize = random(40, 80); // of card
        this.currentSize = this.baseSize;
        this.suitColor = this.suit === '♥' || this.suit === '♦' ? color(220, 20, 60) : color(0); // red hear or black diamos
    }

    // function updates card position and angle
    update() {
        this.pos.add(this.vel);
        this.angle += 0.01;
        this.wrapScreen();
    }

    // card wrap around canvas edges (prevents the cards from disappearing from canvas)
    wrapScreen() {
        const margin = this.currentSize * 0.6;
        if (this.pos.x < -margin) this.pos.x = width + margin;
        if (this.pos.x > width + margin) this.pos.x = -margin;
        if (this.pos.y < -margin) this.pos.y = height + margin;
        if (this.pos.y > height + margin) this.pos.y = -margin;
    }

    render() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);
        rectMode(CENTER);
        fill(255, 215, 0); // golden card
        rect(0, 0, this.currentSize, this.currentSize * 1.4, 10);

        fill(this.suitColor);
        textAlign(CENTER, CENTER);
        textSize(this.currentSize * 0.4);
        text(this.suit, 0, 0);
        pop();
    }
}


// Visualizer Class: manages all cards and animation settings
class VisualizerApp {
    constructor() {
        this.cards = []; // array of GoldenCard
        this.settings = { cardCount: 20, animSpeed: 1.0 }; // adjustable parameters
    }

    // Initialize cards array with random positions
    initialize() {
        this.cards = [];
        for (let i = 0; i < this.settings.cardCount; i++) {
            this.cards.push(new GoldenCard(random(width), random(height)));
        }
    }

    // Update all cards positions 
    update() {
        for (let card of this.cards) card.update();
    }

    // Draws all cards 
    render() {
        background(0);
        for (let card of this.cards) card.render();
    }
    // render() {
    //     if (this.audioManager.isLoaded) {
    //         const bassPulse = map(this.audioManager.bassEnergy, 0, 255, 0, 30);
    //         fill(255, 215, 0, bassPulse); // Golden glow
    //         noStroke();
    //         ellipse(width/2, height/2, width * 1.5, height * 1.5);
    //     }
    // }
}

// Test: Visualizer app class - working
let app;

function setup() {
    createCanvas(windowWidth, windowHeight); //size of screen
    background(0);
    app = new VisualizerApp();
    app.initialize();
}

function draw() {
    app.update();
    app.render();
}