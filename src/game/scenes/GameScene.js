// GameScene.js - Updated with asset generator
import Phaser from 'phaser';
import AssetGenerator from '../utils/AssetGenerator';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state
        this.selectedAnimal = 'dog';
        this.score = 0;
        this.level = 1;
        this.isAiming = false;
        
        // Animal stats from blockchain
        this.animalStats = {
            dog: { power: 70, speed: 60, ability: 'explosive' },
            cat: { power: 60, speed: 80, ability: 'split' },
            rabbit: { power: 50, speed: 90, ability: 'bounce' },
            hamster: { power: 40, speed: 70, ability: 'roll' },
            parrot: { power: 45, speed: 85, ability: 'fly' }
        };
    }

    preload() {
        // Use asset generator to create simple sprites
        this.assetGenerator = new AssetGenerator(this);
        this.assetGenerator.preload();
    }

    create() {
        // World setup
        this.physics.world.gravity.y = 800;

        // Установим границы мира больше, чем экран
        // Оставляем место для UI панели
        const playableHeight = 640;  // 720 - 80 для UI панели
        this.physics.world.setBounds(0, 0, 2000, playableHeight);
        
        // Background - используем уже созданный спрайт 'sky'
        this.add.image(1000, 360, 'sky').setScale(2, 1);
        
        // Ground - тоже шире
        this.ground = this.physics.add.staticGroup();
        this.ground.create(1000, playableHeight - 30, 'ground').setScale(4, 1).refreshBody();
    
        
        // Установим границы камеры
        this.cameras.main.setBounds(0, 0, 2000, playableHeight);

        // Launcher - ТОЛЬКО ОДИН РАЗ
        this.launcher = this.add.image(150, 550, 'launcher');
        this.launcher.setScale(1);
        
        // Aiming mechanics
        this.aimLine = this.add.graphics();
        this.powerBar = this.add.graphics();
        
        // Groups
        this.animals = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.structures = this.physics.add.group();
        
        // Create level
        this.createLevel();
        
        // Input handling
        this.setupInput();
        
        // UI
        this.createUI();
        
        // Collisions
        this.setupCollisions();
        
        // Particles
        this.createParticleEmitters();
    }

    createLevel() {
        // Create structures
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                const x = 800 + i * 100;
                const y = 650 - j * 80;
                const block = this.physics.add.image(x, y, 'wood');
                block.setScale(0.8);
                block.health = 100;
                this.structures.add(block);
            }
        }
        
        // Create enemies
        const enemy1 = this.physics.add.image(850, 500, 'enemy');
        enemy1.setScale(0.8);
        enemy1.health = 50;
        this.enemies.add(enemy1);
        
        const enemy2 = this.physics.add.image(950, 500, 'enemy');
        enemy2.setScale(0.8);
        enemy2.health = 50;
        this.enemies.add(enemy2);
    }

    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            // Не начинаем прицеливание если кликнули внизу экрана (где UI)
            if (this.isAiming || pointer.y > 640) return;
            
            this.isAiming = true;
            this.aimStart = { x: pointer.x, y: pointer.y };
        });
        
        this.input.on('pointermove', (pointer) => {
            if (!this.isAiming) return;
            
            this.aimEnd = { x: pointer.x, y: pointer.y };
            this.updateAimVisuals();
        });
        
        this.input.on('pointerup', () => {
            if (!this.isAiming) return;
            
            this.launchAnimal();
            this.isAiming = false;
            this.clearAimVisuals();
        });
    }

    updateAimVisuals() {
        this.aimLine.clear();
        this.aimLine.lineStyle(3, 0xffffff, 0.5);
        this.aimLine.beginPath();
        this.aimLine.moveTo(this.launcher.x, this.launcher.y);
        
        const dx = this.aimStart.x - this.aimEnd.x;
        const dy = this.aimStart.y - this.aimEnd.y;
        
        this.aimLine.lineTo(
            this.launcher.x + dx * 0.5,
            this.launcher.y + dy * 0.5
        );
        this.aimLine.strokePath();
        
        // Power bar
        const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 3, 100);
        this.powerBar.clear();
        this.powerBar.fillStyle(0x00ff00, 0.7);
        this.powerBar.fillRect(this.launcher.x - 50, this.launcher.y - 70, power, 10);
    }

    clearAimVisuals() {
        this.aimLine.clear();
        this.powerBar.clear();
    }

    launchAnimal() {
        const stats = this.animalStats[this.selectedAnimal];
        const dx = (this.aimStart.x - this.aimEnd.x) * 2 * (stats.speed / 100);
        const dy = (this.aimStart.y - this.aimEnd.y) * 2 * (stats.speed / 100);
        
        const animal = this.physics.add.sprite(this.launcher.x, this.launcher.y, this.selectedAnimal);
        animal.setScale(0.8);
        animal.setVelocity(dx, dy);
        animal.setBounce(0.4);

        // Устанавливаем границы для животного
        animal.setCollideWorldBounds(true);
        animal.body.onWorldBounds = true;
        
        animal.animalType = this.selectedAnimal;
        animal.stats = stats;
        
        this.animals.add(animal);
        
        // Камера следует за животным с ограничениями
        this.cameras.main.startFollow(animal, true, 0.1, 0.1);
        this.cameras.main.setFollowOffset(-200, 0);
        
        // Check if animal stops moving
        this.time.addEvent({
            delay: 100,
            repeat: 50,
            callback: () => {
                if (animal.body && Math.abs(animal.body.velocity.x) < 10 && Math.abs(animal.body.velocity.y) < 10) {
                    this.cameras.main.stopFollow();
                    this.time.delayedCall(1000, () => {
                        animal.destroy();
                        this.checkLevelComplete();
                    });
                }
            }
        });
    }

    // createLevel() {
    //     // Create structures - дальше от старта
    //     for (let i = 0; i < 3; i++) {
    //         for (let j = 0; j < 4; j++) {
    //             const x = 1200 + i * 100; // Изменили с 800 на 1200
    //             const y = 650 - j * 80;
    //             const block = this.physics.add.image(x, y, 'wood');
    //             block.setScale(0.8);
    //             block.health = 100;
    //             this.structures.add(block);
    //         }
    //     }
        
    //     // Create enemies - тоже дальше
    //     const enemy1 = this.physics.add.image(1250, 500, 'enemy');
    //     enemy1.setScale(0.8);
    //     enemy1.health = 50;
    //     this.enemies.add(enemy1);
        
    //     const enemy2 = this.physics.add.image(1350, 500, 'enemy');
    //     enemy2.setScale(0.8);
    //     enemy2.health = 50;
    //     this.enemies.add(enemy2);
    // }

    setupCollisions() {
        // Animal vs Ground
        this.physics.add.collider(this.animals, this.ground);
        this.physics.add.collider(this.structures, this.ground);
        this.physics.add.collider(this.enemies, this.ground);
        
        // Animal vs Structures
        this.physics.add.collider(this.animals, this.structures, (animal, structure) => {
            const damage = animal.stats.power;
            structure.health -= damage;
            
            if (structure.health <= 0) {
                this.explodeStructure(structure);
                structure.destroy();
                this.score += 50;
                this.updateScore();
            }
            
            // Special abilities
            if (animal.stats.ability === 'explosive') {
                this.createExplosion(animal.x, animal.y, 150);
            }
        });
        
        // Animal vs Enemies
        this.physics.add.collider(this.animals, this.enemies, (animal, enemy) => {
            enemy.health -= animal.stats.power;
            
            if (enemy.health <= 0) {
                this.explodeEnemy(enemy);
                enemy.destroy();
                this.score += 100;
                this.updateScore();
            }
        });
        
        // Structures vs Enemies
        this.physics.add.collider(this.structures, this.enemies);
    }

    createParticleEmitters() {
        // Wood particles
        this.woodParticles = this.add.particles(0, 0, 'particle', {
            scale: { start: 0.5, end: 0 },
            speed: { min: 100, max: 300 },
            lifespan: 1000,
            gravityY: 800,
            tint: 0x8B4513,
            emitting: false
        });
        
        // Explosion particles
        this.explosionParticles = this.add.particles(0, 0, 'spark', {
            scale: { start: 1, end: 0 },
            speed: { min: 200, max: 400 },
            lifespan: 500,
            tint: [0xff0000, 0xffff00, 0xff8800],
            emitting: false
        });
    }

    explodeStructure(structure) {
        this.woodParticles.emitParticleAt(structure.x, structure.y, 20);
    }

    explodeEnemy(enemy) {
        this.explosionParticles.emitParticleAt(enemy.x, enemy.y, 30);
    }

    createExplosion(x, y, radius) {
        // Visual explosion effect
        const explosion = this.add.circle(x, y, radius, 0xffff00, 0.3);
        this.tweens.add({
            targets: explosion,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => explosion.destroy()
        });
        
        // Damage nearby objects
        this.structures.children.entries.forEach(structure => {
            const distance = Phaser.Math.Distance.Between(x, y, structure.x, structure.y);
            if (distance < radius) {
                const damage = (1 - distance / radius) * 50;
                structure.health -= damage;
                if (structure.health <= 0) {
                    this.explodeStructure(structure);
                    structure.destroy();
                    this.score += 25;
                }
            }
        });
        
        this.explosionParticles.emitParticleAt(x, y, 50);
    }

    createUI() {
        // Score
        this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(100);
        
        // Level
        this.levelText = this.add.text(20, 60, `Level: ${this.level}`, {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.levelText.setScrollFactor(0);
        this.levelText.setDepth(100);
        
        // Animal selector
        this.createAnimalSelector();
    }

    createAnimalSelector() {
        const animals = ['dog', 'cat', 'rabbit', 'hamster', 'parrot'];
        
        const gameWidth = 1800;
        const gameHeight = 720;
        
        // Создаем отдельную UI панель внизу экрана
        const panelHeight = 80;
        const panelY = gameHeight - panelHeight/2;
        
        // Темный фон на всю ширину экрана (как отдельная панель)
        const fullBg = this.add.rectangle(gameWidth/2, panelY, gameWidth, panelHeight, 0x1a1a1a);
        fullBg.setScrollFactor(0);
        fullBg.setDepth(98);
        
        // Линия-разделитель между игрой и UI
        const separator = this.add.rectangle(gameWidth/2, gameHeight - panelHeight, gameWidth, 2, 0xffffff);
        separator.setScrollFactor(0);
        separator.setDepth(99);
        
        // Центрируем животных в панели
        const centerX = gameWidth / 2;
        const animalY = panelY;
        
        // Фон для селектора животных
        const selectorBg = this.add.rectangle(centerX, animalY, 450, 60, 0x000000, 0.5);
        selectorBg.setScrollFactor(0);
        selectorBg.setDepth(100);
        
        // Животные
        animals.forEach((animal, index) => {
            const x = centerX - 180 + (index * 90);
            
            const btn = this.add.image(x, animalY - 15, animal);
            btn.setScale(0.5);
            btn.setInteractive();
            btn.setScrollFactor(0);
            btn.setDepth(101);
            
            if (animal === this.selectedAnimal) {
                btn.setTint(0xffff00);
            }
            
            btn.on('pointerdown', () => {
                this.children.list.forEach(child => {
                    if (child.texture && animals.includes(child.texture.key)) {
                        child.clearTint();
                    }
                });
                btn.setTint(0xffff00);
                this.selectedAnimal = animal;
            });
            
            const text = this.add.text(x, animalY + 15, animal, {
                fontSize: '10px',
                color: '#ffffff'
            });
            text.setOrigin(0.5);
            text.setScrollFactor(0);
            text.setDepth(101);
        });
    }

    updateScore() {
        this.scoreText.setText(`Score: ${this.score}`);
    }

    checkLevelComplete() {
        if (this.enemies.getLength() === 0) {
            this.levelComplete();
        }
    }

    levelComplete() {
        // Show completion message
        const completeText = this.add.text(640, 360, 'Level Complete!', {
            fontSize: '64px',
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        });
        completeText.setOrigin(0.5);
        
        // Submit score to blockchain
        if (window.gameContract) {
            this.submitScoreToBlockchain();
        }
        
        // Next level after delay
        this.time.delayedCall(3000, () => {
            this.level++;
            this.scene.restart();
        });
    }

    async submitScoreToBlockchain() {
        try {
            const tx = await window.gameContract.submitScore(
                this.level,
                window.selectedAnimalId,
                this.score,
                window.playerNonce,
                "0x00" // Simplified for testing
            );
            await tx.wait();
            console.log('Score submitted to blockchain!');
        } catch (error) {
            console.error('Error submitting score:', error);
        }
    }

    update() {
        // Game update logic
    }
}