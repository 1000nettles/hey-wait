/**
 * A class to find entities and their data in the Game based on sparse
 * information.
 */
export default class EntityFinder {
  /**
   * EntityFinder constructor.
   *
   * @param {Game} game
   *   The injected Game dependency.
   * @param {Canvas} canvas
   *   The injected Canvas dependency.
   */
  constructor(game, canvas) {
    this.game = game;
    this.canvas = canvas;
  }

  /**
   * Find the Scene by Scene ID.
   *
   * @param {string} sceneId
   *   The ID of the Scene to find.
   *
   * @return {Scene}
   */
  findScene(sceneId) {
    const scene = this.game.scenes.get(sceneId);

    if (!scene) {
      throw new Error(`Could not find a scene with ID ${sceneId}`);
    }

    return scene;
  }

  /**
   * Find the Token data by Token ID.
   *
   * @param {string} tokenId
   *   The ID of the Token.
   * @param {string} sceneId
   *   The ID of the Scene.
   *
   * @return {Object}
   */
  findTokenData(tokenId, sceneId) {
    const scene = this.findScene(sceneId);
    const { tokens } = scene.data;

    const tokenDocument = tokens.find((token) => token._id === tokenId);

    if (!tokenDocument) {
      throw new Error(
        `Could not find Token document with ID ${tokenId} in Scene ${scene.data._id}`,
      );
    }

    return tokenDocument.data;
  }
}
