import "phaser-ce"
// import { Physics } from "phaser-ce"
import "phaser-ce/build/custom/p2"
import "phaser-ce/build/custom/pixi"
import { ANIMATIONS, PHYSICS, SPRITES } from "./constants"
import { Lander } from "./lander"

function loadImage(game: Phaser.Game, asset: { key: string, url: string }) {
  game.load.image(asset.key, asset.url)
}

class Level1 {
  constructor(game: Phaser.Game) {
    game.add.tileSprite(0, 0, PHYSICS.worldWidth, PHYSICS.worldHeight, SPRITES.space.key)
  }
}

class Game {
  private game: Phaser.Game
  private lander?: Lander
  private level1?: Level1

  constructor() {
    this.game = new Phaser.Game("100", "100", Phaser.AUTO, "",
      { preload: this.preload,
        create: this.create,
        update: this.update,
        render: this.render,
      })
  }

  private reset() {
    // TODO
  }

  private preload() {
    loadImage(this.game, SPRITES.lander)
    loadImage(this.game, SPRITES.flameParticle)
    loadImage(this.game, SPRITES.background)
    loadImage(this.game, SPRITES.space)

    this.game.load.spritesheet(SPRITES.explosion.key, SPRITES.explosion.url, 96, 96)
  }

  private create() {
    this.reset = function() {
      this.lander && this.lander.destroy()
      this.lander = new Lander(this.game, 100, 100)
    }

    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.world.setBounds(0, 0, PHYSICS.worldWidth, PHYSICS.worldHeight)
    this.game.physics.arcade.gravity.y = PHYSICS.gravityY

    // TEST
    this.game.input.keyboard.addKey(Phaser.Keyboard.R).onDown.add(() => this.reset(), this)

    this.level1 = new Level1(this.game)

    this.reset()
  }

  private update() {
    this.lander && this.lander.update()
  }

  private render() {
    // this.lander && this.game.debug.body(this.lander.sprite)
  }
}

window.onload = () => {
  const game = new Game()
}
