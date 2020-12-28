/* eslint-disable no-console */

/**
 * A class to handle any triggering logic and tile modification operations.
 */
export default class Triggering {
  /**
   * Triggering constructor.
   *
   * @param {GameChanger} gameChanger
   *   The injected GameChanger dependency.
   * @param {SocketController} socketController
   *   The injected SocketController dependency.
   * @param {Collision} collision
   *   The injected Collision dependency.
   */
  constructor(gameChanger, socketController, collision) {
    this.gameChanger = gameChanger;
    this.socketController = socketController;
    this.collision = collision;
  }

  /**
   * Handle the tile triggering, and take action if a tile is triggered.
   *
   * @param {Array} tiles
   *   The Tiles to check for triggering.
   * @param {Token} token
   *   The token to check the trigger from.
   * @param {x,y} initPos
   *   The initial position of the Token.
   * @param {string} viewedScene
   *   The ID of the currently viewed scene.
   *
   * @return {Promise<boolean>}
   */
  async handleTileTriggering(tiles, token, initPos, viewedScene) {
    let hasBeenTriggered = false;

    for (const tile of tiles) {
      if (!this._isTileTriggered(tile, token, initPos)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      await this._executeTrigger(token, tile, viewedScene);
      hasBeenTriggered = true;
      break;
    }

    return hasBeenTriggered;
  }

  /**
   * Determine if the tile has been triggered by the token's movement.
   *
   * @param {Tile} tile
   *   The Tile to check for.
   * @param {Token} token
   *   The Token to check for.
   * @param {x,y} initTokenPos
   *   The initial position of the Token before it was updated. X and Y values.
   *
   * @return {boolean}
   *   If the tile has been triggered by the token's movement.
   */
  _isTileTriggered(tile, token, initTokenPos) {
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
   * Execute triggered functionality, like changing the game and emitting
   * the execution to the SocketController.
   *
   * @param {Token} token
   *   The token that triggered the tile.
   * @param {Tile} tile
   *   The tile that was triggered.
   * @param {string} viewedScene
   *   The ID of the currently viewed scene.
   *
   * @private
   */
  async _executeTrigger(token, tile, viewedScene) {
    const { x, y } = token;

    try {
      await this.gameChanger.execute(
        tile.data._id,
        { x, y },
        viewedScene,
      );
    } catch (e) {
      console.error(`hey-wait | ${e.name}: ${e.message}`);
    }

    // Emit the triggering to other users to their games can adjust accordingly.
    await this.socketController.emit(
      token._id,
      tile.data._id,
      viewedScene,
    );
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
