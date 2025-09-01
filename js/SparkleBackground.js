class SparkleBackground {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.particles = [];
        this.maxParticles = 1000; // max particle count (page's performance improves with less particles)
        this.colorHue = 0; // Starting hue for the color transition
    }

    update() {
        const audioLevel = this.audioManager.getLevel();
        const bassEnergy = this.audioManager.getBassEnergy();

        //transitions the hue 
        // this.colorHue = (this.colorHue + 0.1) % 50;
        this.colorHue = (this.colorHue + 0.1) % 180 + 240;
        
        // Creates particles only when there's audio
        if (audioLevel > 0.05) {
            let numNewParticles = floor(map(audioLevel, 0, 1, 1, 10));
            numNewParticles += floor(map(bassEnergy, 0, 255, 0, 20));

            if (this.particles.length + numNewParticles > this.maxParticles) {
                numNewParticles = this.maxParticles - this.particles.length;
            }
            
            for (let i = 0; i < numNewParticles; i++) {
                // Passing the current hue to the new particle
                let angle = random(TWO_PI);
                let speed = map(audioLevel, 0, 1, 0.5, 5) + map(bassEnergy, 0, 255, 0, 3);
                let vel = p5.Vector.fromAngle(angle, speed);
                this.particles.push({
                    pos: createVector(width / 2, height / 2),
                    vel: vel,
                    lifespan: 255,
                    size: random(0.5, 2.5),
                    hue: this.colorHue
                });
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
        //Draws a semi-transparent rectangle
        backgroundGraphics.noStroke();
        backgroundGraphics.background(0, 50);
        
        backgroundGraphics.beginShape(POINTS);
        for (let p of this.particles) {
            let alpha = map(p.lifespan, 0, 255, 0, 255); //lifespan to a fading alpha value
            backgroundGraphics.stroke(p.hue, 250, 190, alpha);
            // backgroundGraphics.stroke(p.hue, 227, 160, alpha); // Draw the main sparkle in transparent white
            backgroundGraphics.strokeWeight(p.size);
            
            // bright flash effect for bass hits
            let bassEnergy = this.audioManager.getBassEnergy();
            if (bassEnergy > 150) {
                backgroundGraphics.stroke(p.hue, 255, 255, alpha); // A brighter white flash for bass hits
                backgroundGraphics.strokeWeight(p.size);
            }
            backgroundGraphics.vertex(p.pos.x, p.pos.y);
        }

        backgroundGraphics.endShape();
    }
}