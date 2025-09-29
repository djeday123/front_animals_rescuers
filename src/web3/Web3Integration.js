// Web3Integration.js - Connect game to blockchain
import { ethers } from 'ethers';
import AnimalNFTABI from './abis/AnimalNFT.json';
import GameTokenABI from './abis/GameToken.json';
import AnimalGameABI from './abis/AnimalGame.json';

class Web3Integration {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.userAddress = null;
        this.userAnimals = [];
    }

    async connect() {
        try {
            // Check if MetaMask is installed
            if (!window.ethereum) {
                throw new Error('MetaMask not found. Please install MetaMask.');
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();

            // Load contract addresses (from your deployed contracts)
            const addresses = {
                animalNFT: "0x1291Be112d480055DaFd8a610b7d1e203891C274",
                gameToken: "0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154",
                animalGame: "0x70c1c09E8272878f2c1DD4EF7515EcA63F88BBb1"
            };

            // Initialize contracts
            this.contracts.animalNFT = new ethers.Contract(
                addresses.animalNFT,
                AnimalNFTABI,
                this.signer
            );

            this.contracts.gameToken = new ethers.Contract(
                addresses.gameToken,
                GameTokenABI,
                this.signer
            );

            this.contracts.animalGame = new ethers.Contract(
                addresses.animalGame,
                AnimalGameABI,
                this.signer
            );

            // Load user's animals
            await this.loadUserAnimals();

            return true;
        } catch (error) {
            console.error('Connection error:', error);
            return false;
        }
    }

    async loadUserAnimals() {
        try {
            const animalIds = await this.contracts.animalNFT.getOwnerAnimals(this.userAddress);
            this.userAnimals = [];

            for (const id of animalIds) {
                const animal = await this.contracts.animalNFT.getAnimal(id);
                this.userAnimals.push({
                    id: id.toString(),
                    name: animal.name,
                    type: this.getAnimalTypeName(animal.animalType),
                    power: animal.power.toString(),
                    speed: animal.speed.toString(),
                    specialAbility: this.getAbilityName(animal.specialAbility),
                    level: animal.level.toString(),
                    experience: animal.experience.toString()
                });
            }

            return this.userAnimals;
        } catch (error) {
            console.error('Error loading animals:', error);
            return [];
        }
    }

    async getUserBalance() {
        try {
            const balance = await this.contracts.gameToken.balanceOf(this.userAddress);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }

    async mintAnimal(name, animalType) {
        try {
            const mintPrice = await this.contracts.animalNFT.mintPrice();
            const tx = await this.contracts.animalNFT.mintAnimal(name, animalType, {
                value: mintPrice
            });
            
            const receipt = await tx.wait();
            console.log('Animal minted!', receipt);
            
            // Reload animals
            await this.loadUserAnimals();
            
            return receipt;
        } catch (error) {
            console.error('Error minting animal:', error);
            throw error;
        }
    }

    async startLevel(levelId, animalId) {
        try {
            // Check token balance
            const balance = await this.contracts.gameToken.balanceOf(this.userAddress);
            const entryFee = await this.contracts.animalGame.entryFee();
            
            if (balance < entryFee) {
                throw new Error('Insufficient AGT tokens');
            }

            // Approve tokens
            const approveTx = await this.contracts.gameToken.approve(
                await this.contracts.animalGame.getAddress(),
                entryFee
            );
            await approveTx.wait();

            // Play level
            const playTx = await this.contracts.animalGame.playLevel(levelId, animalId);
            const receipt = await playTx.wait();
            
            // Get player nonce for score submission
            const nonce = await this.contracts.animalGame.playerNonce(this.userAddress);
            window.playerNonce = nonce;
            window.selectedAnimalId = animalId;
            
            console.log('Level started!', receipt);
            return receipt;
        } catch (error) {
            console.error('Error starting level:', error);
            throw error;
        }
    }

    async submitScore(levelId, animalId, score, nonce) {
        try {
            // For simplified version without signature verification
            const tx = await this.contracts.animalGame.submitScore(
                levelId,
                animalId,
                score,
                nonce,
                "0x00" // Dummy signature for testing
            );
            
            const receipt = await tx.wait();
            console.log('Score submitted!', receipt);
            
            // Check rewards
            const stats = await this.contracts.animalGame.getPlayerStats(this.userAddress);
            console.log('Player stats:', stats);
            
            return receipt;
        } catch (error) {
            console.error('Error submitting score:', error);
            throw error;
        }
    }

    async getPlayerStats() {
        try {
            const stats = await this.contracts.animalGame.getPlayerStats(this.userAddress);
            return {
                levelsCompleted: stats.levelsCompleted.toString(),
                totalScore: stats.totalScore.toString(),
                highScore: stats.highScore.toString(),
                tokensEarned: ethers.formatEther(stats.tokensEarned)
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    }

    getAnimalTypeName(type) {
        const types = ['Dog', 'Cat', 'Rabbit', 'Hamster', 'Parrot'];
        return types[type] || 'Unknown';
    }

    getAbilityName(ability) {
        const abilities = ['None', 'Explosive', 'Split', 'Bounce'];
        return abilities[ability] || 'Unknown';
    }

    // Event listeners
    onAccountsChanged(callback) {
        window.ethereum.on('accountsChanged', callback);
    }

    onChainChanged(callback) {
        window.ethereum.on('chainChanged', callback);
    }
}

// Export singleton instance
export default new Web3Integration();