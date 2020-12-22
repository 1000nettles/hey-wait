/* global game */

export default () => {
  game.settings.register('hey-wait', 'restrict-gm', {
    name: game.i18n.localize('HEYWAIT.SETTINGS.restrictGmName'),
    hint: game.i18n.localize('HEYWAIT.SETTINGS.restrictGmHint'),
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
};
