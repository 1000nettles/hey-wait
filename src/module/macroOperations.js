export default class MacroOperations {
  /**
   * MacroOperations constructor.
   *
   * @param {User} user
   *   The injected User dependency. The current user.
   * @param {BackgroundLayer} backgroundLayer
   *   The injected BackgroundLayer dependency.
   * @param {Map} macros
   *   The injected game macros map dependency.
   * @param {Notifications} notifications
   *   The injected Notifications dependency.
   */
  constructor(user, backgroundLayer, macros, notifications) {
    this.user = user;
    this.backgroundLayer = backgroundLayer;
    this.macros = macros;
    this.notifications = notifications;
  }

  /**
   * Handle the tile triggering macro execution, if one is set.
   *
   * Can only be executed as the GM.
   *
   * @param {string} tileId
   *   The relevant tile ID.
   */
  handleTileMacroFiring(tileId) {
    if (!this.user.isGM) {
      return;
    }

    let tile;

    for (const bgTile of this.backgroundLayer.tiles) {
      if (bgTile.id === tileId) {
        tile = bgTile;
        break;
      }
    }

    if (!tile) {
      return;
    }

    const macroId = tile.data?.flags?.['hey-wait']?.macro;
    if (!macroId || macroId === '0') {
      return;
    }

    const macro = this.macros.get(macroId);
    if (!macro) {
      this.notifications.error(
        'The macro triggered by the Hey, Wait! tile no longer exists.',
      );
      return;
    }

    macro.execute();
  }
}
