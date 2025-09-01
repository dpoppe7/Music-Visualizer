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

        this.audio.onended(() => {
            if (this.audio.duration() - this.audio.currentTime() < 0.1) {
                this.audio.stop();
                this.isPlaying = false;
                app.updatePlayButton(); // when sound ends, updates button back to 'play'
            }
        });
    }

    // play if loaded
    play() {
        if (this.isLoaded && !this.isPlaying) {
            //checking if song has ended to restart it
            if (this.audio.duration() - this.audio.currentTime() < 0.1) {
                this.audio.jump(0);
            }

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