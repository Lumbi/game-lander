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

  constructor(game: Phaser.Game) {
    super(game, Tiled.tileMapfromJSON(testMapJson), tilesets)
    this.landerStart = new Phaser.Point(286, 1564)
  }

  public reset() {
    this.lander && this.lander.destroy()
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

function loadTileset(game: Phaser.Game, source: string, tileset: Tiled.ITileset) {
  game.load.spritesheet(
    source,
    `/assets/${tileset.image}`,
    tileset.tilewidth, tileset.tileheight, tileset.tilecount,
    tileset.margin, tileset.spacing,
  )
}
