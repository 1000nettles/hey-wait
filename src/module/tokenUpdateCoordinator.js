/* eslint-disable no-console */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* global CanvasAnimation */
/* global performance */

import Animator from './animator';

/**
 * Coordinate any Token updates from the Foundry Hook system.
 */
export default class TokenUpdateCoordinator {
  /**
   * TokenUpdateCoordinator constructor.
   *
   * @param {Triggering} triggering
   *   The injected Triggering dependency.
   * @param {TokenCalculator} tokenCalculator
   *   The injected TokenCalculator dependency.
   * @param {Animator} animator
   *   The injected Animator dependency.
   */
  constructor(triggering, tokenCalculator, animator) {
    this.triggering = triggering;
    this.tokenCalculator = tokenCalculator;
    this.animator = animator;

    /**
     * Keep track of the Token's initial position between updates.
     *
     * @type {Map<any, any>}
     */
    this.tokenInitPos = new Map();
  }

  /**
   * Register the Token's initial position to be used later.
   *
   * We need to cache this in memory as the next update does not contain the
   * relevant starting info.
   *
   * @param {Token} token
   *   The Token to be registered.
   */
  registerTokenInitPos(token) {
    if (!token) {
      return;
    }

    this.tokenInitPos.set(
      token._id,
      {
        x: token.x,
        y: token.y,
      },
    );
  }

  /**
   * Coordinate a Token update.
   *
   * Checks all applicable tiles for if they have been triggered or not. If
   * they have, execute the functionality for triggering a tile.
   *
   * @param {Token} token
   *   The Token getting updated.
   * @param {Array} tiles
   *   All of the potential tiles to check for triggers.
   * @param {Scene} scene
   *   The currently viewed Scene.
   */
  async coordinateUpdate(token, tiles, scene) {
    const t0 = performance.now();

    // Let's find the previously stored Token initial position.
    const initPos = this.tokenInitPos.get(token._id);

    if (!initPos) {
      // We may not have created an update queued previously, due to a
      // lightweight update or something else. Just cleanup and exit.
      this._cleanQueuedTokenInitPos(token._id);
      return;
    }

    const wasTriggered = await this.triggering.handleTileTriggering(
      tiles,
      token,
      initPos,
      scene.data._id,
    );

    const t1 = performance.now();
    console.debug(`hey-wait | \`coordinateUpdate\` took ${t1 - t0}ms.`);

    if (wasTriggered) {
      await this._handleAnimation(scene, token);
    }

    this._cleanQueuedTokenInitPos(token._id);
  }

  /**
   * Clean up any queued Tokens initial positions pertaining to the provided
   * Token ID.
   *
   * @param {string} tokenId
   *   The associated Token ID with the queued initial position.
   *
   * @private
   */
  _cleanQueuedTokenInitPos(tokenId) {
    this.tokenInitPos.delete(tokenId);
  }

  /**
   * Handle the reaction animation on the specified Token.
   *
   * @param {Scene} scene
   *   The current Scene.
   * @param {Token} token
   *   The associated Token to animate the reaction on.
   *
   * @return {Promise<void>}
   *
   * @private
   */
  async _handleAnimation(scene, token) {
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
          Animator.animationTypes.TYPE_QUESTION,
          coords.x,
          coords.y,
          scene.data.grid,
        );

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
