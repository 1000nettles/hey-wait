/* global game */

import Constants from './constants';

export default () => {
  game.settings.register(Constants.MODULE_NAME, 'restrict-gm', {
    name: game.i18n.localize('HEYWAIT.SETTINGS.restrictGmName'),
    hint: game.i18n.localize('HEYWAIT.SETTINGS.restrictGmHint'),
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
  game.settings.register(Constants.MODULE_NAME, 'warp-players', {
    name: game.i18n.localize('HEYWAIT.SETTINGS.warpPlayersName'),
    hint: game.i18n.localize('HEYWAIT.SETTINGS.warpPlayersHint'),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
  game.settings.register(Constants.MODULE_NAME, 'disable-sfx', {
    name: game.i18n.localize('HEYWAIT.SETTINGS.disableSfxName'),
    hint: game.i18n.localize('HEYWAIT.SETTINGS.disableSfxHint'),
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
};
