import Triggering from '../../src/module/triggering';
import Constants from '../../src/module/constants';

it('can exit early when checking if is hey wait tile when handling token triggering', () => {
  const triggering = new Triggering({});
  let result = triggering.handleTokenTriggering({}, {});
  expect(result).toBeFalsy();

  const tile = {
    data: {
      flags: {
        'hey-wait': {
          enabled: false,
        },
      },
    },
  };
  result = triggering.handleTokenTriggering({}, tile);
  expect(result).toBeFalsy();
});

it('can exit early when checking if previously triggered when handling token triggering', () => {
  const triggering = new Triggering({});
  const tile = {
    data: {
      flags: {
        'hey-wait': {
          triggered: true,
        },
      },
    },
  };
  const result = triggering.handleTokenTriggering({}, tile);
  expect(result).toBeFalsy();
});

it('can exit early when checking no collision when handling token triggering', () => {
  const checkTileTokenCollision = jest.fn();
  checkTileTokenCollision.mockReturnValue(false);

  const collision = {
    checkTileTokenCollision,
  };

  const triggering = new Triggering(collision);
  const tile = {
    data: {
      flags: {
        'hey-wait': {
          enabled: true,
          triggered: false,
        },
      },
    },
  };
  const result = triggering.handleTokenTriggering({}, tile);
  expect(result).toBeFalsy();
  expect(checkTileTokenCollision).toHaveBeenCalled();
});

it('can exit early when checking no collision when handling token triggering', () => {
  const checkTileTokenCollision = jest.fn();
  checkTileTokenCollision.mockReturnValue(false);

  const collision = {
    checkTileTokenCollision,
  };

  const triggering = new Triggering(collision);
  const tile = {
    data: {
      flags: {
        'hey-wait': {
          enabled: true,
          triggered: false,
        },
      },
    },
  };
  const result = triggering.handleTokenTriggering({}, tile);
  expect(result).toBeFalsy();
  expect(checkTileTokenCollision).toHaveBeenCalled();
});

it('can do handling token triggering correctly', () => {
  const checkTileTokenCollision = jest.fn();
  checkTileTokenCollision.mockReturnValue(true);
  const update = jest.fn();

  const collision = {
    checkTileTokenCollision,
  };

  const triggering = new Triggering(collision);
  const tile = {
    data: {
      flags: {
        'hey-wait': {
          enabled: true,
          triggered: false,
        },
      },
    },
    update,
  };

  const expectedTile = {
    data: {
      flags: {
        'hey-wait': {
          enabled: true,
          triggered: true,
        },
      },
      img: Constants.TILE_GREEN_PATH,
    },
    update,
  }

  const result = triggering.handleTokenTriggering({}, tile);
  expect(result).toBeTruthy();
  expect(checkTileTokenCollision).toHaveBeenCalledTimes(1);
  expect(update).toHaveBeenCalledTimes(1);
  expect(expectedTile).toEqual(tile);
});
