import Constants from '../Constants';

/**
 * A class for dealing with logic relating to Token hooks called by Foundry.
 */
export default class TokenHooks {
  constructor(user, settings) {
    this.user = user;
    this.settings = settings;
  }

  /**
   * Determine of we can run logic for the "update Token" hook.
   *
   * @param {object} change
   *   The `change` object provided by the hook.
   * @param {number} disposition
   *   The disposition of the token. See `CONST.TOKEN_DISPOSITION`.
   * @param {boolean} isPaused
   *   If the game is current pause or not.
   *
   * @returns {boolean}
   */
  canRunTokenUpdate(change, disposition, isPaused) {
    if (isPaused) {
      return false;
    }

    // Exit early if there's no relevant updates. Specifically, if the token
    // has not moved.
    if (!this._hasDataChanged(change)) {
      return false;
    }

    if (!this._isUserAllowed()) {
      return false;
    }

    if (!this._isDispositionAllowed(disposition)) {
      return false;
    }

    return true;
  }

  /**
   * Determine if the token data has changed.
   *
   * @param {object} change
   *   The `change` object supplied by the hook.
   * @returns {boolean}
   *   If the data has changed.
   *
   * @private
   */
  _hasDataChanged(change) {
    return Boolean(
      change?.x !== undefined || change?.y !== undefined,
    );
  }

  /**
   * Determine if the current user is allowed to perform the token update.
   *
   * @returns {boolean}
   *   If the user is allowed to trigger the update.
   *
   * @private
   */
  _isUserAllowed() {
    if (!this.user.isGM) {
      return true;
    }

    const restrictGm = this.settings.get(
      Constants.MODULE_NAME,
      'restrict-gm',
    );

    // If we are restricting a GM from triggering Hey, Wait! tiles, let's exit
    // early so they don't move through the triggering flow.
    if (restrictGm) {
      return false;
    }

    return true;
  }

  /**
   * Determine if the token's disposition allows it for Hey, Wait! updates.
   *
   * @param {number} disposition
   *   The token's disposition. See `CONST.TOKEN_DISPOSITIONS`.
   * @returns {boolean}
   *   If the token's disposition is allowed.
   *
   * @private
   */
  _isDispositionAllowed(disposition) {
    // If we have a friendly disposition, it will always be allowed.
    if (disposition === global.CONST.TOKEN_DISPOSITIONS.FRIENDLY) {
      return true;
    }

    const choices = Constants.DISPOSITION_CHOICES;
    const dispositionsAllowed = this.settings.get(
      Constants.MODULE_NAME,
      'disposition',
    );

    // If we have a neutral disposition, it's only allowed if we're allowing
    // neutral and hostile.
    if (
      disposition === global.CONST.TOKEN_DISPOSITIONS.NEUTRAL
      && [choices.FRIENDLY_NETURAL, choices.FRIENDLY_NEUTRAL_HOSTILE].includes(dispositionsAllowed)
    ) {
      return true;
    }

    // If we have a hostile disposition, it's only allowed if we allow all
    // dispositions.
    if (
      disposition === global.CONST.TOKEN_DISPOSITIONS.HOSTILE
      && dispositionsAllowed === choices.FRIENDLY_NEUTRAL_HOSTILE
    ) {
      return true;
    }

    return false;
  }
}
