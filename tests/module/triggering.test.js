import Triggering from 'module/triggering';

it('can exit early when checking if is hey wait tile when checking is triggered', () => {
  const triggering = new Triggering({});
  let result = triggering.isTileTriggered({}, {}, {});
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
  result = triggering.isTileTriggered({}, tile);
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
  const result = triggering.isTileTriggered({}, tile, {});
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
  const result = triggering.isTileTriggered({}, tile, {});
  expect(result).toBeFalsy();
  expect(checkTileTokenCollision).toHaveBeenCalled();
});

it('can exit early if no tile triggering took place', () => {
  const mockCollision = {};
  mockCollision.checkTileTokenCollision = jest.fn().mockReturnValue(false);

  const triggering = new Triggering(mockCollision);
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

  const tokenPos = { x: 1, y: 1 };
  const result = triggering.isTileTriggered({}, tile, tokenPos);

  expect(mockCollision.checkTileTokenCollision).toHaveBeenCalledWith(
    tile,
    {},
    tokenPos,
  );
  expect(result).toBeFalsy();
});

it('can determine a tile has been triggered', () => {
  const mockCollision = {};
  mockCollision.checkTileTokenCollision = jest.fn().mockReturnValue(true);

  const triggering = new Triggering(mockCollision);
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

  const tokenPos = { x: 1, y: 1 };
  const result = triggering.isTileTriggered({}, tile, tokenPos);

  expect(mockCollision.checkTileTokenCollision).toHaveBeenCalledWith(
    tile,
    {},
    tokenPos,
  );
  expect(result).toBeTruthy();
});
