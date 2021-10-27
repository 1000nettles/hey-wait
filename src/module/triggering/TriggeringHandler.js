/* eslint-disable no-console */

/* global _levels */
/* global _levelsModuleName */

/**
 * A class to handle any triggering logic and tile modification operations.
 */
export default class TriggeringHandler {
  /**
   * TriggeringHandler constructor.
   *
   * @param {Collision} collision
   *   The injected Collision dependency.
   * @param {TriggerActions} triggerActions
   *   The injected TriggerActions dependency.
   */
  constructor(
    collision,
    gameChanger,
    tokenAnimationWatcher,
  ) {
    this.collision = collision;
    this.gameChanger = gameChanger;
    this.tokenAnimationWatcher = tokenAnimationWatcher;
  }

  /**
   * Handle the tile triggering, and take action if a tile is triggered.
   *
   * @param {Array} tiles
   *   The Tiles to check for triggering.
   * @param {TokenDocument} tokenDoc
   *   The TokenDocument to check the trigger from.
   * @param {x,y} initPos
   *   The initial position of the Token.
   * @param {string} viewedSceneId
   *   The ID of the currently viewed scene.
   *
   * @return {Promise<Tile|null>}
   */
  async handleTileTriggering(tiles, tokenDoc, initPos, viewedSceneId) {
    const token = tokenDoc.object;

    for (const tile of tiles) {
      if (!this._isTileTriggered(tile, tokenDoc, initPos)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        await this.gameChanger.execute(
          tile.id,
          { x: token.x, y: token.y },
          viewedSceneId,
        );
      } catch (e) {
        global.console.error(`hey-wait | ${e.name}: ${e.message}`);
      }

      // eslint-disable-next-line no-await-in-loop
      await this.tokenAnimationWatcher.watchForCompletion(tokenDoc.id);

      return Promise.resolve(tile);
    }

    return Promise.resolve(null);
  }

  /**
   * Determine if the tile has been triggered by the token's movement.
   *
   * @param {Tile} tile
   *   The Tile to check for.
   * @param {TokenDocument} tokenDoc
   *   The TokenDocument to check for.
   * @param {x,y} initTokenPos
   *   The initial position of the Token before it was updated. X and Y values.
   *
   * @return {boolean}
   *   If the tile has been triggered by the token's movement.
   */
  _isTileTriggered(tile, tokenDoc, initTokenPos) {
    if (!this._isHeyWaitTile(tile)) {
      return false;
    }

    if (!this._checkIsValidWithOtherModules(tile, tokenDoc.object)) {
      return false;
    }

    if (this._isPreviouslyTriggered(tile)) {
      return false;
    }

    if (!this.collision.checkTileTokenCollision(tile, tokenDoc.object, initTokenPos)) {
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
   *
   * @private
   */
  _isHeyWaitTile(tile) {
    return Boolean(
      tile.data?.flags?.['hey-wait']?.enabled,
    );
  }

  _checkIsValidWithOtherModules(tile, token) {
    // If the Levels module is enabled, ensure we don't trigger on a wrong level.
    if (
      typeof _levels !== 'undefined'
      && typeof _levelsModuleName !== 'undefined'
      && !_levels.isTokenInRange(token, tile)
    ) {
      return false;
    }

    return true;
  }

  /**
   * If the tile was previously triggered.
   *
   * @param {Tile} tile
   *   The relevant Tile for checking.
   *
   * @return {boolean}
   *
   * @private
   */
  _isPreviouslyTriggered(tile) {
    return Boolean(
      tile.data?.flags?.['hey-wait']?.triggered,
    );
  }
}
