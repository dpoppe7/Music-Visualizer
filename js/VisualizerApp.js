// Visualizer Class: manages all cards and animation settings
class VisualizerApp {
    constructor(audioMgr) {
        this.cards = [];
        this.audioManager = audioMgr; // link to audio manager
        this.sparkleBackground = sparkleBackground;
        this.settings = { 
            cardCount: 20,
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
        this.sparkleBackground.update(); // 2d background particles
        const level = this.audioManager.getLevel(); // get audio amplitude
        const bassEnergy = this.audioManager.getBassEnergy();
        
        for (let card of this.cards) {
            card.update(level, bassEnergy, this.settings.animSpeed);
        }
    }

    // Draws all cards 
    render() {
        background(0); // bakground always black

        this.sparkleBackground.render(); //Renders the 2D background first

        // setting up 3d scene for the cards
        push();
        camera(0, 0, (height/2) / tan(PI/6), 0, 0, 0, 0, 1, 0);

        // renders background graphic main canvas
        push();
        translate(0, 0, -500); // Position of the background plane
        noStroke();
        texture(backgroundGraphics);
        plane(width * 1.5, height * 1.5); // increased plane to cover view
        pop();

        // Then renders cards on top
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
            playIcon.textContent = '⏸';
            playText.textContent = 'Pause';
        } else {
            playIcon.textContent = '▶';
            playText.textContent = 'Play';
        }
    }

    setupEventListeners() {
        const controlPanel = document.getElementById('controlPanel');
        const fileInput = document.getElementById('audioUpload');   // file
        const playBtn = document.getElementById('playPause');   // play
        const stopBtn = document.getElementById('stop');    // stop
        const cardSlider = document.getElementById('cardCountSlider');  // slider nume of cards
        const cardLabel = document.getElementById('cardCountLabel');    
        const animSpeedSlider = document.getElementById('animSpeed');   // animation
        const animSpeedValue = document.getElementById('animSpeedValue');
        const fileNameDisplay = document.getElementById('fileNameDisplay')

        controlPanel.addEventListener('click', (e) => {
            const rect = controlPanel.getBoundingClientRect();
            const clickX = e.clientX - rect.left;

            if ((clickX > rect.width && clickX <= rect.width + 32) || controlPanel.classList.contains('collapsed')) {
                controlPanel.classList.toggle('collapsed');
                e.stopPropagation();
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                fileNameDisplay.textContent = `Loading: ${file.name}`;
                this.loadAudioFile(file);
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
        const dropZoneH3 = dropZone.querySelector('h3');
        const dropZoneDefaultText = dropZoneH3.textContent;

        dropZone.addEventListener('click', () => {
            document.getElementById('audioUpload').click();  // Clicking the drop zone opens the file browser
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over'); // Add hover styles effect - visual feedback for dragging

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                dropZoneH3.textContent = `Drop to play "${files[0].name}"`;
            }
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over'); // Add hover styles effect - visual feedback for dragging
            dropZoneH3.textContent = dropZoneDefaultText;
        });

        // Handlea the dropped file
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            dropZoneH3.textContent = dropZoneDefaultText;

            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.includes('audio')) {
            this.loadAudioFile(files[0]);
            }
        });
    }

    loadAudioFile(file) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const fileNameDisplay = document.getElementById('fileNameDisplay')

        loadingIndicator.classList.add('visible');
        fileNameDisplay.textContent = `Loading: ${file.name}`;

        this.audioManager.loadAudio(file, () => {
            loadingIndicator.classList.remove('visible');
            fileNameDisplay.textContent = file.name;
            console.log('Audio loaded successfully');
            this.hideDropZone();
        });
    }

    hideDropZone() {
        document.getElementById('dropZone').classList.add('hidden');
    }
}