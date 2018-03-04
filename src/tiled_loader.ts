import "phaser-ce"
import * as Tiled from "./tiled_editor"

// tileMap.layers.forEach((layer) => {
//   switch (layer.type) {
//     case "objectgroup":
//       const objectGroup = layer as IObjectGroup
//       objectGroup.objects.forEach((object) => {
//         const tilesetRef = _(tileMap.tilesets)
//           .sortBy("firstgid")
//           .findLast((ref) => ref.firstgid <= object.gid)
//         if (tilesetRef) {
//           const tileId = object.gid - tilesetRef.firstgid
//           const sprite = this.game.add.sprite(object.x, object.y, tilesetRef.source, tileId)
//           const tileset = tilesets[tilesetRef.source]
//           if (tileset) {
//             if (tileset.tiles) {
//               const tile = tileset.tiles[tileId]
//               if (tile) {
//                 tile.objectgroup && tile.objectgroup.objects && tile.objectgroup.objects.forEach((subobject) => {
//                   if (subobject.type === "collider") {
//                     this.game.physics.arcade.enable(sprite)
//                     const body = sprite.body as Phaser.Physics.Arcade.Body
//                     body.immovable = true
//                     body.allowGravity = false // TODO make configurable
//                     body.width = subobject.width
//                     body.height = subobject.height
//                     body.offset.x = subobject.x
//                     body.offset.y = subobject.y

export interface IMapLoader {
  layer: (layer: Tiled.ILayer) => Phaser.Group | undefined
  tile: (group: Phaser.Group, tile: Tiled.ITileObject) => Phaser.Sprite | undefined
}

export function loadMap(map: Tiled.ITiledMap, game: Phaser.Game, load: IMapLoader): void {
  map.layers.forEach((layer) => {
    const group = load.layer(layer)
    if (group) {
      group.visible = layer.visible
      group.alpha = layer.opacity
      if (Tiled.isObjectGroup(layer)) {
        layer.objects.forEach((object) => {
          let sprite: Phaser.Sprite | undefined
          if (Tiled.isTileObject(object)) {
            sprite = load.tile(group, object)
          }
          if (sprite) {
            sprite.x = object.x
            sprite.y = object.y
            sprite.rotation = object.rotation
            sprite.visible = object.visible
          }
        })
      }
    }
  })
}
