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