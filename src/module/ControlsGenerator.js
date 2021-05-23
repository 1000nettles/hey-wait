/**
 * Facilitate the generation of the Controls for the toolbar.
 */
import Constants from './Constants';

/**
 * Generate the control buttons / icons in the toolbar.
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

    // Insert the Hey, Wait! tile after the browse control button.
    let browseControlIndex;
    tileControl.tools.forEach((tool, index) => {
      if (tool.name === 'browse') {
        browseControlIndex = index + 1;
      }
    });

    if (!browseControlIndex) {
      // eslint-disable-next-line no-console
      console.error(
        'Could not find the "Browse Tile" control. Not adding Hey, Wait! control',
      );
      return;
    }

    tileControl.tools.splice(browseControlIndex, 0, {
      name: Constants.TOOLNAME,
      title: 'HEYWAIT.CONTROLS.TOOLS.heyWaitTile',
      icon: 'fas fa-hand-paper',
    });
  }
}
