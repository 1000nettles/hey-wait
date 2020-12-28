import Triggering from 'module/triggering';

const initPos = {
  x: 1,
  y: 2,
};
const viewedScene = 'a_viewed_scene';

it('can exit early when checking if is hey wait tile when checking is triggered', async () => {
  const triggering = new Triggering({}, {}, {});
  let result = await triggering.handleTileTriggering([], {}, initPos, 'a_viewed_scene');
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
  result = await triggering.handleTileTriggering([tile], {}, initPos, viewedScene);
  expect(result).toBeFalsy();
});

it('can exit early when checking if previously triggered when checking is triggered', async () => {
  const triggering = new Triggering({}, {}, {});
  const tile = {
    data: {
      flags: {
        'hey-wait': {
          triggered: true,
        },
      },
    },
  };
  const result = await triggering.handleTileTriggering([tile], {}, initPos, viewedScene);
  expect(result).toBeFalsy();
});

it('can exit early when checking no collision when checking is triggered', async () => {
  const checkTileTokenCollision = jest.fn();
  checkTileTokenCollision.mockReturnValue(false);

  const mockCollision = {
    checkTileTokenCollision,
  };

  const triggering = new Triggering({}, {}, mockCollision);
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
  const result = await triggering.handleTileTriggering([tile], {}, initPos, viewedScene);
  expect(result).toBeFalsy();
  expect(checkTileTokenCollision).toHaveBeenCalled();
});

it('can determine a tile has been triggered', async () => {
  const mockCollision = {};
  mockCollision.checkTileTokenCollision = jest.fn().mockReturnValue(true);

  const mockGameChanger = {};
  mockGameChanger.execute = jest.fn();

  const mockSocketController = {};
  mockSocketController.emit = jest.fn();

  const triggering = new Triggering(mockGameChanger, mockSocketController, mockCollision);
  const tile = {
    data: {
      _id: 'an_id',
      flags: {
        'hey-wait': {
          enabled: true,
          triggered: false,
        },
      },
    },
  };

  const token = {
    _id: 'a_token_id',
    x: 3,
    y: 4,
  };

  const result = await triggering.handleTileTriggering([tile], token, initPos, viewedScene);

  expect(mockCollision.checkTileTokenCollision).toHaveBeenCalledWith(
    tile,
    token,
    { x: 1, y: 2 },
  );

  expect(mockGameChanger.execute).toHaveBeenCalledWith(
    'an_id',
    { x: 3, y: 4 },
    'a_viewed_scene',
  );

  expect(mockSocketController.emit).toHaveBeenCalledWith(
    'a_token_id',
    'an_id',
    'a_viewed_scene',
  );

  expect(result).toBeTruthy();
});
