/**
 * A class storing our module's constants.
 */
export default class Constants {
  /**
   * The name and identifier of the module.
   *
   * @return {string}
   */
  static get MODULE_NAME() {
    return 'hey-wait';
  }

  /**
   * The identifier of the tool in the controls toolbar.
   *
   * @return {string}
   */
  static get TOOLNAME() {
    return 'heyWaitTile';
  }

  /**
   * The possible token disposition choices for triggering Hey, Wait! tiles.
   *
   * @return {object}
   */
  static get DISPOSITION_CHOICES() {
    return {
      FRIENDLY: 1,
      FRIENDLY_NETURAL: 2,
      FRIENDLY_NEUTRAL_HOSTILE: 3,
    };
  }

  /**
   * The filepath to the HUD template.
   *
   * @return {string}
   */
  static get TEMPLATE_HUD_PATH() {
    return '/modules/hey-wait/src/templates/hud.hbs';
  }

  /**
   * The filepath for the "Hey, Wait! Stop" tile image.
   *
   * @return {string}
   */
  static get TILE_STOP_PATH() {
    return 'modules/hey-wait/src/img/hey_wait_stop.jpg';
  }

  /**
   * The width of the "Hey, Wait! Stop" tile.
   *
   * @return {number}
   */
  static get TILE_STOP_WIDTH() {
    return 200;
  }

  /**
   * The height of the "Hey, Wait! Stop" tile.
   *
   * @return {number}
   */
  static get TILE_STOP_HEIGHT() {
    return 167;
  }

  /**
   * The filepath for the "Hey, Wait! Go" tile image.
   *
   * @return {string}
   */
  static get TILE_GO_PATH() {
    return 'modules/hey-wait/src/img/hey_wait_go.jpg';
  }

  /**
   * The width of the "Hey, Wait! Go" tile.
   *
   * @return {number}
   */
  static get TILE_GO_WIDTH() {
    return 222;
  }

  /**
   * The height of the "Hey, Wait! Go" tile.
   *
   * @return {number}
   */
  static get TILE_GO_HEIGHT() {
    return 160;
  }

  /**
   * The filepath for the fallback tile image.
   *
   * @return {string}
   */
  static get TILE_FALLBACK_PATH() {
    return 'icons/svg/hazard.svg';
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
