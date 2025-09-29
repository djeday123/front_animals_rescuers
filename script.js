class AnimalRescueGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.rescuedCount = 0;
        this.gameActive = false;
        this.gameTimer = null;
        this.spawnTimer = null;
        this.animals = [];
        
        // Animal types with their properties
        this.animalTypes = [
            { emoji: '🐶', name: 'Puppy', points: 10, spawnRate: 0.3 },
            { emoji: '🐱', name: 'Kitten', points: 10, spawnRate: 0.3 },
            { emoji: '🐰', name: 'Bunny', points: 15, spawnRate: 0.2 },
            { emoji: '🐹', name: 'Hamster', points: 20, spawnRate: 0.1 },
            { emoji: '🦔', name: 'Hedgehog', points: 25, spawnRate: 0.05 },
            { emoji: '🐸', name: 'Frog', points: 30, spawnRate: 0.03 },
            { emoji: '🐧', name: 'Penguin', points: 50, spawnRate: 0.02 }
        ];
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.elements = {
            scoreDisplay: document.getElementById('score'),
            timerDisplay: document.getElementById('timer'),
            rescuedDisplay: document.getElementById('rescued-count'),
            startButton: document.getElementById('start-button'),
            pauseButton: document.getElementById('pause-button'),
            resetButton: document.getElementById('reset-button'),
            gameMessage: document.getElementById('game-message'),
            animalsContainer: document.getElementById('animals-container'),
            gameOverModal: document.getElementById('game-over-modal'),
            finalScoreMessage: document.getElementById('final-score-message'),
            playAgainButton: document.getElementById('play-again-button')
        };
    }
    
    setupEventListeners() {
        this.elements.startButton.addEventListener('click', () => this.startGame());
        this.elements.pauseButton.addEventListener('click', () => this.pauseGame());
        this.elements.resetButton.addEventListener('click', () => this.resetGame());
        this.elements.playAgainButton.addEventListener('click', () => this.playAgain());
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.gameActive) {
                e.preventDefault();
                this.startGame();
            } else if (e.code === 'Escape' && this.gameActive) {
                e.preventDefault();
                this.pauseGame();
            }
        });
    }
    
    startGame() {
        if (this.gameActive) return;
        
        this.gameActive = true;
        this.updateButtons();
        this.updateMessage('Rescue the animals by clicking on them! 🚨');
        
        // Start game timer
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        // Start spawning animals
        this.spawnAnimals();
        this.spawnTimer = setInterval(() => this.spawnAnimals(), 2000);
    }
    
    pauseGame() {
        if (!this.gameActive) return;
        
        this.gameActive = false;
        clearInterval(this.gameTimer);
        clearInterval(this.spawnTimer);
        this.updateButtons();
        this.updateMessage('Game paused. Click "Start Rescue Mission" to continue!');
    }
    
    resetGame() {
        this.gameActive = false;
        clearInterval(this.gameTimer);
        clearInterval(this.spawnTimer);
        
        this.score = 0;
        this.timeLeft = 60;
        this.rescuedCount = 0;
        this.animals = [];
        
        this.elements.animalsContainer.innerHTML = '';
        this.updateDisplay();
        this.updateButtons();
        this.updateMessage('Welcome! Click "Start Rescue Mission" to begin saving animals!');
        this.elements.gameOverModal.classList.add('hidden');
    }
    
    endGame() {
        this.gameActive = false;
        clearInterval(this.gameTimer);
        clearInterval(this.spawnTimer);
        
        this.updateButtons();
        this.showGameOverModal();
    }
    
    playAgain() {
        this.elements.gameOverModal.classList.add('hidden');
        this.resetGame();
    }
    
    spawnAnimals() {
        if (!this.gameActive) return;
        
        const maxAnimals = 8;
        const currentAnimals = this.elements.animalsContainer.children.length;
        
        if (currentAnimals >= maxAnimals) return;
        
        // Spawn 1-3 animals at a time
        const spawnCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < spawnCount && currentAnimals + i < maxAnimals; i++) {
            this.createAnimal();
        }
    }
    
    createAnimal() {
        // Select animal type based on weighted probability
        const random = Math.random();
        let cumulativeProbability = 0;
        let selectedAnimal = this.animalTypes[0];
        
        for (const animalType of this.animalTypes) {
            cumulativeProbability += animalType.spawnRate;
            if (random <= cumulativeProbability) {
                selectedAnimal = animalType;
                break;
            }
        }
        
        const animal = {
            id: Date.now() + Math.random(),
            ...selectedAnimal,
            timeLeft: Math.random() * 8 + 5 // 5-13 seconds before animal disappears
        };
        
        this.animals.push(animal);
        this.renderAnimal(animal);
        
        // Set timeout for animal to disappear
        setTimeout(() => {
            this.removeAnimal(animal.id);
        }, animal.timeLeft * 1000);
    }
    
    renderAnimal(animal) {
        const animalElement = document.createElement('div');
        animalElement.className = 'animal-card';
        animalElement.dataset.animalId = animal.id;
        
        animalElement.innerHTML = `
            <span class="animal-emoji">${animal.emoji}</span>
            <div class="animal-name">${animal.name}</div>
            <div class="animal-status">+${animal.points} points</div>
        `;
        
        animalElement.addEventListener('click', () => this.rescueAnimal(animal.id));
        
        this.elements.animalsContainer.appendChild(animalElement);
    }
    
    rescueAnimal(animalId) {
        const animal = this.animals.find(a => a.id === animalId);
        if (!animal || !this.gameActive) return;
        
        const animalElement = document.querySelector(`[data-animal-id="${animalId}"]`);
        if (!animalElement) return;
        
        // Add rescued class for animation
        animalElement.classList.add('rescued');
        
        // Update score and rescued count
        this.score += animal.points;
        this.rescuedCount++;
        this.updateDisplay();
        
        // Show rescue message
        this.updateMessage(`Great! You rescued a ${animal.name}! +${animal.points} points! 🎉`);
        
        // Remove animal after animation
        setTimeout(() => {
            this.removeAnimal(animalId);
        }, 600);
        
        // Remove from animals array
        this.animals = this.animals.filter(a => a.id !== animalId);
    }
    
    removeAnimal(animalId) {
        const animalElement = document.querySelector(`[data-animal-id="${animalId}"]`);
        if (animalElement) {
            animalElement.remove();
        }
        
        // Remove from animals array if still there
        this.animals = this.animals.filter(a => a.id !== animalId);
    }
    
    updateDisplay() {
        this.elements.scoreDisplay.textContent = this.score;
        this.elements.timerDisplay.textContent = this.timeLeft;
        this.elements.rescuedDisplay.textContent = this.rescuedCount;
    }
    
    updateButtons() {
        if (this.gameActive) {
            this.elements.startButton.textContent = 'Resume Mission';
            this.elements.startButton.disabled = true;
            this.elements.pauseButton.disabled = false;
        } else {
            this.elements.startButton.textContent = this.timeLeft === 60 ? 'Start Rescue Mission' : 'Resume Mission';
            this.elements.startButton.disabled = false;
            this.elements.pauseButton.disabled = true;
        }
    }
    
    updateMessage(message) {
        this.elements.gameMessage.textContent = message;
    }
    
    showGameOverModal() {
        let grade = '';
        let message = '';
        
        if (this.rescuedCount === 0) {
            grade = '😢';
            message = 'No animals rescued this time.';
        } else if (this.rescuedCount < 5) {
            grade = '🌟';
            message = 'Good effort! Keep practicing!';
        } else if (this.rescuedCount < 10) {
            grade = '⭐⭐';
            message = 'Great job! You\'re a good rescuer!';
        } else if (this.rescuedCount < 15) {
            grade = '⭐⭐⭐';
            message = 'Excellent! You\'re an animal hero!';
        } else {
            grade = '🏆';
            message = 'Outstanding! You\'re a rescue legend!';
        }
        
        this.elements.finalScoreMessage.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 15px;">${grade}</div>
            <p><strong>Final Score:</strong> ${this.score}</p>
            <p><strong>Animals Rescued:</strong> ${this.rescuedCount}</p>
            <p style="margin-top: 15px; color: #00b894;">${message}</p>
        `;
        
        this.elements.gameOverModal.classList.remove('hidden');
        
        // Update final message
        this.updateMessage(`Mission complete! You rescued ${this.rescuedCount} animals and scored ${this.score} points! ${grade}`);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AnimalRescueGame();
});

// Add some visual effects for better user experience
document.addEventListener('DOMContentLoaded', () => {
    // Add subtle animations to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (!button.disabled) {
                button.style.transform = 'translateY(-2px)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (!button.disabled) {
                button.style.transform = 'translateY(0)';
            }
        });
    });
});