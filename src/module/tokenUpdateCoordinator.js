/* eslint-disable no-console */
/* global performance */

/**
 * Coordinate any Token updates from the Foundry Hook system.
 */
export default class TokenUpdateCoordinator {
  /**
   * TokenUpdateCoordinator constructor.
   *
   * @param {Game} game
   *   The injected Game dependency.
   * @param {Canvas} canvas
   *   The injected Canvas dependency.
   * @param {SocketController} socketController
   *   The injected SocketController dependency.
   * @param {Triggering} triggering
   *   The injected Triggering dependency.
   * @param {GameChanger} gameChanger
   *   The injected GameChanger dependency.
   */
  constructor(game, canvas, socketController, triggering, gameChanger) {
    this.game = game;
    this.canvas = canvas;
    this.socketController = socketController;
    this.triggering = triggering;
    this.gameChanger = gameChanger;

    /**
     * Keep track of the Token's initial position between updates.
     *
     * @type {Map<any, any>}
     */
    this.tokenInitPos = new Map();
  }

  /**
   * Register the Token's initial position to be used later.
   *
   * We need to cache this in memory as the next update does not contain the
   * relevant starting info.
   *
   * @param {Token} token
   *   The Token to be registered.
   */
  registerTokenInitPos(token) {
    if (!token) {
      return;
    }

    this.tokenInitPos.set(
      token._id,
      {
        x: token.x,
        y: token.y,
      },
    );
  }

  /**
   * Coordinate a Token update.
   *
   * Checks all applicable tiles for if they have been triggered or not. If
   * they have, execute the functionality for triggering a tile.
   *
   * @param {Token} token
   *   The Token getting updated.
   * @param tiles
   *   All of the potential tiles to check for triggers.
   */
  async coordinateUpdate(token, tiles) {
    // Let's find the previously stored Token initial position.
    const initPos = this.tokenInitPos.get(token._id);

    if (!initPos) {
      // We may not have created an update queued previously, due to a
      // lightweight update or something else. Just cleanup and exit.
      this._cleanQueuedTokenInitPos(token._id);
      return;
    }

    const t0 = performance.now();

    tiles.every(async (tile) => {
      if (!this.triggering.isTileTriggered(token, tile, initPos)) {
        return true;
      }

      await this._handleTrigger(token, tile);

      return false;
    });

    this._cleanQueuedTokenInitPos(token._id);
    const t1 = performance.now();

    console.debug(`hey-wait | \`coordinateUpdate\` took ${t1 - t0}ms.`);
  }

  /**
   * Execute triggered functionality like pausing the game and panning over
   * to the token that triggered the tile.
   *
   * @param {Token} token
   *   The token that triggered the tile.
   * @param {Tile} tile
   *   The tile that was triggered.
   *
   * @private
   */
  async _handleTrigger(token, tile) {
    const { x, y } = token;

    try {
      await this.gameChanger.execute(
        tile.data._id,
        { x, y },
        this.game.user.viewedScene,
      );
    } catch (e) {
      console.error(`hey-wait | ${e.name}: ${e.message}`);
    }

    // Emit the triggering to other users to their games can adjust accordingly.
    await this.socketController.emit(
      x,
      y,
      tile.data._id,
      this.game.user.viewedScene,
    );
  }

  /**
   * Clean up any queued Tokens initial positions pertaining to the provided
   * Token ID.
   *
   * @param {string} tokenId
   *   The associated Token ID with the queued initial position.
   *
   * @private
   */
  _cleanQueuedTokenInitPos(tokenId) {
    this.tokenInitPos.delete(tokenId);
  }
}
