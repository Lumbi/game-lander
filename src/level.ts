import "phaser-ce"
import * as Tiled from "./tiled"
import * as _ from "lodash"

export class Waypoint extends Phaser.Point {

  public tag: string

  constructor(tag: string, x?: number, y?: number) {
    super(x, y)
    this.tag = tag
  }
}

export abstract class Level {

  protected game: Phaser.Game
  protected waypoints: Waypoint[]

  constructor(game: Phaser.Game) {
    this.game = game
    this.waypoints = []
  }

  public preload() {
    this.onPreload()
  }

  public create() {
    this.onCreate()
  }

  public update() {
    this.onUpdate()
  }

  public render() {
    this.onRender()
  }

  protected abstract onPreload(): void

  protected abstract onCreate(): void

  protected abstract onUpdate(): void

  protected abstract onRender(): void
}

export abstract class TiledLevel extends Level {

  protected map: Tiled.ITiledMap
  protected tilesets: Tiled.ITilesetDict

  constructor(game: Phaser.Game, map: Tiled.ITiledMap, tilesets: Tiled.ITilesetDict) {
    super(game)

    this.map = map
    this.tilesets = tilesets
  }

  protected loadLayer(layerObject: Tiled.ILayer) {
    // TODO
  }

  protected loadPoint(pointObject: Tiled.IPointObject) {
    this.onPointLoaded(pointObject, new Phaser.Point(pointObject.x, pointObject.y))
  }

  protected loadTile(tileObject: Tiled.ITileObject) {
    let sprite: Phaser.Sprite | undefined
    const tilesetRef = Tiled.findTilesetRef(tileObject, this.map)
    if (tilesetRef) {
      const tileId = Tiled.getTileId(tileObject, tilesetRef)
      sprite = this.game.add.sprite(tileObject.x, tileObject.y, tilesetRef.source, tileId)
      sprite.rotation = tileObject.rotation
      sprite.visible = tileObject.visible
      const tileset = Tiled.findTileset(tilesetRef, this.tilesets)
      if (tileset && tileset.tiles) {
        const tileGroups = tileset.tiles[tileId]
        if (tileGroups) {
          for (const tileSubobject of tileGroups.objectgroup.objects) {
            if (Tiled.isRectangleObject(tileSubobject)) {
              if (tileSubobject.type === "collider") {
                if (sprite) {
                  this.game.physics.enable(sprite)
                  const body = sprite.body as Phaser.Physics.Arcade.Body
                  body.offset.x = tileSubobject.x
                  body.offset.y = tileSubobject.y
                  body.width = tileSubobject.width
                  body.height = tileSubobject.height
                  body.immovable = true
                  body.allowGravity = false
                }
              }
            }
          }
        }
      }
    }
    if (sprite) {
      this.onTileLoaded(tileObject, sprite)
    }
  }

  protected onCreate(): void {
    this.map.layers.forEach((layer) => {
      this.loadLayer(layer)
      if (Tiled.isObjectGroup(layer)) {
        layer.objects.forEach((object) => {
          if (Tiled.isPointObject(object)) {
            this.loadPoint(object)
          } else if (Tiled.isTileObject(object)) {
            this.loadTile(object)
          }
        })
      }
    })
  }

  protected abstract onLayerLoaded(layer: Tiled.ILayer): void

  protected abstract onPointLoaded(pointObject: Tiled.IPointObject, point: Phaser.Point): void

  protected abstract onTileLoaded(tile: Tiled.ITileObject, sprite: Phaser.Sprite): void

  protected onUpdate(): void {
    // TODO
  }

  protected onRender(): void {
    // TODO
  }
}
