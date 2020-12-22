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

/* eslint no-console: ['error', { allow: ['warn', 'log', 'debug'] }] */
/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* global Canvas */
/* global CONFIG */
/* global Hooks */
/* global Scene */
/* global canvas */
/* global game */
/* global jQuery */
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
  triggering = new Triggering(collision);

  // Ensure that we only have a single socket open for our module so we don't
  // clutter up open sockets when changing scenes (or, more specifically,
  // rendering new canvases.)
  if (socketController instanceof SocketController) {
    await socketController.deactivate();
  }
  socketController = new SocketController(game.socket, game, game.user, canvas, triggering);

  tileAuditor = new TileAuditor();

  await socketController.init();
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

  // Only update images if we're dealing with newly triggered or not triggered
  // Hey, Wait! tiles.
  if (typeof delta?.flags?.['hey-wait']?.triggered === 'undefined') {
    return;
  }

  if (delta.flags['hey-wait'].triggered) {
    delta.img = 'modules/hey-wait/src/img/hey_wait_green.png';
  } else {
    delta.img = 'modules/hey-wait/src/img/hey_wait_red.png';
  }
});

Hooks.on('updateToken', async (scene, token, delta) => {
  // Exit early if there's no relevant updates. Specifically, if the token
  // has not moved or the game is actually paused.
  if (
    (!delta?.x && !delta?.y)
    || game.paused
  ) {
    return;
  }

  canvas.tiles.placeables.every((tile) => {
    const isTriggered = triggering.isTriggered(token, tile);

    if (isTriggered) {
      // Execute canvas functionality like pausing the game and panning
      // over to the player.

      if (game.user.isGM) {
        game.togglePause(true, true);
        triggering.handleTileChange(tile);
      }

      const { x, y } = token;

      canvas.animatePan({
        x,
        y,
        scale: Math.max(1, canvas.stage.scale.x),
        duration: Constants.CANVAS_PAN_DURATION,
      });

      socketController.emit(x, y, tile.data._id, game.user.viewedScene);

      // Return false to break out of the `every` loop. This is actually
      // successful and the functionality should have been executed at this
      // point.
      return false;
    }

    return true;
  });
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

  tileSpriteInputEl.val('modules/hey-wait/src/img/hey_wait_red.png');

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
  const form = await renderTemplate('/modules/hey-wait/src/templates/hud.hbs', {
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
