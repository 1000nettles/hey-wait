import Patterner from 'module/patterner';
import Constants from 'module/constants';

/* global PIXI */

let tile;
let tilingSprite;
let patterner;

beforeEach(() => {
  tile = {};
  tile.tile = {};
  tile.tile.removeChild = jest.fn();
  tile.tile.addChild = jest.fn();
  tile.tile.img = 'an_img';
  tile.refresh = jest.fn();

  tilingSprite = jest.fn();
  global.PIXI = {};
  global.PIXI.TilingSprite = tilingSprite;

  global.loadTexture = jest.fn(() => 'a_texture');

  patterner = new Patterner();
});

it('should add patterning to a non-triggered tile', async () => {
  await patterner.addPatterningToTile(tile);

  expect(global.loadTexture)
    .toHaveBeenCalledWith(
      Constants.TILE_STOP_PATH,
      { fallback: Constants.TILE_FALLBACK_PATH },
    );
  expect(PIXI.TilingSprite).toHaveBeenCalledWith(
    'a_texture',
    Constants.TILE_STOP_WIDTH,
    Constants.TILE_STOP_HEIGHT,
  );
  expect(tile.tile.removeChild)
    .toHaveBeenCalledWith('an_img');
  expect(tile.tile.addChild)
    .toHaveBeenCalledTimes(1);
  expect(tile.refresh)
    .toHaveBeenCalledTimes(1);
});

it('should add patterning to a triggered tile', async () => {
  tile.data = {
    flags: {
      'hey-wait': {
        triggered: true,
      },
    },
  };

  await patterner.addPatterningToTile(tile);

  expect(global.loadTexture)
    .toHaveBeenCalledWith(
      Constants.TILE_GO_PATH,
      { fallback: Constants.TILE_FALLBACK_PATH },
    );
  expect(PIXI.TilingSprite).toHaveBeenCalledWith(
    'a_texture',
    Constants.TILE_GO_WIDTH,
    Constants.TILE_GO_HEIGHT,
  );
  expect(tile.tile.removeChild)
    .toHaveBeenCalledWith('an_img');
  expect(tile.tile.addChild)
    .toHaveBeenCalledTimes(1);
  expect(tile.refresh)
    .toHaveBeenCalledTimes(1);
});
