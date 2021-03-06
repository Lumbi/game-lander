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

  public abstract preload(): void
  public abstract create(): void
  public abstract update(): void
  public abstract render(): void

  public destroy() {
    this.game.world.removeAll(true)
  }
}

export abstract class TiledLevel extends Level {

  protected map: Tiled.ITiledMap
  protected tilesets: Tiled.ITilesetDict

  constructor(game: Phaser.Game, map: Tiled.ITiledMap, tilesets: Tiled.ITilesetDict) {
    super(game)

    this.map = map
    this.tilesets = tilesets
  }

  public create(): void {
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
      sprite.name = tileObject.name
      sprite.rotation = tileObject.rotation
      sprite.visible = tileObject.visible
      const tileset = Tiled.findTileset(tilesetRef, this.tilesets)
      if (tileset && tileset.tiles) {
        const tileGroup = tileset.tiles[tileId]
        if (tileGroup) {
          sprite.name = sprite.name || tileGroup.type || ""
          if (tileGroup.objectgroup) {
            for (const tileSubobject of tileGroup.objectgroup.objects) {
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
    }
    if (sprite) {
      this.onTileLoaded(tileObject, sprite)
    }
  }

  protected abstract onLayerLoaded(layer: Tiled.ILayer): void

  protected abstract onPointLoaded(pointObject: Tiled.IPointObject, point: Phaser.Point): void

  protected abstract onTileLoaded(tile: Tiled.ITileObject, sprite: Phaser.Sprite): void
}
