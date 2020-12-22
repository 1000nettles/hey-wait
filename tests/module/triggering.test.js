import Triggering from 'module/triggering';
import Constants from 'module/constants';

it('can exit early when checking if is hey wait tile when checking is triggered', () => {
  const triggering = new Triggering({});
  let result = triggering.isTriggered({}, {});
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
  result = triggering.isTriggered({}, tile);
  expect(result).toBeFalsy();
});

it('can exit early when checking if previously triggered when checking is triggered', () => {
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
  const result = triggering.isTriggered({}, tile);
  expect(result).toBeFalsy();
});

it('can exit early when checking no collision when checking is triggered', () => {
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
  const result = triggering.isTriggered({}, tile);
  expect(result).toBeFalsy();
  expect(checkTileTokenCollision).toHaveBeenCalled();
});

it('can exit early when checking no collision when checking is triggered', () => {
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
  const result = triggering.isTriggered({}, tile);
  expect(result).toBeFalsy();
  expect(checkTileTokenCollision).toHaveBeenCalled();
});

it('can do handling token triggering correctly', () => {
  const update = jest.fn();

  const triggering = new Triggering({});
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

  const result = triggering.handleTileChange(tile);
  expect(result).toBeTruthy();
  expect(update).toHaveBeenCalledTimes(1);
  expect(expectedTile).toEqual(tile);
});
