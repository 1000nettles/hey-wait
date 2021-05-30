import TriggeringHandler from 'module/triggering/TriggeringHandler';
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

/* this.collision = collision;
    this.gameChanger = gameChanger;
    this.tokenAnimationWatcher = tokenAnimationWatcher;*/

it('can exit early when checking if is hey wait tile when checking is triggered', async () => {
  // gameChanger, tokenAnimationWatcher, socketController, collision
  const triggeringHandler = new TriggeringHandler({}, {}, {});
  let result = await triggeringHandler.handleTileTriggering([], {}, initPos, 'a_viewed_scene');
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
  result = await triggeringHandler.handleTileTriggering([tile], {}, initPos, viewedScene);
  expect(result).toBeFalsy();
});

it('can exit early when checking if previously triggered when checking is triggered', async () => {
  const triggeringHandler = new TriggeringHandler({}, {}, {});
  const tile = {
    data: {
      flags: {
        'hey-wait': {
          triggered: true,
        },
      },
    },
  };
  const result = await triggeringHandler.handleTileTriggering([tile], {}, initPos, viewedScene);
  expect(result).toBeFalsy();
});

it('can exit early when checking no collision when checking is triggered', async () => {
  const checkTileTokenCollision = jest.fn();
  checkTileTokenCollision.mockReturnValue(false);

  const mockCollision = {
    checkTileTokenCollision,
  };

  const triggeringHandler = new TriggeringHandler(mockCollision, {}, {});
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
  const result = await triggeringHandler.handleTileTriggering([tile], {}, initPos, viewedScene);
  expect(result).toBeFalsy();
  expect(checkTileTokenCollision).toHaveBeenCalled();
});

it('can determine a tile has been triggered', async () => {
  const mockCollision = {};
  mockCollision.checkTileTokenCollision = jest.fn().mockReturnValue(true);

  const mockGameChanger = {};
  mockGameChanger.execute = jest.fn();
  mockGameChanger.pan = jest.fn();

  const mockTokenAnimationWatcher = {};
  mockTokenAnimationWatcher.watchForCompletion = jest.fn();

  const triggeringHandler = new TriggeringHandler(
    mockCollision,
    mockGameChanger,
    mockTokenAnimationWatcher,
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

  const result = await triggeringHandler.handleTileTriggering([tile], tokenDoc, initPos, viewedScene);

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

  expect(result).toBeTruthy();
});
