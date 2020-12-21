/**
 * Facilitate the generation of the Controls for the toolbar.
 */
export default class ControlsGenerator {
  /**
   * Generate the toolbar controls.
   *
   * @param {Object} controls
   *   The game's controls object.
   * @param {Boolean} isGm
   *   If the current user is a GM.
   */
  generate(controls, isGm) {
    if (!isGm) {
      return;
    }

    const tileControl = controls.find((control) => control?.name === 'tiles');

    if (!tileControl) {
      return;
    }

    tileControl.tools.push({
      name: 'heyWaitTile',
      title: 'Place "Hey, Wait!" Tile',
      icon: 'fas fa-hand-paper',
    });
  }
}
