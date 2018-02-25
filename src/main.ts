import "phaser-ce/build/custom/pixi"
import "phaser-ce/build/custom/p2"
import "phaser-ce"
import { ANIMATIONS, PHYSICS, SPRITES } from "./constants"
import { Lander } from "./lander"

function loadImage(game: Phaser.Game, asset: { key: string, url: string }) {
  game.load.image(asset.key, asset.url)
}

function createFixedSprite(game: Phaser.Game, key: string, x: number, y: number): Phaser.Sprite {
  const sprite = game.add.sprite(x, y, key)
  game.physics.arcade.enableBody(sprite)
  const body = sprite.body as Phaser.Physics.Arcade.Body
  body.immovable = true
  body.allowGravity = false
  return sprite
}

function createRock(game: Phaser.Game, x: number, y: number): Phaser.Sprite {
  const sprite = createFixedSprite(game, SPRITES.redRock.key, x, y)
  const body = sprite.body as Phaser.Physics.Arcade.Body
  body.setSize(76, 67)
  body.offset = new Phaser.Point(12, 13)
  return sprite
}

function createRock2(game: Phaser.Game, x: number, y: number): Phaser.Sprite {
  const sprite = createFixedSprite(game, SPRITES.redRock2.key, x, y)
  const body = sprite.body as Phaser.Physics.Arcade.Body
  body.setSize(76, 67)
  body.offset = new Phaser.Point(12, 13)
  return sprite
}

function createGoal(game: Phaser.Game, x: number, y: number): Phaser.Sprite {
  const sprite = createFixedSprite(game, SPRITES.goal.key, x, y)
  const body = sprite.body as Phaser.Physics.Arcade.Body
  body.setSize(70, 12)
  body.offset = new Phaser.Point(65, 122)
  return sprite
}

class Level1 {

  private game: Phaser.Game
  private lander?: Lander
  private landerStart: Phaser.Point
  private rocks: Phaser.Group
  private goal: Phaser.Sprite

  constructor(game: Phaser.Game) {
    this.game = game
    this.landerStart = new Phaser.Point(286, 1564)

    game.add.tileSprite(0, 0, PHYSICS.worldWidth, PHYSICS.worldHeight, SPRITES.space.key)

    this.rocks = game.add.physicsGroup()
    this.rocks.add(createRock(game, 727, 1354))
    this.rocks.add(createRock(game, 402, 1653))
    this.rocks.add(createRock(game, 680, 1513))
    this.rocks.add(createRock(game, 254, 1620))
    this.rocks.add(createRock(game, 1554, 1583))
    this.rocks.add(createRock(game, 1116, 1690))

    this.rocks.add(createRock2(game, 2061, 1254))
    this.rocks.add(createRock2(game, 1554, 1657))
    this.rocks.add(createRock2(game, 1618, 1607))
    this.rocks.add(createRock2(game, 744, 1442))
    this.rocks.add(createRock2(game, 1194, 1003))
    this.rocks.add(createRock2(game, 1194, 1660))
    this.rocks.add(createRock2(game, 352, 1606))

    this.goal = createGoal(game, 2604, 1565)
  }

  public reset() {
    this.lander && this.lander.destroy()
    this.lander = new Lander(this.game, this.landerStart.x, this.landerStart.y)
  }

  public update() {
    const lander = this.lander
    if (lander) {
      this.rocks.forEach((rock: Phaser.Sprite) => {
        this.game.physics.arcade.collide(lander.sprite, rock, this.onLanderCollision, undefined, this)
      }, this)

      this.game.physics.arcade.collide(lander.sprite, this.goal)
      lander.update()
    }
  }

  public render() {
    // this.lander && this.game.debug.body(this.lander.sprite)
    // this.rocks.forEach((rock: Phaser.Sprite) => {
    //   this.game.debug.body(rock)
    // }, this)
  }

  private onLanderCollision() {
    if (this.lander) {
      const landerBody = this.lander.getBody()
      if (landerBody && landerBody.speed > 300) {
        this.lander && this.lander.blowUp()
      }
    }
  }
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
  }

  private create() {

    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.world.setBounds(0, 0, PHYSICS.worldWidth, PHYSICS.worldHeight)
    this.game.physics.arcade.gravity.y = PHYSICS.gravityY

    // TEST
    this.game.input.keyboard.addKey(Phaser.Keyboard.R).onDown.add(() => this.level1 && this.level1.reset(), this)

    this.level1 = new Level1(this.game)
    this.level1 && this.level1.reset()
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
