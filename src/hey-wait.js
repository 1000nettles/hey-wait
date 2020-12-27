/**
 * The main entry point for "Hey, Wait!".
 *
 * Author: 1000Nettles
 * Content License: MIT
 * Software License: MIT
 */

// Import JavaScript modules.
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

/* eslint no-console: ['error', { allow: ['warn', 'log', 'debug'] }] */
/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* global Canvas */
/* global CONFIG */
/* global Hooks */
/* global Scene */
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

  // Ensure that we only have a single socket open for our module so we don't
  // clutter up open sockets when changing scenes (or, more specifically,
  // rendering new canvases.)
  if (socketController instanceof SocketController) {
    await socketController.deactivate();
  }
  socketController = new SocketController(game.socket, game.user, gameChanger);

  triggering = new Triggering(gameChanger, socketController, collision);
  tileAuditor = new TileAuditor();
  tokenUpdateCoordinator = new TokenUpdateCoordinator(
    triggering,
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
  };

  // Hey, Wait! tiles should be hidden so players cannot see them.
  data.hidden = true;
});

Hooks.on('preUpdateTile', (scene, data, delta) => {
  // Ensure that Hey, Wait! tiles cannot be rotated.
  // Probably temporary, our logic for collision doesn't take into account
  // rotations.
  if (
    data?.flags?.['hey-wait']?.enabled
    && delta?.rotation !== undefined
  ) {
    delta.rotation = 0;
  }
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

Hooks.on('preUpdateToken', async (scene, token) => {
  tokenUpdateCoordinator.registerTokenInitPos(token);
});

Hooks.on('updateToken', async (scene, token, delta) => {
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
    game.user.viewedScene,
  );
});

Hooks.on('getSceneControlButtons', (controls) => {
  const controlsGenerator = new ControlsGenerator();
  controlsGenerator.generate(
    controls,
    game.user.isGM,
  );
});

Hooks.on('renderFormApplication', (tileConfig, html) => {
  if (
    !tileAuditor.isHeyWaitTile(tileConfig.object, game.activeTool)
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

  // Hide the file picker and notes for Hey, Wait! tiling...
  const tileSpriteInputEl = jQuery(config.form).find('input[name="img"]');
  const tileSpriteGroupEl = tileSpriteInputEl.closest('.form-group');
  const rotationGroupEl = jQuery(config.form)
    .find('input[name="rotation"]')
    .closest('.form-group');
  const tileSpriteNotesEl = tileSpriteGroupEl.prev('.notes');
  tileSpriteGroupEl.hide();
  rotationGroupEl.hide();
  tileSpriteNotesEl.hide();

  tileSpriteInputEl.val(Constants.TILE_STOP_PATH);

  const newNotes = jQuery('<p>')
    .attr('class', 'notes');
  newNotes.html(
    'Configure this Hey, Wait! tile. Hey, Wait! tiles that are <span style="color:darkred;font-weight:bold;">red</span> have not been triggered yet. Hey, Wait! tiles that are <span style="color:green;font-weight:bold;">green</span> have already been triggered by players.',
  );

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
