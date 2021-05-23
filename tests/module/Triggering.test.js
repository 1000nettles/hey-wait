import Triggering from 'module/Triggering';
import Animator from 'module/Animator';

const initPos = {
  x: 1,
  y: 2,
};
const viewedScene = 'a_viewed_scene';

const mockMacroOperations = {};

beforeEach(() => {
  mockMacroOperations.handleTileMacroFiring = jest.fn();
});

it('can exit early when checking if is hey wait tile when checking is triggered', async () => {
  // gameChanger, tokenAnimationWatcher, socketController, collision
  const triggering = new Triggering({}, {}, {}, {});
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
  const triggering = new Triggering({}, {}, {}, {});
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

  const triggering = new Triggering({}, {}, {}, mockCollision);
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
  mockGameChanger.pan = jest.fn();

  const mockSocketController = {};
  mockSocketController.emit = jest.fn();

  const mockTokenAnimationWatcher = {};
  mockTokenAnimationWatcher.watchForCompletion = jest.fn();

  const triggering = new Triggering(
    mockGameChanger,
    mockTokenAnimationWatcher,
    mockSocketController,
    mockCollision,
    mockMacroOperations,
  );

  const tile = {
    id: 'an_id',
    data: {
      flags: {
        'hey-wait': {
          enabled: true,
          triggered: false,
        },
      },
    },
  };

  const token = {
    x: 3,
    y: 4,
  };
  const tokenDoc = {
    id: 'a_token_id',
    object: token,
  };

  const result = await triggering.handleTileTriggering([tile], tokenDoc, initPos, viewedScene);

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

  expect(mockTokenAnimationWatcher.watchForCompletion).toHaveBeenCalledWith(
    'a_token_id',
  );

  expect(mockSocketController.emit).toHaveBeenCalledWith(
    'a_token_id',
    'an_id',
    'a_viewed_scene',
    { x: 3, y: 4 },
    Animator.animationTypes.TYPE_NONE,
  );

  expect(mockGameChanger.pan).toHaveBeenCalledWith(
    { x: 3, y: 4 },
  );

  expect(mockMacroOperations.handleTileMacroFiring).toHaveBeenCalledWith(
    'an_id',
    tokenDoc,
  );

  expect(result).toBeTruthy();
});
