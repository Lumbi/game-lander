import "phaser-ce"
import * as Tiled from "./tiled_editor"
import { loadMap } from "./tiled_loader"
import * as _ from "lodash"

export abstract class Level {

  protected game: Phaser.Game

  constructor(game: Phaser.Game) {
    this.game = game
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

  protected abstract onCreate(): void

  protected abstract onUpdate(): void

  protected abstract onRender(): void
}

export class TiledLevel extends Level {

  protected map: Tiled.ITiledMap
  protected tilesets: Tiled.ITilesetDict

  constructor(game: Phaser.Game, map: Tiled.ITiledMap, tilesets: Tiled.ITilesetDict) {
    super(game)

    this.map = map
    this.tilesets = tilesets
  }

  protected onCreate(): void {
    loadMap(this.map, this.game, {
      layer: (layer) => {
        const group = this.game.add.group()
        return group
      },
      tile: (group, tileObject) => {
        let sprite: Phaser.Sprite | undefined
        const tilesetRef = Tiled.findTilesetRef(tileObject, this.map)
        if (tilesetRef) {
          const tileId = Tiled.getTileId(tileObject, tilesetRef)
          sprite = this.game.add.sprite(tileObject.x, tileObject.y, tilesetRef.source, tileId)
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
        return sprite
      },
    })
  }

  protected onUpdate(): void {
    // TODO
  }

  protected onRender(): void {
    // TODO
  }
}
