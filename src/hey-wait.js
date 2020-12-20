/**
 * The main entry point for "Hey, Wait!".
 *
 * Author: 1000Nettles
 * Content License: MIT
 * Software License: MIT
 */

// Import JavaScript modules
import registerSettings from './module/settings';
import HeyWaitLayer from './module/heyWaitLayer';

/* eslint no-console: ['error', { allow: ['warn', 'log', 'debug'] }] */
/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
/* global Canvas */
/* global Hooks */
/* global Scene */
/* global canvas */
/* global game */
/* global jQuery */
/* global mergeObject */

/**
 * Register the Combat Numbers layer into the Canvas' static layers.
 */
function registerStaticLayer() {
  const { layers } = Canvas;
  layers.heyWait = HeyWaitLayer;
  Object.defineProperty(Canvas, 'layers', {
    get() {
      return layers;
    },
  });
}

function registerStaticSceneConfig() {
  return;
  console.log('registering static scene config');
  console.log(Scene.config);
  const existingConfig = Scene.config;
  existingConfig.embeddedEntities = mergeObject(existingConfig.embeddedEntities, {
    HeyWaitMeasuredTemplate: 'heyWaitTemplates',
  });

  Object.defineProperty(Scene, 'config', {
    get: () => existingConfig,
  });
  console.log(Scene.config);
}

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
  registerStaticLayer();

  // Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module                         */
/* ------------------------------------ */
Hooks.once('setup', () => {
  // Do anything after initialization but before
  // ready
});

/* ------------------------------------ */
/* When ready                           */
/* ------------------------------------ */
Hooks.once('ready', () => {
  // Do anything once the module is ready
  // registerStaticSceneConfig();
  console.log(Scene.config);
});

Hooks.on('renderApplication', () => {
  registerStaticSceneConfig();
});

Hooks.on('renderTileConfig', (config) => {
  console.log('is it jquery?');
  console.log(jQuery(config.form).attr('autocomplete'));

  let html = '<div class="form-group"><label for="isHeyWaitTile">Is "Hey, Wait!" Tile?</label><input type="checkbox" name="isHeyWaitTile" ';

  const flag = Boolean(config.object.data?.flags?.['hey-wait'].enabled);

  console.log(flag);

  if (flag) {
    html += 'checked="checked" ';
  }

  html += '/></div>';
  jQuery(html).insertBefore(
    jQuery(config.form).find(':submit'),
  );
});

Hooks.on('updateTile', (scene, data) => {
  const tile = canvas.tiles.get(data._id);
  tile.setFlag('hey-wait', 'enabled', data.isHeyWaitTile);
});

Hooks.on('updateToken', (scene, entity, delta, audit) => {
  console.log('delta');
  console.log(delta);
  canvas.tiles.placeables.forEach((tile) => {
    const isHeyWait = Boolean(tile.data?.flags?.['hey-wait']?.enabled);
    if (!isHeyWait) {
      return;
    }

    if (!heyWaitInBounds(tile, entity)) {
      return;
    }

    if (game.paused) {
      return;
    }

    game.togglePause(true, true);
  });
});
