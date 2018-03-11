import "phaser-ce/build/custom/pixi"
import "phaser-ce/build/custom/p2"
import "phaser-ce"
import * as _ from "lodash"
import { PHYSICS, SPRITES } from "./constants"
import { Level } from "./level"
import { Level1 } from "./level1"

function loadImage(game: Phaser.Game, asset: { key: string, url: string }) {
  game.load.image(asset.key, asset.url)
}

class Game {
  private game: Phaser.Game
  private currentLevel?: Level

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
    loadImage(this.game, SPRITES.enemyBullet)

    this.game.load.spritesheet(SPRITES.explosion.key, SPRITES.explosion.url, 96, 96)

    const level1 = new Level1(this.game)
    level1.preload()
    this.currentLevel = level1
  }

  private create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.world.setBounds(0, 0, PHYSICS.worldWidth, PHYSICS.worldHeight)
    this.game.physics.arcade.gravity.y = PHYSICS.gravityY

    this.currentLevel && this.currentLevel.create()

    // TEST
    this.game.input.keyboard.addKey(Phaser.Keyboard.R).onDown.add(() => {
      if (this.currentLevel) {
        this.currentLevel.destroy()
        this.currentLevel = new Level1(this.game)
        this.currentLevel.create()
      }
    }, this)
  }

  private update() {
    this.currentLevel && this.currentLevel.update()
  }

  private render() {
    this.currentLevel && this.currentLevel.render()
  }
}

window.onload = () => {
  const game = new Game()
}
