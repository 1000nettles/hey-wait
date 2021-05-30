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
   * @param {GameChanger} gameChanger
   *   The current GameChanger instance.
   * @param {EntityFinder} entityFinder
   *   The current EntityFinder instance.
   * @param {UserOperations} userOperations
   *   The current UserOperations instance.
   * @param {TriggerActions} triggerActions
   *   The current TriggerActions instance.
   * @param {PostTriggerActions} postTriggerActions
   *   The current PostTriggerActions instance.
   */
  constructor(
    socket,
    user,
    gameChanger,
    entityFinder,
    userOperations,
    postTriggerActions,
  ) {
    this.socket = socket;
    this.user = user;
    this.gameChanger = gameChanger;
    this.entityFinder = entityFinder;
    this.userOperations = userOperations;
    this.postTriggerActions = postTriggerActions;
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
   * @param {string} sceneId
   *   The scene ID where this is taking place.
   * @param {x,y} pos
   *   The X and Y position where the event takes place.
   *
   * @return {Promise<void>}
   *   The promise for what's taking place.
   */
  async emit(tokenId, tileId, sceneId, pos) {
    global.console.debug(`hey-wait | Emitting to ${this.socketName}`);

    this.socket.emit(
      this.socketName,
      {
        tokenId, tileId, sceneId, pos,
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
      global.console.debug(`hey-wait | Emission received on ${this.socketName}`);

      try {
        if (!this.userOperations.canChangeGameForUser(data.sceneId)) {
          return;
        }

        // Change the game by potentially modifying the tile and pausing the
        // game.
        await this.gameChanger.execute(
          data.tileId,
          { x: data.pos.x, y: data.pos.y },
          data.sceneId,
        );

        const tokenDoc = this.entityFinder.findTokenDocument(
          data.tokenId,
          data.sceneId,
        );

        if (!tokenDoc) {
          global.console.error(`Could not find token document with ID ${data.tokenId}`);
        }

        const tile = this.entityFinder.findTile(data.tileId);
        if (!tile) {
          global.console.error(`Could not find Hey, Wait! tile with ID ${data.tileId}`);
        }

        await this.postTriggerActions.execute(tokenDoc, tile);
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
