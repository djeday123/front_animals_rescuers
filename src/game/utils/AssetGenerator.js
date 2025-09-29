// AssetGenerator.js - Creates simple assets programmatically
export default class AssetGenerator {
    constructor(scene) {
        this.scene = scene;
    }

    preload() {
        // Create simple colored sprites as textures
        this.createColoredSprite('sky', 1800, 720, 0x87CEEB);
        this.createColoredSprite('ground', 1800, 60, 0x8B4513);
        
        this.createLauncherSprite();

        this.createColoredSprite('wood', 60, 60, 0x8B4513);
        this.createColoredSprite('stone', 60, 60, 0x696969);
        this.createColoredSprite('enemy', 50, 50, 0xFF0000);
        
        // Create animal sprites with different colors
        this.createAnimalSprite('dog', 0xFFD700);
        this.createAnimalSprite('cat', 0xFF69B4);
        this.createAnimalSprite('rabbit', 0x87CEEB);
        this.createAnimalSprite('hamster', 0xFFA500);
        this.createAnimalSprite('parrot', 0x32CD32);
        
        // Create particle texture
        this.createColoredSprite('particle', 8, 8, 0xFFFFFF);
        this.createColoredSprite('spark', 6, 6, 0xFFFF00);

        //this.createColoredSprite('launcher', 100, 100, 0xFF6B6B);
    }

    createColoredSprite(key, width, height, color) {
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(color);
        graphics.fillRect(0, 0, width, height);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createAnimalSprite(key, color) {
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        
        // Draw a simple animal shape
        graphics.fillStyle(color);
        graphics.fillCircle(25, 25, 20);
        
        // Add simple features
        graphics.fillStyle(0x000000);
        graphics.fillCircle(18, 20, 3); // eye 1
        graphics.fillCircle(32, 20, 3); // eye 2
        
        // Animal-specific features
        switch(key) {
            case 'dog':
                // Ears
                graphics.fillStyle(color);
                graphics.fillTriangle(10, 10, 15, 0, 20, 10);
                graphics.fillTriangle(30, 10, 35, 0, 40, 10);
                break;
            case 'cat':
                // Pointy ears
                graphics.fillStyle(color);
                graphics.fillTriangle(12, 12, 15, 2, 18, 12);
                graphics.fillTriangle(32, 12, 35, 2, 38, 12);
                // Whiskers
                graphics.lineStyle(1, 0x000000);
                graphics.lineBetween(5, 25, 15, 23);
                graphics.lineBetween(35, 23, 45, 25);
                break;
            case 'rabbit':
                // Long ears
                graphics.fillStyle(color);
                graphics.fillEllipse(15, 5, 5, 12);
                graphics.fillEllipse(35, 5, 5, 12);
                break;
            case 'parrot':
                // Beak
                graphics.fillStyle(0xFFA500);
                graphics.fillTriangle(25, 28, 20, 32, 30, 32);
                break;
        }
        
        graphics.generateTexture(key, 50, 50);
        graphics.destroy();
    }

    createLauncherSprite() {
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        
        // Очистим canvas
        graphics.clear();
        
        // Фон (чтобы убедиться, что видим весь спрайт)
        graphics.fillStyle(0x87CEEB, 0.3);
        graphics.fillRect(0, 0, 100, 120);
        
        // Основа катапульты (деревянная рама)
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(20, 50, 60, 50);
        
        // Вертикальная стойка
        graphics.fillStyle(0x654321);
        graphics.fillRect(45, 20, 10, 60);
        
        // Рычаг катапульты
        graphics.lineStyle(6, 0x4B3621);
        graphics.beginPath();
        graphics.moveTo(50, 40);
        graphics.lineTo(20, 20);
        graphics.strokePath();
        
        // Корзина для животного
        graphics.fillStyle(0x8B4513);
        graphics.fillCircle(20, 20, 12);
        graphics.fillStyle(0x654321);
        graphics.fillCircle(20, 20, 8);
        
        // Основание (камни)
        graphics.fillStyle(0x696969);
        graphics.fillRect(15, 90, 70, 20);
        graphics.fillStyle(0x808080);
        graphics.fillRect(20, 95, 60, 10);
        
        // Колеса
        graphics.fillStyle(0x4B3621);
        graphics.fillCircle(30, 100, 8);
        graphics.fillCircle(70, 100, 8);
        graphics.fillStyle(0x654321);
        graphics.fillCircle(30, 100, 4);
        graphics.fillCircle(70, 100, 4);
        
        graphics.generateTexture('launcher', 100, 120);
        graphics.destroy();
    }


}