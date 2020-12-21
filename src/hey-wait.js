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
  if (game.activeTool !== 'heyWaitTile') {
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
  newNotes.html('Configure this Hey, Wait! tile. Hey, Wait! tiles that are <span style="color:darkred;font-weight:bold;">red</span> have not been activated yet. Hey, Wait! tiles that are <span style="color:green;font-weight:bold;">green</span> have already been activated by players.');

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

  // Set the "hey wait" flag on the new tile dataset.
  if (!data?.flags) {
    data.flags = {};
  }

  data.flags['hey-wait'] = {
    enabled: true,
  };

  // Hey wait tiles should be hidden so players cannot see them.
  data.hidden = true;
});

Hooks.on('updateToken', (scene, entity, delta, audit) => {
  console.log('delta');
  console.log(delta);
  canvas.tiles.placeables.forEach((tile) => {
    console.log(tile);
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

    // Update the tile to show it has been triggered.
    tile.data.img = 'modules/hey-wait/img/hey_wait_green.png';
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
  if (game.activeTool !== 'heyWaitTile') {
    return;
  }

  const windowTitleEl = html.find('.window-title');
  const originalTitle = windowTitleEl.html();
  windowTitleEl.html(`Hey, Wait! ${originalTitle}`);
});
