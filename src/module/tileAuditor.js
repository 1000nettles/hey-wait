/**
 * A class for auditing Tile entities pertaining to Hey, Wait!
 */
export default class TileAuditor {
  /**
   * Determine if the provided Tile is a Hey, Wait! tile.
   *
   * Includes checks if the tile has not yet been initialized but is destined
   * to be a Hey, Wait! tile.
   *
   * @param {Tile} tile
   *   The relevant Tile to check.
   * @param {string} activeTool
   *   The game's active tool being used.
   *
   * @return {boolean}
   *   If this is a Hey, Wait! tile or not.
   */
  isHeyWaitTile(tile, activeTool) {
    if (tile.data?._id) {
      // Existing tile.
      if (!tile.data?.flags?.['hey-wait']?.enabled) {
        return false;
      }
    } else if (activeTool !== 'heyWaitTile') {
      // This is in a situation where we're placing a new tile and it's a
      // Hey, Wait! tile, but we don't have flags or an ID setup yet.
      return false;
    }

    return true;
  }
}
