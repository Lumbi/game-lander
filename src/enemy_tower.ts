import { Physics, SPRITE } from "phaser-ce"
import { NAMES, SPRITES } from "./constants"

export class EnemyTower extends Phaser.Group {

  private sprite: Phaser.Sprite
  private readonly shootThreshold = 3
  private shootAccumulator: number

  constructor(game: Phaser.Game, sprite: Phaser.Sprite) {
    super(game)
    this.add(sprite)
    this.sprite = sprite
    this.shootAccumulator = 0
  }

  public update() {
    super.update()
    this.shootAccumulator += this.game.time.physicsElapsed
    if (this.shootAccumulator > this.shootThreshold) {
      this.shoot()
      this.shootAccumulator = 0
    }
  }

  private shoot() {
    this.game.world.add(new EnemyBullet(this.game, this.sprite.x, this.sprite.y))
  }
}

export class EnemyBullet extends Phaser.Sprite {

  private readonly arcardBody: Phaser.Physics.Arcade.Body
  private readonly maxVelocity: number = 200
  private timeAlive: number = 0
  private readonly maxTimeAlive: number = 3

  constructor(game: Phaser.Game, x: number, y: number) {
    super(game, x, y, SPRITES.enemyBullet.key)
    this.name = "enemy_bullet"

    this.game.physics.arcade.enableBody(this)
    this.arcardBody = this.body as Phaser.Physics.Arcade.Body

    this.arcardBody.allowDrag = false
    this.arcardBody.allowGravity = false
    this.arcardBody.allowRotation = false
    this.arcardBody.immovable = true
    this.arcardBody.velocity.x = -this.maxVelocity

    const size = 10
    this.arcardBody.offset.x = (this.width / 2 - size / 2)
    this.arcardBody.offset.y = (this.height / 2 - size / 2)
    this.arcardBody.width = this.arcardBody.height = 10
  }

  public update() {
    super.update()

    this.timeAlive += this.game.time.physicsElapsed
    if (this.timeAlive > this.maxTimeAlive) {
      this.destroy()
    }
  }
}
