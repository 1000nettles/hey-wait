/**
 * The main entry point for "Hey, Wait!".
 *
 * Author: 1000Nettles
 * Content License: MIT
 * Software License: MIT
 */

import { ease } from 'pixi-ease';
import registerSettings from './module/settings';
import ControlsGenerator from './module/ControlsGenerator';
import Collision from './module/Collision';
import Triggering from './module/Triggering';
import TileAuditor from './module/TileAuditor';
import Constants from './module/Constants';
import SocketController from './module/SocketController';
import TokenUpdateCoordinator from './module/TokenUpdateCoordinator';
import GameChanger from './module/GameChanger';
import Animator from './module/Animator';
import TokenCalculator from './module/TokenCalculator';
import ReactionCoordinator from './module/ReactionCoordinator';
import EntityFinder from './module/EntityFinder';
import TokenAnimationWatcher from './module/TokenAnimationWatcher';
import UserOperations from './module/UserOperations';
import MacroOperations from './module/MacroOperations';
import TokenHooks from './module/hooks/TokenHooks';

/* eslint no-console: ['error', { allow: ['warn', 'log', 'debug'] }] */
/* eslint-disable no-param-reassign */

/**
 * Our Collision instance.
 */
let collision;

/**
 * Our Triggering instance.
 */
let triggering;

/**
 * Our TileAuditor instance.
 */
let tileAuditor;

/**
 * Our SocketController instance.
 */
let socketController;

/**
 * Our UserOperations instance.
 */
let userOperations;

/**
 * Our MacroOperations instance.
 */
let macroOperations;

/**
 * Our GameChanger instance.
 */
let gameChanger;

/**
 * Our TokenUpdateCoordinator instance.
 */
let tokenUpdateCoordinator;

/**
 * Our TokenCalculator instance.
 */
let tokenCalculator;

/**
 * Our ReactionCoordinator instance.
 */
let reactionCoordinator;

/**
 * Our EntityFinder instance.
 */
let entityFinder;

/**
 * Our Animator instance.
 */
let animator;

/**
 * Our TokenHooks instance.
 */
let tokenHooks;

// Extract our early available dependencies out of the global scope.
const {
  Hooks,
  jQuery,
  renderTemplate,
} = global;

/* ------------------------------------ */
/* Initialize module                    */
/* ------------------------------------ */
Hooks.once('init', () => {
  console.log('hey-wait | Initializing hey-wait');
  registerSettings();
});

/* ------------------------------------ */
/* Setup module                         */
/* ------------------------------------ */
Hooks.on('canvasReady', async () => {
  const { canvas, game, ui } = global;
  const backgroundLayer = global.CONFIG.Canvas.layers.background;

  collision = new Collision(canvas.grid.size);
  gameChanger = new GameChanger(game, canvas);
  entityFinder = new EntityFinder(game, canvas);

  const layer = canvas.layers.find(
    (targetLayer) => targetLayer instanceof backgroundLayer,
  );

  tokenCalculator = new TokenCalculator();
  animator = new Animator(layer, ease);

  reactionCoordinator = new ReactionCoordinator(
    tokenCalculator,
    animator,
    game.settings,
  );

  macroOperations = new MacroOperations(
    game.user,
    canvas.background,
    game.macros,
    ui.notifications,
  );
  userOperations = new UserOperations(game.user, game.settings);

  // Ensure that we only have a single socket open for our module so we don't
  // clutter up open sockets when changing scenes (or, more specifically,
  // rendering new canvases.)
  if (socketController instanceof SocketController) {
    await socketController.deactivate();
  }
  socketController = new SocketController(
    game.socket,
    game.user,
    gameChanger,
    reactionCoordinator,
    entityFinder,
    userOperations,
    macroOperations,
  );

  triggering = new Triggering(
    gameChanger,
    new TokenAnimationWatcher(),
    socketController,
    collision,
    macroOperations,
  );
  tileAuditor = new TileAuditor();

  tokenHooks = new TokenHooks(game.user, game.settings);

  tokenUpdateCoordinator = new TokenUpdateCoordinator(
    triggering,
    tokenCalculator,
    reactionCoordinator,
  );

  await socketController.init();
});

Hooks.on('preCreateTile', (document, data) => {
  // This is referencing the data attached from the form submission, not a flag.
  const isHeyWait = Boolean(data?.isHeyWaitTile);

  if (!isHeyWait) {
    return;
  }

  // Set the "hey-wait" flag on the new tile dataset.
  data.flags = data.flags || {};

  data.flags['hey-wait'] = {
    enabled: true,
    triggered: false,
    animType: Number(data.heyWaitAnimType),
    macro: data.heyWaitMacro,
  };

  // Hey, Wait! tiles should be hidden so players cannot see them.
  data.hidden = true;

  document.data.update(data);
});

Hooks.on('preUpdateTile', (document, change, options) => {
  const { data } = document;

  if (!data?.flags?.['hey-wait']?.enabled) {
    return;
  }

  // Ensure that Hey, Wait! tiles cannot be rotated.
  // Currently, our logic for collision doesn't take into account rotations.
  if (change?.rotation !== undefined) {
    change.rotation = 0;
  }

  change.flags = change.flags || {};
  change.flags['hey-wait'] = change.flags['hey-wait'] || {};

  // Record the selected animation type for the Hey, Wait! tile.
  if (change?.heyWaitAnimType !== undefined) {
    change.flags['hey-wait'].animType = Number(change.heyWaitAnimType);
    options.diff = true;
  }

  // Record the selected macro for the Hey, Wait! tile.
  if (change?.heyWaitMacro !== undefined) {
    change.flags['hey-wait'].macro = change.heyWaitMacro;
    options.diff = true;
  }

  // Change the tile image depending on triggered state.
  const triggered = change.flags['hey-wait']?.triggered;
  if (triggered !== undefined) {
    change.img = triggered ? Constants.TILE_GO_PATH : Constants.TILE_STOP_PATH;
    options.diff = true;
  }

  // Clean the document for any Hey, Wait! residue.
  delete data.isHeyWaitTile;
  delete data.heyWaitAnimType;
  delete data.heyWaitMacro;
});

Hooks.on('preUpdateToken', async (document) => {
  tokenUpdateCoordinator.registerTokenInitPos(
    document.toObject(),
  );
});

Hooks.on('updateToken', async (document, change) => {
  const canRunUpdate = tokenHooks.canRunTokenUpdate(
    change,
    document.data.disposition,
    global.game.paused,
  );

  if (!canRunUpdate) {
    return;
  }

  await tokenUpdateCoordinator.coordinateUpdate(
    document,
    global.canvas.background.tiles,
  );
});

Hooks.on('getSceneControlButtons', (controls) => {
  const controlsGenerator = new ControlsGenerator();
  controlsGenerator.generate(
    controls,
    global.game.user.isGM,
  );
});

Hooks.on('renderFormApplication', (config, html) => {
  // Ensure the form application we're targeting is actually the Tile config.
  // Ensure that we're also interacting with a Hey, Wait! tile, and not
  // a regular tile.
  if (
    !config?.options?.id
    || config.options.id !== global.CONFIG.Tile.sheetClass.defaultOptions.id
    || !tileAuditor.isHeyWaitTile(config.object, global.game.activeTool)
  ) {
    return;
  }

  const windowTitleEl = html.find('.window-title');
  const originalTitle = windowTitleEl.html();
  windowTitleEl.html(`Hey, Wait! ${originalTitle}`);

  // Ensure we have the correct height for all the new Hey, Wait! elements.
  html.height(384);
});

Hooks.on('renderTileConfig', (config) => {
  const { game } = global;

  if (
    !tileAuditor.isHeyWaitTile(config.object, game.activeTool)
  ) {
    return;
  }

  const selectedAnimType = config.object.data?.flags?.['hey-wait']?.animType
    ?? Animator.animationTypes.TYPE_NONE;

  const setMacro = config.object.data?.flags?.['hey-wait']?.macro;

  // Ensure the "setMacro" exists and wasn't deleted.
  const selectedMacro = setMacro && game.macros.get(setMacro)
    ? setMacro
    : 0;

  // Hide the file picker, rotation, and notes for Hey, Wait! tiling...
  const $tileSpriteInputEl = jQuery(config.form).find(
    'div[data-tab="basic"] input[name="img"]',
  );

  jQuery(config.form).find('.sheet-tabs a[data-tab!="basic"]').hide();
  jQuery(config.form).find('.sheet-tabs a[data-tab="basic"]').html(
    '<i class="fas fa-hand-paper"></i> Hey, Wait!',
  );

  const $tileSpriteGroupEl = $tileSpriteInputEl.closest('.form-group');
  const $rotationGroupEl = jQuery(config.form)
    .find('input[name="rotation"]')
    .closest('.form-group');
  const $tileSpriteNotesEl = $tileSpriteGroupEl.prev('.notes');
  $tileSpriteGroupEl.hide();
  $rotationGroupEl.hide();
  $tileSpriteNotesEl.hide();

  const $opacityGroupEl = jQuery(config.form)
    .find('input[name="alpha"]')
    .closest('.form-group');
  const $tintGroupEl = jQuery(config.form)
    .find('input[name="tint"]')
    .closest('.form-group');
  $opacityGroupEl.hide();
  $tintGroupEl.hide();

  if (!$tileSpriteInputEl.val()) {
    $tileSpriteInputEl.val(Constants.TILE_STOP_PATH);
  }

  const $newNotes = jQuery('<p>')
    .attr('class', 'notes');
  $newNotes.html(
    'Configure this Hey, Wait! tile. Hey, Wait! tiles that are <span style="color:darkred;font-weight:bold;">red</span> have not been triggered yet. Hey, Wait! tiles that are <span style="color:green;font-weight:bold;">green</span> have already been triggered by players.',
  );

  // Build "Trigger Animation Type" dropdown.
  const tileType = jQuery('<select></select>')
    .attr('name', 'heyWaitAnimType');
  const tileTypeKeys = Object.values(Animator.animationTypes);
  const tileTypeValues = [
    game.i18n.localize('HEYWAIT.TILECONFIG.typeNone'),
    game.i18n.localize('HEYWAIT.TILECONFIG.typeInfo'),
    game.i18n.localize('HEYWAIT.TILECONFIG.typeQuestion'),
    game.i18n.localize('HEYWAIT.TILECONFIG.typeExclamation'),
  ];

  for (let i = 0; i < tileTypeKeys.length; i += 1) {
    const option = jQuery('<option></option>');
    jQuery(option).val(tileTypeKeys[i]);
    jQuery(option).html(tileTypeValues[i]);
    jQuery(tileType).append(option);
  }

  tileType.val(selectedAnimType);

  const tileTypeLabel = jQuery('<label></label>')
    .attr('for', 'heyWaitAnimType')
    .html(game.i18n.localize('HEYWAIT.TILECONFIG.typeText'));

  const tileTypeWrapped = tileType
    .wrap('<div class="form-group"></div>')
    .parent();

  tileTypeWrapped.prepend(tileTypeLabel);

  // Build "Macro" dropdown.
  const $macro = jQuery('<select></select>')
    .attr('name', 'heyWaitMacro');

  // Add "none" at start.
  const noneOption = jQuery('<option></option>');
  jQuery(noneOption).val(0);
  jQuery(noneOption).html(game.i18n.localize('HEYWAIT.TILECONFIG.macroNone'));
  jQuery($macro).append(noneOption);

  game.macros.forEach((macro) => {
    const option = jQuery('<option></option>');
    jQuery(option).val(macro.id);
    jQuery(option).html(macro.data.name);
    jQuery($macro).append(option);
  });

  $macro.val(selectedMacro);

  const $macroLabel = jQuery('<label></label>')
    .attr('for', 'heyWaitMacro')
    .html(game.i18n.localize('HEYWAIT.TILECONFIG.macroText'));

  const macroWrapped = $macro
    .wrap('<div class="form-group"></div>')
    .parent();

  macroWrapped.prepend($macroLabel);

  jQuery(config.form).find('div[data-tab="basic"]').first().append(
    tileTypeWrapped,
  );
  jQuery(config.form).find('div[data-tab="basic"]').first().append(
    macroWrapped,
  );

  // Add the hidden element specifying that this is a Hey, Wait! Tile.
  const hidden = jQuery('<input>')
    .attr('type', 'hidden')
    .attr('name', 'isHeyWaitTile')
    .attr('value', 1);

  $newNotes.insertBefore($tileSpriteGroupEl);
  jQuery(hidden).insertBefore(
    jQuery(config.form).find(':submit'),
  );
});

Hooks.on('renderTileHUD', async (tileHud, html) => {
  const tileDocument = tileHud.object.document;

  if (!tileDocument.data?.flags?.['hey-wait']?.enabled) {
    return;
  }

  // Hide the visibility icon as the Hey, Wait! tiles should always be hidden
  // from players' view.
  html.find('.control-icon[data-action="visibility"]').hide();
  html.find('.control-icon[data-action="overhead"]').hide();
  html.find('.control-icon[data-action="underfoot"]').hide();

  // Append Hey, Wait! template for the HUD. We need to specify `isNotTriggered`
  // due to Handlebars not being able to inverse logic in a conditional.
  const form = await renderTemplate(Constants.TEMPLATE_HUD_PATH, {
    isNotTriggered: !tileDocument.data?.flags?.['hey-wait']?.triggered,
  });
  html.find('.col.right').prepend(form);

  html.find('.hey-wait-isNotTriggered').click(async () => {
    // Toggle the triggered state of the Hey, Wait! tile.
    await tileDocument.setFlag(
      'hey-wait',
      'triggered',
      !tileDocument.getFlag('hey-wait', 'triggered'),
    );

    tileHud.render();
  });
});
