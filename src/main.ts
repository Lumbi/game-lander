import "phaser-ce/build/custom/pixi"
import "phaser-ce/build/custom/p2"
import "phaser-ce"
import * as _ from "lodash"
import { PHYSICS, SPRITES } from "./constants"
import { Level1 } from "./level1"

function loadImage(game: Phaser.Game, asset: { key: string, url: string }) {
  game.load.image(asset.key, asset.url)
}

class Game {
  private game: Phaser.Game
  private level1?: Level1

  constructor() {
    this.game = new Phaser.Game("100", "100", Phaser.AUTO, "",
      { preload: this.preload,
        create: this.create,
        update: this.update,
        render: this.render,
      })
  }

  private preload() {
    loadImage(this.game, SPRITES.lander)
    loadImage(this.game, SPRITES.flameParticle)
    loadImage(this.game, SPRITES.background)
    loadImage(this.game, SPRITES.space)
    loadImage(this.game, SPRITES.redRock)
    loadImage(this.game, SPRITES.redRock2)
    loadImage(this.game, SPRITES.goal)

    this.game.load.spritesheet(SPRITES.explosion.key, SPRITES.explosion.url, 96, 96)

    const level1 = new Level1(this.game)
    level1.preload()
    this.level1 = level1
  }

  private create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.world.setBounds(0, 0, PHYSICS.worldWidth, PHYSICS.worldHeight)
    this.game.physics.arcade.gravity.y = PHYSICS.gravityY

    this.level1 && this.level1.create()

    // TEST
    this.game.input.keyboard.addKey(Phaser.Keyboard.R).onDown.add(() => this.level1 && this.level1.reset(), this)
  }

  private update() {
    this.level1 && this.level1.update()
  }

  private render() {
    this.level1 && this.level1.render()
  }
}

window.onload = () => {
  const game = new Game()
}
