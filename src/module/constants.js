/**
 * A class storing our module's constants.
 */
export default class Constants {
  /**
   * The identifier of the tool in the controls toolbar.
   *
   * @return {string}
   */
  static get TOOLNAME() {
    return 'heyWaitTile';
  }

  /**
   * The filepath for the green tile image.
   *
   * @return {string}
   */
  static get TILE_GREEN_PATH() {
    return 'modules/hey-wait/src/img/hey_wait_green.png';
  }

  /**
   * How long our Canvas panning should last.
   *
   * @return {number}
   */
  static get CANVAS_PAN_DURATION() {
    return 1000;
  }
}
