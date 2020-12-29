/* eslint-disable no-console */

import Animator from './animator';

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
   * @param {GameChanger} gameChanger
   *   The current GameChanger instance.
   * @param {AnimationCoordinator} animationCoordinator
   *   The current AnimationCoordinator instance.
   * @param {EntityFinder} entityFinder
   *   The current EntityFinder instance.
   */
  constructor(socket, user, gameChanger, animationCoordinator, entityFinder) {
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
     * The current AnimationCoordinator instance.
     */
    this.animationCoordinator = animationCoordinator;

    /**
     * The injected EntityFinder dependency.
     */
    this.entityFinder = entityFinder;

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
   * @param {string} tokenId
   *   The ID of the Token that has collided with the Tile.
   * @param {string} tileId
   *   The ID of the Tile that the Token has collided with.
   * @param sceneId
   *   The scene ID where this is taking place.
   *
   * @return {Promise<void>}
   *   The promise for what's taking place.
   */
  async emit(tokenId, tileId, sceneId) {
    console.debug(`hey-wait | Emitting to ${this.socketName}`);

    this.socket.emit(
      this.socketName,
      {
        tokenId, tileId, sceneId,
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
        const scene = this.entityFinder.findScene(data.sceneId);
        const token = this.entityFinder.findTokenData(
          data.tokenId,
          data.sceneId,
        );

        await this.gameChanger.execute(
          data.tileId,
          { x: token.x, y: token.y },
          data.sceneId,
        );

        const tileData = this.entityFinder.findTileData(data.tileId, data.sceneId);
        const animType = tileData?.flags?.['hey-wait']?.animType
          ?? Animator.animationTypes.TYPE_NONE;

        await this.animationCoordinator.handleTokenAnimationAfterUpdate(
          scene,
          token,
          animType,
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
