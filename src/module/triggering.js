/**
 * A class to handle any triggering logic and tile modification operations.
 */
export default class Triggering {
  /**
   * Triggering constructor.
   *
   * @param {Collision} collision
   *   The injected Collision dependency.
   */
  constructor(collision) {
    this.collision = collision;
  }

  /**
   * Determine if the tile has been triggered by the token's movement.
   *
   * @param {Token} token
   *   The Token to check for.
   * @param {Tile} tile
   *   The Tile to check for.
   * @param {x,y} initTokenPos
   *   The initial position of the Token before it was updated. X and Y values.
   *
   * @return {boolean}
   *   If the tile has been triggered by the token's movement.
   */
  isTileTriggered(token, tile, initTokenPos) {
    if (!this._isHeyWaitTile(tile)) {
      return false;
    }

    if (this._isPreviouslyTriggered(tile)) {
      return false;
    }

    if (!this.collision.checkTileTokenCollision(tile, token, initTokenPos)) {
      return false;
    }

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
}
