/**
 * The main entry point for "Hey, Wait!".
 *
 * Author: 1000Nettles
 * Content License: MIT
 * Software License: MIT
 */

// Import JavaScript modules
import registerSettings from './module/settings';
import ControlsGenerator from './module/controlsGenerator';

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

function heyWaitInBounds(tile, token) {
  const maxX = tile.width + tile.x;
  const maxY = tile.height + tile.y;

  const x = token.x + (token.width * canvas.grid.size) / 2;
  const y = token.y + (token.height * canvas.grid.size) / 2;

  console.log({
    tileX: tile.x,
    tileY: tile.y,
    maxX,
    maxY,
    x,
    y,
  });

  if (
    (x > tile.x && y > tile.y)
    && (x < maxX && y < maxY)
  ) {
    return true;
  }

  return false;
}

/* ------------------------------------ */
/* Initialize module                    */
/* ------------------------------------ */
Hooks.once('init', async () => {
  console.log('hey-wait | Initializing hey-wait');

  // Assign custom classes and constants here

  // Register custom module settings
  registerSettings();
});

/* ------------------------------------ */
/* Setup module                         */
/* ------------------------------------ */
Hooks.once('setup', () => {
  // Do anything after initialization but before ready.
});

/* ------------------------------------ */
/* When ready                           */
/* ------------------------------------ */
Hooks.once('ready', () => {
  // Do anything once the module is ready.
});

Hooks.on('renderTileConfig', (config) => {
  const isHeyWait = Boolean(config.object.data?.flags?.['hey-wait']?.enabled);

  if (!isHeyWait) {
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

Hooks.on('preCreateTile', (scene, data) => {
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

Hooks.on('updateToken', (scene, entity, delta) => {
  // Exit early if there's no relevant updates. Specifically, if the token
  // has not moved or the game is actually paused.
  if (
    (!delta?.x && !delta?.y)
    || game.paused
  ) {
    return;
  }

  canvas.tiles.placeables.forEach((tile) => {
    const isHeyWait = Boolean(tile.data?.flags?.['hey-wait']?.enabled);
    if (!isHeyWait) {
      return;
    }

    const hasBeenTriggered = Boolean(tile.data?.flags?.['hey-wait']?.triggered);
    if (hasBeenTriggered) {
      return;
    }

    if (!heyWaitInBounds(tile, entity)) {
      return;
    }

    // Update the tile to reflect that it has been triggered.
    tile.data.img = 'modules/hey-wait/img/hey_wait_green.png';
    tile.data.flags['hey-wait'].triggered = true;
    tile.update(tile.data, { diff: false });

    game.togglePause(true, true);
    canvas.animatePan({
      x: entity.x, y: entity.y, scale: Math.max(1, canvas.stage.scale.x), duration: 1000,
    });
  });
});

Hooks.on('getSceneControlButtons', (controls) => {
  const controlsGenerator = new ControlsGenerator();
  controlsGenerator.generate(
    controls,
    game.user.isGM,
  );
});

Hooks.on('renderFormApplication', (tileConfig, html, options) => {
  const isHeyWait = tileConfig.object.data?.flags?.['hey-wait']?.enabled;

  if (!isHeyWait) {
    return;
  }

  const windowTitleEl = html.find('.window-title');
  const originalTitle = windowTitleEl.html();
  windowTitleEl.html(`Hey, Wait! ${originalTitle}`);
});

Hooks.on('renderTileHUD', async (tileHud, html) => {
  const tile = tileHud.object;

  if (!tile.data?.flags?.['hey-wait']?.enabled) {
    return;
  }

  // Hide the visibility icon as the Hey, Wait! tiles should always be hidden
  // from players' view.
  html.find('.control-icon.visibility').hide();

  // Append Hey, Wait! template for the HUD.
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
