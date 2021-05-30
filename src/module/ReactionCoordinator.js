/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* global AudioHelper */

import Animator from './Animator';
import Constants from './Constants';

/**
 * Coordinate processing and running any reactions within the module.
 */
export default class ReactionCoordinator {
  /**
   * ReactionCoordinator constructor.
   *
   * @param {TokenCalculator} tokenCalculator
   *   The injected TokenCalculator dependency.
   * @param {Animator} animator
   *   The injected Animator dependency.
   * @param {ClientSettings} settings
   *   The injected ClientSettings dependency. Contains all current game
   *   settings.
   */
  constructor(tokenCalculator, animator, settings) {
    this.tokenCalculator = tokenCalculator;
    this.animator = animator;
    this.settings = settings;
  }

  /**
   * Handle the reaction (animation and SFX) on the specified Token.
   *
   * @param {Scene} scene
   *   The current Scene.
   * @param {Token} token
   *   The associated Token to animate the reaction on.
   * @param {Animator.animationTypes} animType
   *   The associated Token to animate the reaction on.
   *
   * @return {Promise}
   */
  handleTokenReaction(scene, token, animType) {
    const coords = this.tokenCalculator.calculateCoordinates(
      scene,
      token.data,
    );

    this.animator.animate(
      animType,
      coords.x,
      coords.y,
      scene.data.grid,
    );

    this._handleSfx(animType);
  }

  /**
   * Handle the playing of any sound effects, if applicable to the animation.
   *
   * @param {Animator.animationTypes} animType
   *   One of the animation types, which corresponds to the SFX ID number.
   *
   * @private
   */
  _handleSfx(animType) {
    if (
      animType === Animator.animationTypes.TYPE_NONE
      || this._sfxDisabled()
    ) {
      return;
    }

    const path = `modules/hey-wait/sounds/reaction${animType}.mp3`;
    AudioHelper.play({
      src: path,
      autoplay: true,
      volume: 0.5,
    }, false);
  }

  /**
   * Get if the sound effects for animations are disabled.
   *
   * @return {boolean}
   *   If the sound effects for animations are disabled.
   *
   * @private
   */
  _sfxDisabled() {
    return Boolean(this.settings.get(
      Constants.MODULE_NAME,
      'disable-sfx',
    ));
  }
}
