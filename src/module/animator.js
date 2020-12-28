import { ease } from 'pixi-ease';

/* global PIXI */

/**
 * A class to animate the Hey, Wait! reactions. This currently includes showing
 * a "?" or "!" on top of the specified X and Y coordinates.
 */
export default class Animator {
  constructor(layer) {
    /**
     * The associated Layer instance.
     */
    this.layer = layer;
  }

  /**
   * Enum for the animation types.
   *
   * @return {Object}
   */
  static get animationTypes() {
    return {
      TYPE_EXCLAMATION: 1,
      TYPE_QUESTION: 2,
      TYPE_INFO: 3,
    };
  }

  /**
   * Animate the selected Hey, Wait! reaction type to the user.
   *
   * @param {Animator.animationTypes} type
   *   The specified type to animate.
   * @param {number} x
   *   The X coordinate where we should render the sprite.
   * @param {number} y
   *   The Y coordinate where we should render the sprite.
   * @param {number} gridSize
   *   The size of a grid space.
   */
  animate(type, x, y, gridSize) {
    const sprite = this._getSprite(type, gridSize);
    sprite.alpha = 0;

    // Ensure we're anchoring to the center of the token.
    sprite.anchor.set(0.5);
    sprite.position.x = x;
    sprite.position.y = y;
    sprite.name = Math.random().toString(36).substring(16);

    const child = this.layer.addChild(sprite);

    const anim1 = ease.add(
      child,
      { alpha: 100, x, y: y - (gridSize * 0.25) },
      { duration: 150 },
    );

    anim1.once('complete', () => {
      const anim2 = ease.add(
        child,
        { x, y: y - (gridSize * 1.25) },
        { duration: 100 },
      );

      anim2.once('complete', () => {
        const anim3 = ease.add(
          child,
          { x, y: y - (gridSize * 0.85) },
          { duration: 100 },
        );

        anim3.once('complete', () => {
          const anim4 = ease.add(
            child,
            { x, y: y - (gridSize * 0.95) },
            { duration: 45 },
          );

          anim4.once('complete', () => {
            const anim5 = ease.add(
              child,
              { x, y: y - (gridSize * 0.85) },
              { duration: 45 },
            );

            anim5.once('complete', () => {
              const anim6 = ease.add(
                child,
                { alpha: 0 },
                { duration: 2500 },
              );

              anim6.once('complete', () => {
                this.layer.removeChild(child);
              });
            });
          });
        });
      });
    });
  }

  /**
   * Get the Pixi Sprite to be rendered.
   *
   * @param {Animator.animationTypes} type
   *   The type of animation we should be creating.
   * @param {number} gridSize
   *   The size of the Canvas grid.
   *
   * @return {PIXI.Text}
   *   The sprite.
   *
   * @private
   */
  _getSprite(type, gridSize) {
    const fontSize = Math.round(gridSize * 0.6);

    return new PIXI.Text(
      this._getTextFromType(type),
      new PIXI.TextStyle({
        fontSize,
        dropShadow: true,
        dropShadowDistance: 4,
        fill: '#feffff',
        fontFamily: 'Signika',
        fontWeight: 'bolder',
        strokeThickness: 4,
      }),
    );
  }

  /**
   * Get the text to render from the provided Animator type.
   *
   * @param {Animator.T}type
   * @return {string}
   * @private
   */
  _getTextFromType(type) {
    switch (type) {
      case Animator.animationTypes.TYPE_QUESTION:
        return '?';
      case Animator.animationTypes.TYPE_EXCLAMATION:
        return '!';
      case Animator.animationTypes.TYPE_INFO:
        return 'ⓘ';
      default:
        throw new Error(`Cannot find text for Animator type ${type}`);
    }
  }
}
