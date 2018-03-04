import "phaser-ce/build/custom/pixi"
import "phaser-ce/build/custom/p2"
import "phaser-ce"
import * as _ from "lodash"
import { ANIMATIONS, PHYSICS, SPRITES } from "./constants"
import * as Tiled from "./tiled"
import { TiledLevel } from "./level"
import { Lander } from "./lander"

import testMapJson = require("../assets/level1.json")
import testRedRockTileSet = require("../assets/red_rock.json")
import testGoalTileSet = require("../assets/goal.json")
import testStarTileSet = require("../assets/star.json")

const tilesets = {
  "red_rock.json": Tiled.tilesetFromJSON(testRedRockTileSet),
  "star.json": Tiled.tilesetFromJSON(testStarTileSet),
  "goal.json": Tiled.tilesetFromJSON(testGoalTileSet),
}

function loadImage(game: Phaser.Game, asset: { key: string, url: string }) {
  game.load.image(asset.key, asset.url)
}

function loadTileset(game: Phaser.Game, source: string, tileset: Tiled.ITileset) {
  game.load.spritesheet(
    source,
    `/assets/${tileset.image}`,
    tileset.tilewidth, tileset.tileheight, tileset.tilecount,
    tileset.margin, tileset.spacing,
  )
}

class Level1 extends TiledLevel {
  private lander?: Lander
  private landerStart: Phaser.Point

  constructor(game: Phaser.Game) {
    super(game, Tiled.tileMapfromJSON(testMapJson), tilesets)
    this.landerStart = new Phaser.Point(286, 1564)
  }

  public reset() {
    this.lander && this.lander.destroy()
    this.lander = new Lander(this.game, this.landerStart.x, this.landerStart.y)
  }

  protected onCreate() {
    this.game.add.tileSprite(0, 0, PHYSICS.worldWidth, PHYSICS.worldHeight, SPRITES.space.key)
    super.onCreate()
    this.reset()
  }

  protected onLayerLoaded(layer: Tiled.ILayer): void {
    // TODO
  }
  protected onPointLoaded(pointObject: Tiled.IPointObject, point: Phaser.Point): void {
    if (pointObject.type === "lander_start") {
      this.landerStart = point
    }
  }

  protected onTileLoaded(tile: Tiled.ITileObject, sprite: Phaser.Sprite): void {
    // TODO
  }

  protected onUpdate() {
    super.onUpdate()
    const lander = this.lander
    if (lander) {
      this.game.world.filter((child: Phaser.Sprite) => {
        return child !== lander.sprite && child.body
      }).list.forEach((child: Phaser.Sprite) => {
        this.game.physics.arcade.collide(lander.sprite, child, this.onLanderCollision, undefined, this)
      }, this)
      lander.update()
    }
  }

  protected onRender() {
    super.onRender()
    if ((window as any).debug) {
      this.game.world.forEach((child: any) => {
        this.game.debug.body(child)
      }, this)
    }
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

    _(tilesets).forEach((tileset, source) => {
      loadTileset(this.game, source, tileset)
    })
  }

  private create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.world.setBounds(0, 0, PHYSICS.worldWidth, PHYSICS.worldHeight)
    this.game.physics.arcade.gravity.y = PHYSICS.gravityY

    this.level1 = new Level1(this.game)
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
