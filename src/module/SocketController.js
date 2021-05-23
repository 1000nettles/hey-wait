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
   * @param {ReactionCoordinator} reactionCoordinator
   *   The current ReactionCoordinator instance.
   * @param {EntityFinder} entityFinder
   *   The current EntityFinder instance.
   * @param {UserOperations} userOperations
   *   The current UserOperations instance.
   * @param {MacroOperations} macroOperations
   *   The current MacroOperations instance.
   */
  constructor(
    socket,
    user,
    gameChanger,
    reactionCoordinator,
    entityFinder,
    userOperations,
    macroOperations,
  ) {
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
     * The current ReactionCoordinator instance.
     */
    this.reactionCoordinator = reactionCoordinator;

    /**
     * The injected EntityFinder dependency.
     */
    this.entityFinder = entityFinder;

    /**
     * The injected UserOperations dependency.
     *
     * @type {UserOperations}
     */
    this.userOperations = userOperations;

    /**
     * The injected MacroOperations dependency.
     *
     * @type {MacroOperations}
     */
    this.macroOperations = macroOperations;

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
   * @param {string} sceneId
   *   The scene ID where this is taking place.
   * @param {x,y} pos
   *   The X and Y position where the event takes place.
   * @param {number} animType
   *   The animation type to execute on the Token.
   *
   * @return {Promise<void>}
   *   The promise for what's taking place.
   */
  async emit(tokenId, tileId, sceneId, pos, animType) {
    console.debug(`hey-wait | Emitting to ${this.socketName}`);

    this.socket.emit(
      this.socketName,
      {
        tokenId, tileId, sceneId, pos, animType,
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
        if (!this.userOperations.canChangeGameForUser(data.sceneId)) {
          return;
        }

        const scene = this.entityFinder.findScene(data.sceneId);

        // 1. Change the game by potentially modifying the tile and pausing the
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

        const token = tokenDoc.object;
        console.log(token);

        // 2. Pan to the location where the event and reaction occurred.
        await this.gameChanger.pan(
          { x: token.x, y: token.y },
        );

        // 3. Handle any macro triggering.
        this.macroOperations.handleTileMacroFiring(data.tileId, tokenDoc);

        // 4. Animate the reaction and add SFX to it.
        await this.reactionCoordinator.handleTokenReaction(
          scene,
          token,
          data.animType,
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
