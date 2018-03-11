import * as _ from "lodash"

export interface ITiledMap {
  height: number
  layers: ILayer[],
  nextobjectid: number
  orientation: "orthogonal"
  renderorder: "right-down"
  tiledversion: string
  tileheight: number
  tilesets: ITilesetRef[]
  tilewidth: number
  type: "map"
  version: number
  width: number
}

export interface ITileset {
  columns: number
  image: string
  imageheight: number
  imagewidth: number
  margin: number
  name: string
  spacing: number
  tilecount: number
  tileheight: number
  tilewidth: number,
  tiles?: {
    [tileId: string]: {
      objectgroup?: IObjectGroup,
      type?: string,
    },
  }
}

export interface ITilesetDict {
  [source: string]: ITileset
}

export interface ITilesetRef {
  firstgid: number
  source: string
}

export interface ILayer {
  name: string
  width: number
  height: number
  x: number
  y: number
  type: "tilelayer" | "objectgroup"
  visible: boolean
  opacity: number,
  properties?: {
  }
}

export interface ITileLayer extends ILayer {
  type: "tilelayer"
  data: number[]
}

export interface IObjectGroup extends ILayer {
  type: "objectgroup"
  draworder: "topdown"
  offsetx: number
  offsety: number
  objects: IObject[]
}

export function isObjectGroup(layer: ILayer): layer is IObjectGroup {
  return layer.type === "objectgroup"
}

export interface IObject {
  id: number
  name: string
  rotation: number
  type: string
  visible: boolean
  x: number
  y: number
}

export interface IPointObject extends IObject {
  point: true
  width: 0
  height: 0
}

export interface IRectangleObject extends IObject {
  width: number
  height: number
}

export interface ITileObject extends IRectangleObject {
  gid: number
}

export function findTilesetRef(object: ITileObject, map: ITiledMap): ITilesetRef | undefined {
  return _(map.tilesets)
    .sortBy("firstgid")
    .findLast((ref) => ref.firstgid <= object.gid)
}

export function getTileId(object: ITileObject, tilesetRef: ITilesetRef): number {
  return object.gid - tilesetRef.firstgid
}

export function findTileset(tilesetRef: ITilesetRef, tilesets: ITilesetDict): ITileset | undefined {
  return tilesets[tilesetRef.source]
}

export function tileMapfromJSON(json: any): ITiledMap {
  return json as ITiledMap
}

export function tilesetFromJSON(json: any): ITileset {
  return json as ITileset
}

export function isPointObject(object: IObject): object is IPointObject {
  return (object as IPointObject).point === true
}

export function isRectangleObject(object: IObject): object is IRectangleObject {
  return typeof (object as IRectangleObject).width === "number" &&
    typeof (object as IRectangleObject).height === "number"
}

export function isTileObject(object: IObject): object is ITileObject {
  return isRectangleObject(object) &&
    typeof (object as ITileObject).gid === "number"
}
