/* eslint-disable no-console */

import Constants from './constants';

/**
 * A controller for handling socket related operations for our module.
 */
export default class SocketController {
  /**
   * SocketController constructor.
   *
   * @param {Socket} socket
   *   The current Socket instance.
   * @param {Game} game
   *   The current Game instance.
   * @param {User} user
   *   The current User instance.
   * @param {Canvas} canvas
   *   The current Canvas instance.
   * @param {Triggering} triggering
   *   The current Triggering instance.
   */
  constructor(socket, game, user, canvas, triggering) {
    /**
     * The current WebSocket instance.
     *
     * @type {WebSocket}
     */
    this.socket = socket;

    /**
     * The current Game instance.
     *
     * @type {Game}
     */
    this.game = game;

    /**
     * The current WebSocket instance.
     *
     * @type {User}
     */
    this.user = user;

    /**
     * The current Canvas instance.
     *
     * @type {Canvas}
     */
    this.canvas = canvas;

    /**
     * The current Triggering instance.
     *
     * @type {Triggering}
     */
    this.triggering = triggering;

    /**
     * The name of our socket.
     *
     * @type {string}
     */
    this.socketName = 'module.hey-wait';
  }

  /**
   * Initialize any socket controller behaviour.
   *
   * @return {Promise<void>}
   */
  async init() {
    await this._listen();
  }

  /**
   * Deactivate the currently open socket.
   *
   * @return {Promise<void>}
   */
  async deactivate() {
    await this._removeListener();
  }

  /**
   * Emit any canvas pan operations that need to take place to players.
   *
   * @param {number} x
   *   X coordinate of where the canvas should pan to.
   * @param {number} y
   *   Y coordinate of where the canvas should pan to.
   * @param {string} tileId
   *   The ID of the tile that the token has collided with.
   * @param sceneId
   *   The scene ID where this is taking place.
   *
   * @return {Promise<void>}
   *   The promise for what's taking place.
   */
  async emit(x, y, tileId, sceneId) {
    console.debug(`hey-wait | Emitting to ${this.socketName}`);

    this.socket.emit(
      this.socketName,
      {
        x, y, tileId, sceneId,
      },
    );
  }

  /**
   * Listen for events on our module's socket.
   *
   * Any event received will subsequently pan the canvas to the specified spot.
   * If the GM is on another scene, they will be moved to the scene where
   * the Hey, Wait! trigger occurred.
   *
   * @return {Promise<void>}
   *
   * @private
   */
  async _listen() {
    this.socket.on(this.socketName, async (data) => {
      console.debug(`hey-wait | Emission received on ${this.socketName}`);

      if (this.user.isGM) {
        // The GM might be off on another scene, so if something has triggered
        // on a tile, let's get the GM to pause the action for them.
        this.game.togglePause(true, true);

        // Bring the GM to the scene if they are not here.
        if (this.user.viewedScene !== data.sceneId) {
          const scene = this.game.scenes.get(data.sceneId);

          if (!scene) {
            console.error(`hey-wait | Could not find a scene with ID ${data.sceneId}`);
          }

          await scene.view();

          const tile = this.canvas.tiles.get(data.tileId);

          if (!tile) {
            console.error(`hey-wait | Could not find a tile with ID ${data.tileId}`);
          }

          this.triggering.handleTileChange(tile);
        }
      } else if (!this._shouldShowInScene(data.sceneId)) {
        return;
      }

      this.canvas.animatePan({
        x: data.x,
        y: data.y,
        scale: Math.max(1, this.canvas.stage.scale.x),
        duration: Constants.CANVAS_PAN_DURATION,
      });
    });
  }

  /**
   * Remove the associated socket listener.
   *
   * @return {Promise<void>}
   *
   * @private
   */
  async _removeListener() {
    this.socket.off(this.socketName);
  }

  /**
   * Determine if we should be executing anything on the provided scene ID.
   *
   * This checks if the current user is viewing the associated scene or not.
   *
   * @param {string} sceneId
   *   The provided scene ID that the action took place on.
   *
   * @return {boolean}
   *   If we should show in the provided scene or not.
   *
   * @private
   */
  _shouldShowInScene(sceneId) {
    return (this.user.viewedScene === sceneId);
  }
}
