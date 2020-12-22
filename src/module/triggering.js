import Constants from './constants';

/**
 * A class to handle any triggering logic and tile modification operations.
 */
export default class Triggering {
  constructor(collision) {
    this.collision = collision;
  }

  /**
   * Determine if the tile has been triggered by the token's movement.
   *
   * @param {Token} token
   *   The Token to check for.
   * @param tile
   *   The Tile to check for.
   *
   * @return {boolean}
   *   If the tile has been triggered by the token's movement.
   */
  isTriggered(token, tile) {
    if (!this._isHeyWaitTile(tile)) {
      return false;
    }

    if (this._isPreviouslyTriggered(tile)) {
      return false;
    }

    if (!this.collision.checkTileTokenCollision(tile, token)) {
      return false;
    }

    return true;
  }

  /**
   * Handle the token triggering Hey, Wait! functionality if it is applicable.
   *
   * @param {Token} token
   *   The Token that potentially will trigger the functionality.
   * @param {Tile} tile
   *   The relevant Tile.
   * @return {Boolean}
   *   Return triggering took place.
   */
  handleTileChange(tile) {
    const finalTile = this._adjustTriggeredTile(tile);

    finalTile.update(
      finalTile.data,
      { diff: false },
    );

    return true;
  }

  /**
   * If the tile is a valid Hey, Wait! tile.
   *
   * @param {Tile} tile
   *   The relevant Tile for checking.
   *
   * @return {boolean}
   * @private
   */
  _isHeyWaitTile(tile) {
    return Boolean(
      tile.data?.flags?.['hey-wait']?.enabled,
    );
  }

  /**
   * If the tile was previously triggered.
   *
   * @param {Tile} tile
   *   The relevant Tile for checking.
   *
   * @return {boolean}
   * @private
   */
  _isPreviouslyTriggered(tile) {
    return Boolean(
      tile.data?.flags?.['hey-wait']?.triggered,
    );
  }

  /**
   * Update the tile to reflect that it has been triggered.
   *
   * @param {Tile} tile
   *   The relevant triggered Tile.
   *
   * @private
   */
  _adjustTriggeredTile(tile) {
    const finalTile = tile;
    finalTile.data.flags['hey-wait'].triggered = true;
    finalTile.data.img = Constants.TILE_GREEN_PATH;

    return finalTile;
  }
}
