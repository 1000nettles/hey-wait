/* eslint-disable no-console */
/* global performance */

/**
 * Coordinate any Token updates from the Foundry Hook system.
 */
export default class TokenUpdateCoordinator {
  /**
   * TokenUpdateCoordinator constructor.
   *
   * @param {Triggering} triggering
   *   The injected Triggering dependency.
   */
  constructor(triggering) {
    this.triggering = triggering;

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
   * @param {Array} tiles
   *   All of the potential tiles to check for triggers.
   * @param {string} viewedScene
   *   The ID of the currently viewed scene.
   */
  async coordinateUpdate(token, tiles, viewedScene) {
    const t0 = performance.now();

    // Let's find the previously stored Token initial position.
    const initPos = this.tokenInitPos.get(token._id);

    if (!initPos) {
      // We may not have created an update queued previously, due to a
      // lightweight update or something else. Just cleanup and exit.
      this._cleanQueuedTokenInitPos(token._id);
      return;
    }

    const wasTriggered = await this.triggering.handleTileTriggering(
      tiles,
      token,
      initPos,
      viewedScene,
    );

    if (wasTriggered) {
      // Do any animations or sounds relating to the token here.
    }

    this._cleanQueuedTokenInitPos(token._id);
    const t1 = performance.now();

    console.debug(`hey-wait | \`coordinateUpdate\` took ${t1 - t0}ms.`);
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
