/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* global AudioHelper */
/* global CanvasAnimation */

import Animator from './animator';

/**
 * Coordinate processing and running any animations within the module.
 */
export default class AnimationCoordinator {
  /**
   * AnimationCoordinator constructor.
   *
   * @param {TokenCalculator} tokenCalculator
   *   The injected TokenCalculator dependency.
   * @param {Animator} animator
   *   The injected Animator dependency.
   */
  constructor(tokenCalculator, animator) {
    this.tokenCalculator = tokenCalculator;
    this.animator = animator;
  }

  /**
   * Handle the reaction animation on the specified Token.
   *
   * This is for when a Token animation has just ben updated, and we are
   * potentially waiting on that Token's drag animation to finish.
   *
   * @param {Scene} scene
   *   The current Scene.
   * @param {Token} token
   *   The associated Token to animate the reaction on.
   * @param {Animator.animationTypes} animType
   *   The associated Token to animate the reaction on.
   *
   * @return {Promise<void>}
   *
   * @private
   */
  async handleTokenAnimationAfterUpdate(scene, token, animType) {
    const coords = this.tokenCalculator.calculateCoordinates(
      scene,
      token,
    );

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
      if (!CanvasAnimation.animations?.[this._getAnimationKeyFromToken(token)]) {
        await this.animator.animate(
          animType,
          coords.x,
          coords.y,
          scene.data.grid,
        );

        if (animType !== Animator.animationTypes.TYPE_NONE) {
          const path = `modules/hey-wait/sounds/reaction${animType}.mp3`;
          AudioHelper.play({
            src: path,
            autoplay: true,
          }, false);
        }

        break;
      }
    }
  }

  /**
   * Get the expected animation array key from the Token object.
   *
   * This is used to find the animation pertaining to the Token.
   *
   * @param {Token} token
   *   The specified Token to find the animation for.
   *
   * @return {string}
   *
   * @private
   */
  _getAnimationKeyFromToken(token) {
    return `Token.${token._id}.animateMovement`;
  }
}
