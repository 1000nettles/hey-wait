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

    controls.push({
      name: 'heyWait',
      title: 'Hey, Wait!',
      icon: 'fas fa-hand-paper',
      layer: 'HeyWaitLayer',
      tools: [
        {
          name: 'rect',
          title: 'CONTROLS.MeasureRect',
          icon: 'far fa-square',
        },
      ],
    });
  }
}
