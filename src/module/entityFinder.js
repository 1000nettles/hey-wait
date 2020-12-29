/**
 * A class to find entities and their data in the Game based on sparse
 * information.
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

    const tokenData = tokens.find((token) => token._id === tokenId);

    if (!tokenData) {
      throw new Error(`Could not find Token with ID ${tokenId} in Scene ${scene.data._id}`);
    }

    return tokenData;
  }

  /**
   * Find the Tile data by Tile ID.
   *
   * @param {string} tileId
   *   The ID of the Tile.
   * @param {string} sceneId
   *   The ID of the Scene.
   *
   * @return {Object}
   */
  findTileData(tileId, sceneId) {
    const scene = this.findScene(sceneId);
    const { tiles } = scene.data;

    const tileData = tiles.find((tile) => tile._id === tileId);

    if (!tileData) {
      throw new Error(`Could not find Tile data with ID ${tileId} in Scene ${scene.data._id}`);
    }

    return tileData;
  }
}
