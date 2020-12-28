/**
 * A class to find entities in the Game based on sparse information.
 */
export default class EntityFinder {
  constructor(game) {
    this.game = game;
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
   * Find the Token by Token ID.
   *
   * @param {string} tokenId
   *   The ID of the Token.
   * @param {string} sceneId
   *   The ID of the Scene.
   *
   * @return {Token}
   */
  findToken(tokenId, sceneId) {
    const scene = this.findScene(sceneId);
    const { tokens } = scene.data;

    const targetToken = tokens.find((token) => token._id === tokenId);

    if (!targetToken) {
      throw new Error(`Could not find Token with ID ${tokenId} in Scene ${scene.data._id}`);
    }

    return targetToken;
  }
}
