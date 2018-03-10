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
  private readonly goalReachThreshold = 50
  private goalReached: boolean
  private collectedStarCount: number
  private starCountText?: Phaser.Text
  private maxStarCount: number

  constructor(game: Phaser.Game) {
    super(game, Tiled.tileMapfromJSON(testMapJson), tilesets)
    this.landerStart = new Phaser.Point(286, 1564)
    this.goalTouchAccumulator = 0
    this.isTouchingGoal = false
    this.goalReached = false
    this.collectedStarCount = 0
    this.maxStarCount = 0
  }

  public reset() {
    this.lander && this.lander.destroy()
    this.goalTouchAccumulator = 0
    this.isTouchingGoal = false
    this.goalReached = false
    this.collectedStarCount = 0
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
    this.maxStarCount = this.game.world.filter((child: any) => child.name === "collectible_star" ).list.length
    this.starCountText = this.game.add.text(0, 0, "", { fill: "#FFFFFF" })
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

      this.updateCollectStars(lander)

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

  private updateCollectStars(lander: Lander) {
    this.game.world.filter((child: any) => {
      return child.name === "collectible_star"
    }).list.forEach((star: Phaser.Sprite) => {
      const landerBounds = (lander.sprite.getBounds() as any) as Phaser.Rectangle
      const starBounds = (star.getBounds() as any) as Phaser.Rectangle
      if (Phaser.Rectangle.intersects(landerBounds, starBounds)) {
        this.collectStar(star)
      }
    }, this)

    if (this.starCountText) {
      this.starCountText.position.x = lander.sprite.position.x
      this.starCountText.position.y = lander.sprite.position.y + (lander.sprite.height / 2)
      if (this.maxStarCount > 0 && lander.alive) {
        this.starCountText.visible = true
        this.starCountText.text = `${this.collectedStarCount}/${this.maxStarCount}`
      } else {
        this.starCountText.visible = false
      }
    }
  }

  private collectStar(star: Phaser.Sprite) {
    this.collectedStarCount++
    star.destroy()
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
