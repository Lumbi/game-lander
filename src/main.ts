import 'phaser-ce/build/custom/pixi'
import 'phaser-ce/build/custom/p2'
import 'phaser-ce'
import { Physics } from 'phaser-ce';

const SPRITES = {
  lander: { key: 'lander', url: '/assets/lander.png' },
  flameParticle: { key: 'flameParticle', url: '/assets/part_flame001.png' },
  background: { key: 'background', url: '/assets/sky.png' },
  explosion: { key: 'explosion', url: '/assets/explosion.png' },
  space: { key: 'space.png', url: '/assets/space.png' }
}

const ANIMATIONS = {
  explosion: 'explosion'
}

function loadImage(game: Phaser.Game, asset: { key: string, url: string }) {
  game.load.image(asset.key, asset.url)
}

const PHYSICS = {
  worldWidth: 3000,
  worldHeight: 3000,
  gravityY: 500,
  landerThrusterForceX: 3,
  landerThrusterForceY: -20
}

class Lander {

  game: Phaser.Game
  alive: boolean
  sprite: Phaser.Sprite
  thrusterEnabled: boolean
  thrusterEmitter: Phaser.Particles.Arcade.Emitter
  explosion: Phaser.Sprite

  enableThrusterSignalBinding: Phaser.SignalBinding
  disableThrusterSignalBinding: Phaser.SignalBinding
  blowUpSignalBinding: Phaser.SignalBinding

  constructor(game: Phaser.Game, x: number, y: number) {
    this.game = game
    this.alive = true

    this.sprite = game.add.sprite(x, y, SPRITES.lander.key)
    this.sprite.anchor.x = 0.5
    this.sprite.anchor.y = 0.5

    this.thrusterEnabled = false

    game.physics.arcade.enableBody(this.sprite)
    const landerBody = <Physics.Arcade.Body>this.sprite.body
    landerBody.collideWorldBounds = true
    landerBody.allowRotation = false
   
    this.thrusterEmitter = game.add.emitter(0, 0, 30)
    this.thrusterEmitter.makeParticles([SPRITES.flameParticle.key])
    this.thrusterEmitter.setAlpha(1, 0)
    this.thrusterEmitter.setRotation(0, 0)

    this.explosion = game.add.sprite(0,0, SPRITES.explosion.key, 0)
    this.explosion.anchor.x = 0.5
    this.explosion.anchor.y = 0.5
    this.explosion.visible = false
    this.explosion.animations.add(ANIMATIONS.explosion)

    const spacebarKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    this.enableThrusterSignalBinding = spacebarKey.onDown.add(() => { this.enableThruster() })
    this.disableThrusterSignalBinding = spacebarKey.onUp.add(() => { this.disableThruster() })

    //TEST
    this.blowUpSignalBinding = game.input.keyboard.addKey(Phaser.Keyboard.Z).onDown.add(() => { this.blowUp() })
  }

  update() {
    const landerBody = <Phaser.Physics.Arcade.Body>this.sprite.body
    // Update thruster
    if (this.thrusterEnabled) {
      landerBody.velocity.add(PHYSICS.landerThrusterForceX, PHYSICS.landerThrusterForceY)
    }
  
    this.thrusterEmitter.setXSpeed(landerBody.velocity.x, landerBody.velocity.x)
    this.thrusterEmitter.setYSpeed(landerBody.velocity.y, landerBody.velocity.y)
    this.thrusterEmitter.emitX = this.sprite.x
    this.thrusterEmitter.emitY = this.sprite.y + this.sprite.height/2
  
    // Update camera
    this.game.camera.follow(this.sprite)
  }

  render() {

  }

  destroy() {
    this.enableThrusterSignalBinding.detach()
    this.disableThrusterSignalBinding.detach()
    this.blowUpSignalBinding.detach()

    this.explosion.destroy(true)
    this.thrusterEmitter.destroy(true)
    this.sprite.destroy(true)
  }

  enableThruster() {
    if (this.alive) {
      this.thrusterEnabled = true
      this.thrusterEmitter.start(false, 400, 60)
      this.thrusterEmitter.on = true
    }
  }

  disableThruster() {
    if (this.alive) {
      this.thrusterEnabled = false
      this.thrusterEmitter.on = false
    }
  }

  blowUp() {
    if (this.alive) {
      this.alive = false
      const landerBody = <Physics.Arcade.Body>this.sprite.body
      landerBody.enable = false
      this.sprite.visible = false
      this.explosion.x = this.sprite.x
      this.explosion.y = this.sprite.y
      this.explosion.visible = true
      this.explosion.play(ANIMATIONS.explosion, 24, false, true)
    }
  }
}

class Level1 {

  constructor(game: Phaser.Game) {

    game.add.tileSprite(0, 0, PHYSICS.worldWidth, PHYSICS.worldHeight, SPRITES.space.key);

  }

}

class Game {

  game: Phaser.Game
  lander?: Lander
  level1?: Level1

  reset() {}

  constructor() {
    this.game = new Phaser.Game("100", "100", Phaser.AUTO, '',
      { preload: this.preload,
        create: this.create,
        update: this.update,
        render: this.render
      })
  }

  preload() {
    loadImage(this.game, SPRITES.lander)
    loadImage(this.game, SPRITES.flameParticle)
    loadImage(this.game, SPRITES.background)
    loadImage(this.game, SPRITES.space)
    
    this.game.load.spritesheet(SPRITES.explosion.key, SPRITES.explosion.url, 96, 96)
  }

  create() {

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

  update() {
    this.lander && this.lander.update()
  }

  render() {
    // this.lander && this.game.debug.body(this.lander.sprite)
  }
}

window.onload = () => {
  const game = new Game()
}
