import { Physics } from "phaser-ce"
import { ANIMATIONS, PHYSICS, SPRITES } from "./constants"

export class Lander {

  private game: Phaser.Game
  private alive: boolean
  private sprite: Phaser.Sprite
  private thrusterEnabled: boolean
  private thrusterEmitter: Phaser.Particles.Arcade.Emitter
  private explosion: Phaser.Sprite

  private enableThrusterSignalBinding: Phaser.SignalBinding
  private disableThrusterSignalBinding: Phaser.SignalBinding
  private blowUpSignalBinding: Phaser.SignalBinding

  constructor(game: Phaser.Game, x: number, y: number) {
    this.game = game
    this.alive = true

    this.sprite = game.add.sprite(x, y, SPRITES.lander.key)
    this.sprite.anchor.x = 0.5
    this.sprite.anchor.y = 0.5

    this.thrusterEnabled = false

    game.physics.arcade.enableBody(this.sprite)
    const landerBody = this.sprite.body as Physics.Arcade.Body
    landerBody.collideWorldBounds = true
    landerBody.allowRotation = false

    this.thrusterEmitter = game.add.emitter(0, 0, 30)
    this.thrusterEmitter.makeParticles([SPRITES.flameParticle.key])
    this.thrusterEmitter.setAlpha(1, 0)
    this.thrusterEmitter.setRotation(0, 0)

    this.explosion = game.add.sprite(0, 0, SPRITES.explosion.key, 0)
    this.explosion.anchor.x = 0.5
    this.explosion.anchor.y = 0.5
    this.explosion.visible = false
    this.explosion.animations.add(ANIMATIONS.explosion)

    const spacebarKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    this.enableThrusterSignalBinding = spacebarKey.onDown.add(() => { this.enableThruster() })
    this.disableThrusterSignalBinding = spacebarKey.onUp.add(() => { this.disableThruster() })

    // TEST
    this.blowUpSignalBinding = game.input.keyboard.addKey(Phaser.Keyboard.Z).onDown.add(() => { this.blowUp() })
  }

  public update() {
    const landerBody = this.sprite.body as Phaser.Physics.Arcade.Body
    // Update thruster
    if (this.thrusterEnabled) {
      landerBody.velocity.add(PHYSICS.landerThrusterForceX, PHYSICS.landerThrusterForceY)
    }

    this.thrusterEmitter.setXSpeed(landerBody.velocity.x, landerBody.velocity.x)
    this.thrusterEmitter.setYSpeed(landerBody.velocity.y, landerBody.velocity.y)
    this.thrusterEmitter.emitX = this.sprite.x
    this.thrusterEmitter.emitY = this.sprite.y + this.sprite.height / 2

    // Update camera
    this.game.camera.follow(this.sprite)
  }

  public render() {
    // TODO
  }

  public destroy() {
    this.enableThrusterSignalBinding.detach()
    this.disableThrusterSignalBinding.detach()
    this.blowUpSignalBinding.detach()

    this.explosion.destroy(true)
    this.thrusterEmitter.destroy(true)
    this.sprite.destroy(true)
  }

  private enableThruster() {
    if (this.alive) {
      this.thrusterEnabled = true
      this.thrusterEmitter.start(false, 400, 60)
      this.thrusterEmitter.on = true
    }
  }

  private disableThruster() {
    if (this.alive) {
      this.thrusterEnabled = false
      this.thrusterEmitter.on = false
    }
  }

  private blowUp() {
    if (this.alive) {
      this.alive = false

      const landerBody = this.sprite.body as Physics.Arcade.Body
      landerBody.enable = false

      this.sprite.visible = false

      this.explosion.x = this.sprite.x
      this.explosion.y = this.sprite.y
      this.explosion.visible = true
      this.explosion.play(ANIMATIONS.explosion, 24, false, true)
    }
  }
}
