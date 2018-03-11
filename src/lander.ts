import { Physics } from "phaser-ce"
import { ANIMATIONS, PHYSICS, SPRITES } from "./constants"

export class Lander extends Phaser.Sprite {

  public alive: boolean
  public controlsEnabled: boolean

  private leftThrusterEnabled: boolean
  private rightThrusterEnabled: boolean
  private thrusterEmitter: Phaser.Particles.Arcade.Emitter
  private explosion: Phaser.Sprite

  private enableLeftThrusterSignalBinding: Phaser.SignalBinding
  private disableLeftThrusterSignalBinding: Phaser.SignalBinding
  private enableRightThrusterSignalBinding: Phaser.SignalBinding
  private disableRightThrusterSignalBinding: Phaser.SignalBinding
  private blowUpSignalBinding: Phaser.SignalBinding

  constructor(game: Phaser.Game, x: number, y: number) {
    super(game, x, y, SPRITES.lander.key)
    this.game = game
    this.alive = true
    this.controlsEnabled = true

    this.anchor.x = 0.5
    this.anchor.y = 0.5

    this.leftThrusterEnabled = false
    this.rightThrusterEnabled = false

    game.physics.arcade.enableBody(this)
    const landerBody = this.body as Physics.Arcade.Body
    landerBody.collideWorldBounds = true
    landerBody.allowRotation = false
    landerBody.drag.x = PHYSICS.landerDragX
    landerBody.drag.y = PHYSICS.landerDragY
    landerBody.width = 34
    landerBody.height = 22
    landerBody.offset.x = 13
    landerBody.offset.y = 16
    landerBody.position.x = this.position.x
    landerBody.position.y = this.position.y

    this.thrusterEmitter = game.add.emitter(0, 0, 30)
    this.thrusterEmitter.makeParticles([SPRITES.flameParticle.key])
    this.thrusterEmitter.setAlpha(1, 0)
    this.thrusterEmitter.setRotation(0, 0)

    this.explosion = game.add.sprite(0, 0, SPRITES.explosion.key, 0)
    this.explosion.anchor.x = 0.5
    this.explosion.anchor.y = 0.5
    this.explosion.visible = false
    this.explosion.animations.add(ANIMATIONS.explosion)

    const leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
    const rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    this.enableLeftThrusterSignalBinding = leftKey.onDown.add(() => { this.enableThruster("left") })
    this.disableLeftThrusterSignalBinding = leftKey.onUp.add(() => { this.disableThruster("left") })
    this.enableRightThrusterSignalBinding = rightKey.onDown.add(() => { this.enableThruster("right") })
    this.disableRightThrusterSignalBinding = rightKey.onUp.add(() => { this.disableThruster("right") })

    // TEST
    this.blowUpSignalBinding = game.input.keyboard.addKey(Phaser.Keyboard.Z).onDown.add(() => { this.blowUp() })
  }

  public getBody(): Physics.Arcade.Body | undefined {
    return this.body
  }

  public update() {
    super.update()
    const landerBody = this.getBody()
    if (landerBody && this.controlsEnabled) {
      // Update thruster
      if (this.rightThrusterEnabled) {
        landerBody.velocity.add(PHYSICS.landerThrusterForceX, PHYSICS.landerThrusterForceY)
      } else if (this.leftThrusterEnabled) {
        landerBody.velocity.add(-PHYSICS.landerThrusterForceX, PHYSICS.landerThrusterForceY)
      }
      this.thrusterEmitter.setXSpeed(landerBody.velocity.x, landerBody.velocity.x)
      this.thrusterEmitter.setYSpeed(landerBody.velocity.y, landerBody.velocity.y)
    }

    this.thrusterEmitter.emitX = this.x
    this.thrusterEmitter.emitY = this.y + this.height / 2

    // Update camera
    this.game.camera.follow(this)
  }

  public destroy() {
    this.enableLeftThrusterSignalBinding.detach()
    this.disableLeftThrusterSignalBinding.detach()
    this.enableRightThrusterSignalBinding.detach()
    this.disableRightThrusterSignalBinding.detach()
    this.blowUpSignalBinding.detach()
    super.destroy()
  }

  public blowUp() {
    if (this.alive) {
      this.alive = false

      const landerBody = this.getBody()
      if (landerBody) {
        landerBody.enable = false
      }

      this.visible = false

      this.thrusterEmitter.on = false

      this.explosion.x = this.x
      this.explosion.y = this.y
      this.explosion.visible = true
      this.explosion.play(ANIMATIONS.explosion, 24, false, true)
    }
  }

  private enableThruster(which: "left" | "right") {
    if (this.alive && this.controlsEnabled) {
      switch (which) {
        case "left": this.leftThrusterEnabled = true; break
        case "right": this.rightThrusterEnabled = true; break
      }

      this.thrusterEmitter.start(false, 400, 60)
      this.thrusterEmitter.on = true
    }
  }

  private disableThruster(which: "left" | "right") {
    if (this.alive) {
      switch (which) {
        case "left": this.leftThrusterEnabled = false; break
        case "right": this.rightThrusterEnabled = false; break
      }
      this.thrusterEmitter.on = false
    }
  }
}
