import Constants from './Constants';

/**
 * A class for determining if specific user operations are allowed.
 */
export default class UserOperations {
  constructor(user, settings) {
    this.user = user;
    this.settings = settings;
  }

  /**
   * Determine if we can change the scene and warp, pan, etc. for the current
   * user.
   *
   * @param {string} sceneId
   *   The target scene ID.
   *
   * @return {boolean}
   *   If we should change the scene or not.
   */
  canChangeGameForUser(sceneId) {
    if (
      this.user.isGM
      || this.user.viewedScene === sceneId
    ) {
      return true;
    }

    const warpPlayers = this.settings.get(
      Constants.MODULE_NAME,
      'warp-players',
    );

    return !!warpPlayers;
  }
}
