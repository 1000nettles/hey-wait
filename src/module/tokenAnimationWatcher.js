/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* global CanvasAnimation */

/**
 * A class to watch the animation cycles of a Token in Foundry.
 *
 * An "animation" is when a Token is being dragged across the Canvas.
 */
export default class TokenAnimationWatcher {
  /**
   * Watch the specific Token for its animation to be complete.
   *
   * @param {string} tokenId
   *   The Token ID to watch for.
   *
   * @return {Promise}
   */
  async watchForCompletion(tokenId) {
    // Create a "timeout" function which allows us to sleep for specific
    // amounts of time.
    // See https://stackoverflow.com/a/33292942/823549.
    const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Check for the deletion of the animation key in the current animations
    // to be sure that the animation has been successfully completed.
    // This is hacky but unfortunately I'm unsure of another way to listen
    // for animations being completed.
    // This should allow for a buffer of 20 seconds to allow the animation to
    // finish which theoretically should be more than enough time.
    for (let i = 1; i <= 200; i += 1) {
      await timeout(100);
      if (!CanvasAnimation.animations?.[this._getAnimationKeyFromTokenId(tokenId)]) {
        return Promise.resolve();
      }
    }

    return Promise.resolve();
  }

  /**
   * Get the expected animation array key from the Token object.
   *
   * This is used to find the animation pertaining to the Token.
   *
   * @param {string} tokenId
   *   The specified Token ID to find the animation for.
   *
   * @return {string}
   *
   * @private
   */
  _getAnimationKeyFromTokenId(tokenId) {
    return `Token.${tokenId}.animateMovement`;
  }
}
