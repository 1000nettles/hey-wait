/* eslint-disable no-console */

import Animator from './Animator';

/**
 * A class to handle any triggering logic and tile modification operations.
 */
export default class Triggering {
  /**
   * Triggering constructor.
   *
   * @param {GameChanger} gameChanger
   *   The injected GameChanger dependency.
   * @param {TokenAnimationWatcher} tokenAnimationWatcher
   *   The injected TokenAnimationWatcher dependency.
   * @param {SocketController} socketController
   *   The injected SocketController dependency.
   * @param {Collision} collision
   *   The injected Collision dependency.
   * @param {MacroOperations} macroOperations
   *   The injected MacroOperations dependency.
   */
  constructor(
    gameChanger,
    tokenAnimationWatcher,
    socketController,
    collision,
    macroOperations,
  ) {
    this.gameChanger = gameChanger;
    this.tokenAnimationWatcher = tokenAnimationWatcher;
    this.socketController = socketController;
    this.collision = collision;
    this.macroOperations = macroOperations;
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
   * @param {string} viewedScene
   *   The ID of the currently viewed scene.
   *
   * @return {Promise<Tile|null>}
   */
  async handleTileTriggering(tiles, tokenDoc, initPos, viewedScene) {
    for (const tile of tiles) {
      if (!this._isTileTriggered(tile, tokenDoc, initPos)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      await this._executeTrigger(tokenDoc, tile, viewedScene);
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

    if (this._isPreviouslyTriggered(tile)) {
      return false;
    }

    if (!this.collision.checkTileTokenCollision(tile, tokenDoc.object, initTokenPos)) {
      return false;
    }

    return true;
  }

  /**
   * Execute triggered functionality, like changing the game and emitting
   * the execution to the SocketController.
   *
   * @param {TokenDocument} tokenDoc
   *   The TokenDocument that triggered the tile.
   * @param {Tile} tile
   *   The tile that was triggered.
   * @param {string} viewedScene
   *   The ID of the currently viewed scene.
   *
   * @private
   */
  async _executeTrigger(tokenDoc, tile, viewedScene) {
    const token = tokenDoc.object;

    try {
      await this.gameChanger.execute(
        tile.id,
        { x: token.x, y: token.y },
        viewedScene,
      );
    } catch (e) {
      console.error(`hey-wait | ${e.name}: ${e.message}`);
    }

    // Ensure the Token's movement across the canvas, (the animation), is
    // fully complete before emitting the Hey, Wait! event to other players.
    await this.tokenAnimationWatcher.watchForCompletion(tokenDoc.id);

    this.macroOperations.handleTileMacroFiring(tile.id, tokenDoc);

    const animType = tile.data?.flags?.['hey-wait']?.animType
      ?? Animator.animationTypes.TYPE_NONE;

    const coords = { x: token.x, y: token.y };

    // Emit the triggering to other users to their games can adjust accordingly.
    const socketControllerPromise = this.socketController.emit(
      tokenDoc.id,
      tile.id,
      viewedScene,
      coords,
      animType,
    );

    // ...and at the same time, pan to the Token's new position.
    const panPromise = this.gameChanger.pan(coords);

    await Promise.all([socketControllerPromise, panPromise]);
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
