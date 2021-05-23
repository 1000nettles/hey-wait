import Constants from './Constants';

/**
 * A class to "change" the game when a Hey, Wait! event has been triggered.
 */
export default class GameChanger {
  constructor(game, canvas) {
    this.game = game;
    this.canvas = canvas;
  }

  /**
   * Execute any changes to the game after a Hey, Wait! event has been triggered.
   *
   * @param {string} tileId
   *   The relevant Tile ID that has been triggered.
   * @param {x,y} location
   *   The location where the triggering occurred.
   *
   * @param {string} sceneId
   *   The scene ID where the triggering occurred.
   *
   * @return {Promise<void>}
   */
  async execute(tileId, location, sceneId) {
    await this._changeScene(sceneId);

    if (this.game.user.isGM) {
      this._pause();
      this._handleTileChange(tileId);
    }
  }

  /**
     * Animate the canvas moving over to the desired location.
     *
     * @param {x,y} location
     *   A location designated by X and Y coords.
     *
     * @return {Promise}
     */
  async pan(location) {
    const { x, y } = location;

    return this.canvas.animatePan({
      x,
      y,
      scale: Math.max(1, this.canvas.stage.scale.x),
      duration: Constants.CANVAS_PAN_DURATION,
    });
  }

  /**
   * Handle the tile triggering adjustments such as updating flags and image.
   *
   * Can only be executed as the GM.
   *
   * @param {string} tileId
   *   The relevant tile ID.
   */
  _handleTileChange(tileId) {
    const tile = this.canvas.background.get(tileId);

    if (!tile) {
      throw new Error(`Could not find a tile with ID ${tileId}`);
    }

    const { document } = tile;

    const update = {
      flags: {
        'hey-wait': {
          triggered: true,
        },
      },
      img: Constants.TILE_GO_PATH,
    };

    document.update(
      update,
    );
  }

  /**
   * Change the current scene for the user.
   *
   * @param {string} sceneId
   *   The scene ID to change to.
   *
   * @return {Promise<void>}
   *
   * @private
   */
  async _changeScene(sceneId) {
    const scene = this.game.scenes.get(sceneId);

    if (!scene) {
      throw new Error(`Could not find a scene with ID ${sceneId}`);
    }

    await scene.view();
  }

  /**
   * Pause the game.
   *
   * @private
   */
  _pause() {
    this.game.togglePause(true, true);
  }
}
