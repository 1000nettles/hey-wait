/**
 * The main entry point for "Hey, Wait!".
 *
 * Author: 1000Nettles
 * Content License: MIT
 * Software License: MIT
 */

// Import JavaScript modules.
import { ease } from 'pixi-ease';
import registerSettings from './module/settings';
import ControlsGenerator from './module/controlsGenerator';
import Collision from './module/collision';
import Triggering from './module/triggering';
import TileAuditor from './module/tileAuditor';
import Constants from './module/constants';
import SocketController from './module/socketController';
import TokenUpdateCoordinator from './module/tokenUpdateCoordinator';
import GameChanger from './module/gameChanger';
import Patterner from './module/patterner';
import Animator from './module/animator';
import TokenCalculator from './module/tokenCalculator';
import ReactionCoordinator from './module/reactionCoordinator';
import EntityFinder from './module/entityFinder';
import TokenAnimationWatcher from './module/tokenAnimationWatcher';
import UserOperations from './module/userOperations';

/* eslint no-console: ['error', { allow: ['warn', 'log', 'debug'] }] */
/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* global Canvas */
/* global CanvasAnimation */
/* global CONFIG */
/* global Hooks */
/* global Scene */
/* global TilesLayer */
/* global TileConfig */
/* global PIXI */
/* global canvas */
/* global loadTexture */
/* global game */
/* global jQuery */
/* global getProperty */
/* global getFlag */
/* global mergeObject */
/* global renderTemplate */
/* global setFlag */

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
 * Our GameChanger instance.
 */
let gameChanger;

/**
 * Our TokenUpdateCoordinator instance.
 */
let tokenUpdateCoordinator;

/**
 * Our Patterner instance.
 */
let patterner;

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

/* ------------------------------------ */
/* Initialize module                    */
/* ------------------------------------ */
Hooks.once('init', async () => {
  console.log('hey-wait | Initializing hey-wait');
  registerSettings();
});

/* ------------------------------------ */
/* Setup module                         */
/* ------------------------------------ */
Hooks.on('canvasReady', async () => {
  collision = new Collision(canvas.grid.size);
  gameChanger = new GameChanger(game, canvas);
  entityFinder = new EntityFinder(game, canvas);

  const layer = canvas.layers.find(
    (targetLayer) => targetLayer instanceof TilesLayer,
  );

  tokenCalculator = new TokenCalculator();
  animator = new Animator(layer, ease);

  reactionCoordinator = new ReactionCoordinator(
    tokenCalculator,
    animator,
    game.settings,
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
  );

  triggering = new Triggering(
    gameChanger,
    new TokenAnimationWatcher(),
    socketController,
    collision,
  );
  tileAuditor = new TileAuditor();

  tokenUpdateCoordinator = new TokenUpdateCoordinator(
    triggering,
    tokenCalculator,
    reactionCoordinator,
  );

  patterner = new Patterner();

  await socketController.init();

  // Once the canvas is ready, ensure our Hey, Wait! tiles are using the correct
  // patterning instead of a static image.
  await canvas.tiles.placeables.forEach(async (tile) => {
    if (
      !tile.data?.flags?.['hey-wait']?.enabled
    ) {
      return;
    }

    patterner.addPatterningToTile(tile);
  });
});

/* ------------------------------------ */
/* When ready                           */
/* ------------------------------------ */
Hooks.on('preCreateTile', (scene, data) => {
  // This is referencing the data attached from the form submission, not a flag.
  const isHeyWait = Boolean(data?.isHeyWaitTile);

  if (!isHeyWait) {
    return;
  }

  // Set the "hey-wait" flag on the new tile dataset.
  if (!data?.flags) {
    data.flags = {};
  }

  data.flags['hey-wait'] = {
    enabled: true,
    triggered: false,
    animType: Number(data.heyWaitAnimType),
  };

  // Hey, Wait! tiles should be hidden so players cannot see them.
  data.hidden = true;
});

Hooks.on('createTile', async (scene, data) => {
  if (
    !data?.flags?.['hey-wait']?.enabled
  ) {
    return;
  }

  // As the hook doesn't pass the full Tile object, get it from the canvas
  // and pass it to be patterned.
  const createdTile = canvas.tiles.get(data._id);
  await patterner.addPatterningToTile(createdTile);
});

Hooks.on('preUpdateTile', (scene, data, delta, options) => {
  if (!data?.flags?.['hey-wait']?.enabled) {
    return;
  }

  // Ensure that Hey, Wait! tiles cannot be rotated.
  // Probably temporary, our logic for collision doesn't take into account
  // rotations.
  if (delta?.rotation !== undefined) {
    delta.rotation = 0;
  }

  // Record the selected animation type for the Hey, Wait! tile.
  if (delta?.heyWaitAnimType !== undefined) {
    data.flags['hey-wait'].animType = Number(delta?.heyWaitAnimType);
    options.diff = true;
  }
});

Hooks.on('updateTile', async (scene, data) => {
  if (
    !data?.flags?.['hey-wait']?.enabled
  ) {
    return;
  }

  // As the hook doesn't pass the full Tile object, get it from the canvas
  // and pass it to be patterned.
  const updatedTile = canvas.tiles.get(data._id);
  await patterner.addPatterningToTile(updatedTile);
});

Hooks.on('preUpdateToken', async (scene, token, delta, diff, userId) => {
  // We only want to be responsible for the current user's triggering and
  // emitting that to other users. If we observe another user updating a
  // token, don't worry about it and let them be in charge of emitting the
  // triggering to us later.
  if (game.data.userId !== userId) {
    return;
  }

  tokenUpdateCoordinator.registerTokenInitPos(token);
});

Hooks.on('updateToken', async (scene, token, delta, diff, userId) => {
  // We only want to be responsible for the current user's triggering and
  // emitting that to other users. If we observe another user updating a
  // token, don't worry about it and let them be in charge of emitting the
  // triggering to us later.
  if (game.data.userId !== userId) {
    return;
  }

  // Exit early if there's no relevant updates. Specifically, if the token
  // has not moved or the game is actually paused.
  if (
    (delta?.x === undefined && delta?.y === undefined)
    || game.paused
  ) {
    return;
  }

  if (game.user.isGM) {
    const restrictGm = game.settings.get(
      Constants.MODULE_NAME,
      'restrict-gm',
    );

    // If we are restricting a GM from triggering Hey, Wait! tiles, let's exit
    // early so they don't move through the triggering flow.
    if (restrictGm) {
      return;
    }
  }

  await tokenUpdateCoordinator.coordinateUpdate(
    token,
    canvas.tiles.placeables,
    scene,
  );
});

Hooks.on('getSceneControlButtons', (controls) => {
  const controlsGenerator = new ControlsGenerator();
  controlsGenerator.generate(
    controls,
    game.user.isGM,
  );
});

Hooks.on('renderFormApplication', (config, html) => {
  // Ensure the form application we're targeting is actually the Tile config.
  // Ensure that we're also interacting with a Hey, Wait! tile, and not
  // a regular tile.
  if (
    !config?.options?.id
    || config.options.id !== TileConfig.defaultOptions.id
    || !tileAuditor.isHeyWaitTile(config.object, game.activeTool)
  ) {
    return;
  }

  const windowTitleEl = html.find('.window-title');
  const originalTitle = windowTitleEl.html();
  windowTitleEl.html(`Hey, Wait! ${originalTitle}`);
});

Hooks.on('renderTileConfig', (config) => {
  if (
    !tileAuditor.isHeyWaitTile(config.object, game.activeTool)
  ) {
    return;
  }

  const animType = config.object.data?.flags?.['hey-wait']?.animType
    ?? Animator.animationTypes.TYPE_NONE;

  console.log('animtype');
  console.log(animType);

  // Hide the file picker, rotation, and notes for Hey, Wait! tiling...
  const tileSpriteInputEl = jQuery(config.form).find('input[name="img"]');
  const tileSpriteGroupEl = tileSpriteInputEl.closest('.form-group');
  const rotationGroupEl = jQuery(config.form)
    .find('input[name="rotation"]')
    .closest('.form-group');
  const tileSpriteNotesEl = tileSpriteGroupEl.prev('.notes');
  tileSpriteGroupEl.hide();
  rotationGroupEl.hide();
  tileSpriteNotesEl.hide();

  if (!tileSpriteInputEl.val()) {
    tileSpriteInputEl.val(Constants.TILE_STOP_PATH);
  }

  const newNotes = jQuery('<p>')
    .attr('class', 'notes');
  newNotes.html(
    'Configure this Hey, Wait! tile. Hey, Wait! tiles that are <span style="color:darkred;font-weight:bold;">red</span> have not been triggered yet. Hey, Wait! tiles that are <span style="color:green;font-weight:bold;">green</span> have already been triggered by players.',
  );

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

  tileType.val(animType);

  const tileTypeLabel = jQuery('<label></label>')
    .attr('for', 'heyWaitAnimType')
    .html(game.i18n.localize('HEYWAIT.TILECONFIG.typeText'));

  const tileTypeWrapped = tileType
    .wrap('<div class="form-group"></div>')
    .parent();

  tileTypeWrapped.prepend(tileTypeLabel);

  jQuery(tileTypeWrapped).insertBefore(
    jQuery(config.form).find(':submit'),
  );

  // Add the hidden element specifying that this is a Hey, Wait! Tile.
  const hidden = jQuery('<input>')
    .attr('type', 'hidden')
    .attr('name', 'isHeyWaitTile')
    .attr('value', 1);

  newNotes.insertBefore(tileSpriteGroupEl);
  jQuery(hidden).insertBefore(
    jQuery(config.form).find(':submit'),
  );
});

Hooks.on('renderTileHUD', async (tileHud, html) => {
  const tile = tileHud.object;

  if (!tile.data?.flags?.['hey-wait']?.enabled) {
    return;
  }

  // Hide the visibility icon as the Hey, Wait! tiles should always be hidden
  // from players' view.
  html.find('.control-icon.visibility').hide();

  // Append Hey, Wait! template for the HUD. We need to specify `isNotTriggered`
  // due to Handlebars not being able to inverse logic in a conditional.
  const form = await renderTemplate(Constants.TEMPLATE_HUD_PATH, {
    isNotTriggered: !tile.data?.flags?.['hey-wait']?.triggered,
  });
  html.find('.col.right').prepend(form);

  html.find('.hey-wait-isNotTriggered').click(async () => {
    // Toggle the triggered state of the Hey, Wait! tile.
    await tile.setFlag(
      'hey-wait',
      'triggered',
      !tile.getFlag('hey-wait', 'triggered'),
    );

    tileHud.render();
  });
});
