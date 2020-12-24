/* global PIXI */
/* global loadTexture */

import Constants from './constants';

/**
 * Adds patterning to Tiles.
 */
export default class Patterner {
  /**
   * Add a "patterned" texture to a Tile, instead of a single image.
   *
   * @param {Tile} tile
   *   The Tile to add the patterned texture to.
   *
   * @return {Promise<void>}
   */
  async addPatterningToTile(tile) {
    const newTile = tile;

    let texturePath = Constants.TILE_STOP_PATH;
    let width = Constants.TILE_STOP_WIDTH;
    let height = Constants.TILE_STOP_HEIGHT;

    if (newTile.data?.flags?.['hey-wait']?.triggered) {
      texturePath = Constants.TILE_GO_PATH;
      width = Constants.TILE_GO_WIDTH;
      height = Constants.TILE_GO_HEIGHT;
    }

    const texture = await loadTexture(
      texturePath,
      { fallback: Constants.TILE_FALLBACK_PATH },
    );

    const tilingImg = new PIXI.TilingSprite(texture, width, height);

    newTile.tile.removeChild(newTile.tile.img);
    newTile.tile.img = newTile.tile.addChild(tilingImg);
    newTile.refresh();
  }
}
