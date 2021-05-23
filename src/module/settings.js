/* global game */

import Constants from './constants';

export default () => {
  const dispositionChoices = {};
  dispositionChoices[Constants.DISPOSITION_CHOICES.FRIENDLY] = game.i18n.localize(
    'HEYWAIT.SETTINGS.dispositionChoiceFriendly',
  );
  dispositionChoices[Constants.DISPOSITION_CHOICES.FRIENDLY_NETURAL] = game.i18n.localize(
    'HEYWAIT.SETTINGS.dispositionChoiceFriendlyNeutral',
  );
  dispositionChoices[Constants.DISPOSITION_CHOICES.FRIENDLY_NEUTRAL_HOSTILE] = game.i18n.localize(
    'HEYWAIT.SETTINGS.dispositionChoiceFriendlyNeutralHostile',
  );

  game.settings.register(Constants.MODULE_NAME, 'disposition', {
    name: game.i18n.localize('HEYWAIT.SETTINGS.dispositionName'),
    hint: game.i18n.localize('HEYWAIT.SETTINGS.dispositionHint'),
    scope: 'world',
    config: true,
    default: Constants.DISPOSITION_CHOICES.FRIENDLY,
    type: Number,
    choices: dispositionChoices,
  });

  game.settings.register(Constants.MODULE_NAME, 'restrict-gm', {
    name: game.i18n.localize('HEYWAIT.SETTINGS.restrictGmName'),
    hint: game.i18n.localize('HEYWAIT.SETTINGS.restrictGmHint'),
    scope: 'world',
    config: true,
    default: false,
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
