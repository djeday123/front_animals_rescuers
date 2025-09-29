import { useEffect } from 'react'
import Phaser from 'phaser'
import GameScene from './game/scenes/GameScene'

function App() {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1800,
      height: 720,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 800 },
          debug: false
        }
      },
      scene: [GameScene]
    }

    const game = new Phaser.Game(config)

    return () => {
      game.destroy(true)
    }
  }, [])

  return (
    <div className="App">
      <h1>Animal Launcher - Blockchain Game</h1>
      <div id="game-container"></div>
    </div>
  )
}

export default App