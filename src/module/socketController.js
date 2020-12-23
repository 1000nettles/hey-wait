/* eslint-disable no-console */

/**
 * A controller for handling socket related operations for our module.
 */
export default class SocketController {
  /**
   * SocketController constructor.
   *
   * @param {Socket} socket
   *   The current Socket instance.
   * @param {User} user
   *   The current User instance.
   * @param {Canvas} canvas
   *   The current Canvas instance.
   * @param {GameChanger} gameChanger
   *   The current GameChanger instance.
   */
  constructor(socket, user, gameChanger) {
    /**
     * The current WebSocket instance.
     *
     * @type {Object}
     */
    this.socket = socket;

    /**
     * The current WebSocket instance.
     *
     * @type {User}
     */
    this.user = user;

    /**
     * The current GameChanger instance.
     *
     * @type {GameChanger}
     */
    this.gameChanger = gameChanger;

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
   * Emit any Hey, Wait! events that occurred.
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
   * Any event received will subsequently call the GameChanger to ensure the
   * event takes place in the current user's game.
   *
   * @return {Promise<void>}
   *
   * @private
   */
  async _listen() {
    this.socket.on(this.socketName, async (data) => {
      console.debug(`hey-wait | Emission received on ${this.socketName}`);

      try {
        await this.gameChanger.execute(
          data.tileId,
          { x: data.x, y: data.y },
          data.sceneId,
        );
      } catch (e) {
        console.error(`hey-wait | ${e.name}: ${e.message}`);
      }
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
}
