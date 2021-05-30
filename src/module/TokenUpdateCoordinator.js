/* eslint-disable no-console */

/**
 * Coordinate any Token updates from the Foundry Hook system.
 */
export default class TokenUpdateCoordinator {
  /**
   * TokenUpdateCoordinator constructor.
   *
   * @param {TriggeringHandler} triggeringHandler
   *   The injected TriggeringHandler dependency.
   * @param {PostTriggerActions} postTriggerActions
   *   The injected PostTriggerActions dependency.
   * @param {SocketController} socketController
   *   The injected SocketController dependency.
   */
  constructor(
    triggeringHandler,
    postTriggerActions,
    socketController,
  ) {
    this.triggeringHandler = triggeringHandler;
    this.postTriggerActions = postTriggerActions;
    this.socketController = socketController;

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
   * @param {TokenDocument} tokenDoc
   *   The Token document getting updated.
   * @param {Array} tiles
   *   All of the potential tiles to check for triggers.
   */
  async coordinateUpdate(tokenDoc, tiles) {
    const t0 = global.performance.now();

    // Let's find the previously stored Token initial position.
    const initPos = this.tokenInitPos.get(tokenDoc.id);

    if (!initPos) {
      // We may not have created an update queued previously, due to a
      // lightweight update or something else. Just cleanup and exit.
      this._cleanQueuedTokenInitPos(tokenDoc.id);
      return;
    }

    const triggeredTile = await this.triggeringHandler.handleTileTriggering(
      tiles,
      tokenDoc,
      initPos,
      tokenDoc.parent.id,
    );

    if (triggeredTile) {
      const token = tokenDoc.object;

      this.socketController.emit(
        tokenDoc.id,
        triggeredTile.id,
        tokenDoc.parent.id,
        { x: token.x, y: token.y },
      );
      await this.postTriggerActions.execute(tokenDoc, triggeredTile);
    }

    const t1 = global.performance.now();
    console.debug(`hey-wait | \`coordinateUpdate\` took ${t1 - t0}ms.`);

    this._cleanQueuedTokenInitPos(tokenDoc.id);
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
