/**
 * A class to determine collision between relevant Entitys.
 */
export default class Collision {
  /**
   * Collision constructor.
   *
   * @param {number} gridSize
   *   The grid size of the canvas for our calculations.
   */
  constructor(gridSize) {
    this.gridSize = gridSize;
  }

  /**
   * Check if a Tile and a Token collide.
   *
   * @param {Tile} tile
   *   The Tile to check.
   * @param {Token} token
   *   The Token to check.
   *
   * @return {boolean}
   *   If the Tile and Token collide.
   */
  checkTileTokenCollision(tile, token) {
    const tileMaxX = tile.data.width + tile.data.x;
    const tileMaxY = tile.data.height + tile.data.y;

    const tokenX = token.x + (token.width * this.gridSize) / 2;
    const tokenY = token.y + (token.height * this.gridSize) / 2;

    return (tokenX >= tile.data.x && tokenY >= tile.data.y)
      && (tokenX <= tileMaxX && tokenY <= tileMaxY);
  }
}
