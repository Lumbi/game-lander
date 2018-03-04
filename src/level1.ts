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

export class Level1 extends TiledLevel {
  private lander?: Lander
  private landerStart: Phaser.Point
  private goal?: Phaser.Sprite
  private isTouchingGoal: boolean
  private goalTouchAccumulator: number
  private goalReachThreshold = 50
  private goalReached: boolean

  constructor(game: Phaser.Game) {
    super(game, Tiled.tileMapfromJSON(testMapJson), tilesets)
    this.landerStart = new Phaser.Point(286, 1564)
    this.goalTouchAccumulator = 0
    this.isTouchingGoal = false
    this.goalReached = false
  }

  public reset() {
    this.lander && this.lander.destroy()
    this.goalTouchAccumulator = 0
    this.isTouchingGoal = false
    this.goalReached = false
    this.lander = new Lander(this.game, this.landerStart.x, this.landerStart.y)
  }

  protected onPreload() {
    _(tilesets).forEach((tileset, source) => {
      loadTileset(this.game, source, tileset)
    })
  }

  protected onCreate() {
    this.game.add.tileSprite(0, 0, PHYSICS.worldWidth, PHYSICS.worldHeight, SPRITES.space.key)
    super.onCreate()
    this.reset()

    this.goal = this.game.world.filter((child: PIXI.DisplayObject) => {
      return (child as any).name === "goal"
    }).first
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
    this.isTouchingGoal = false
    const lander = this.lander
    if (lander) {
      this.game.world.filter((child: Phaser.Sprite) => {
        return child !== lander.sprite && child.body
      }).list.forEach((child: Phaser.Sprite) => {
        this.game.physics.arcade.collide(lander.sprite, child, this.onLanderCollision, undefined, this)
      }, this)

      if (!this.isTouchingGoal) {
        this.goalTouchAccumulator = 0
      } else if (this.goalTouchAccumulator >= this.goalReachThreshold) {
        this.onGoalReached()
      }

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

  private onLanderCollision(landerSprite: Phaser.Sprite, otherSprite: Phaser.Sprite) {
    if (this.lander) {
      const landerBody = this.lander.getBody()
      if (landerBody && landerBody.speed > 300) {
        this.lander && this.lander.blowUp()
      } else if (otherSprite === this.goal) {
        this.goalTouchAccumulator++
        this.isTouchingGoal = true
      }
    }
  }

  private onGoalReached() {
    if (!this.goalReached) {
      this.goalReached = true
      if (this.lander) {
        this.lander.controlsEnabled = false
        const winText = this.game.add.text(-this.lander.sprite.width / 2,
                                           -this.lander.sprite.height,
                                           "YOU WIN!!", { fill: "#FFFFFF" })
        this.lander.sprite.addChild(winText)
      }
    }
  }
}

function loadTileset(game: Phaser.Game, source: string, tileset: Tiled.ITileset) {
  game.load.spritesheet(
    source,
    `/assets/${tileset.image}`,
    tileset.tilewidth, tileset.tileheight, tileset.tilecount,
    tileset.margin, tileset.spacing,
  )
}
