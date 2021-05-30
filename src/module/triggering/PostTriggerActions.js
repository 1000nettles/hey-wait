import Animator from '../Animator';

/**
 * A class to handle execution of any post-trigger actions needed.
 */
export default class PostTriggerActions {
  /**
   * PostTriggerActions constructor.
   *
   * @param {GameChanger} gameChanger
   * @param {MacroOperations} macroOperations
   * @param {ReactionCoordinator} reactionCoordinator
   */
  constructor(gameChanger, macroOperations, reactionCoordinator) {
    this.gameChanger = gameChanger;
    this.macroOperations = macroOperations;
    this.reactionCoordinator = reactionCoordinator;
  }

  /**
   * Run any post-triggering functionality for Hey, Wait! tiles.
   *
   * @param {TokenDocument} tokenDoc
   *   The TokenDocument which triggered the Hey, Wait! tile.
   * @param {Tile} tile
   *   The Tile which was triggered.
   */
  async execute(tokenDoc, tile) {
    // 1. Fire the associated macro with the Hey, Wait! tile if one's defined.
    this.macroOperations.handleTileMacroFiring(tile.id, tokenDoc);
    const token = tokenDoc.object;

    // 2. Pan to the trigger location.
    const coords = { x: token.x, y: token.y };
    await this.gameChanger.pan(coords);

    // 3. Handle the relevant reaction if one's defined.
    const animType = tile.data?.flags?.['hey-wait']?.animType
      ?? Animator.animationTypes.TYPE_NONE;
    this
      .reactionCoordinator
      .handleTokenReaction(tokenDoc.parent, token, animType);
  }
}
