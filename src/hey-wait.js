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
Hooks.on('canvasReady', () => {
  collision = new Collision(canvas.grid.size);
  triggering = new Triggering(collision);
  tileAuditor = new TileAuditor();
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
  // Only update images if we're dealing with newly triggered or not triggered
  // Hey, Wait! tiles.
  if (typeof delta?.flags?.['hey-wait']?.triggered === 'undefined') {
    return;
  }

  if (delta.flags['hey-wait'].triggered) {
    delta.img = 'modules/hey-wait/img/hey_wait_green.png';
  } else {
    delta.img = 'modules/hey-wait/img/hey_wait_red.png';
  }
});

Hooks.on('updateToken', async (scene, token, delta) => {
  // Exit early if there's no relevant updates. Specifically, if the token
  // has not moved or the game is actually paused.
  if (
    (!delta?.x && !delta?.y)
    || game.paused
    || !game.user.isGM
  ) {
    return;
  }

  canvas.tiles.placeables.every((tile) => {
    const isTriggered = triggering.handleTokenTriggering(token, tile);

    if (isTriggered) {
      // Execute canvas functionality like pausing the game and panning
      // over to the player.
      game.togglePause(true, true);
      canvas.animatePan({
        x: token.x,
        y: token.y,
        scale: Math.max(1, canvas.stage.scale.x),
        duration: 1000,
      });

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
  const tileSpriteNotesEl = tileSpriteGroupEl.prev('.notes');
  tileSpriteGroupEl.hide();
  tileSpriteNotesEl.hide();

  tileSpriteInputEl.val('modules/hey-wait/img/hey_wait_red.png');

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
  const form = await renderTemplate('/modules/hey-wait/templates/hud.hbs', {
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
