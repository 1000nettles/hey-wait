import SocketController from 'module/SocketController';
import Animator from 'module/Animator';

/* eslint-disable no-console */

let mockSocket;
let mockUser;
let mockGameChanger;
let mockReactionCoordinator;
let mockEntityFinder;
let mockUserOperations;
let mockMacroOperations;
let socketController;
let mockToken;
let mockTokenDoc;
let mockTileData;

const onCallbackData = {
  tokenId: 'a_token_id',
  tileId: 'a_tile_id',
  sceneId: 'a_scene_id',
  pos: { x: 1, y: 2 },
  animType: Animator.animationTypes.TYPE_QUESTION,
};

beforeEach(() => {
  mockSocket = {};
  mockUser = {};
  mockGameChanger = {};
  mockReactionCoordinator = {};
  mockEntityFinder = {};
  mockUserOperations = {};
  mockMacroOperations = {};

  mockGameChanger.pan = jest.fn();

  mockReactionCoordinator.handleTokenReaction = jest.fn();

  mockToken = {
    x: 1,
    y: 2,
  };
  mockTokenDoc = {
    id: 'a_token_id',
    object: mockToken,
  };

  mockTileData = {
    id: 'a_tile_id',
    flags: {
      'hey-wait': {
        animType: 2,
      },
    },
  };

  mockEntityFinder.findScene = jest.fn().mockReturnValue('a_scene');
  mockEntityFinder.findTokenDocument = jest.fn().mockReturnValue(mockTokenDoc);
  mockEntityFinder.findTileData = jest.fn().mockReturnValue(mockTileData);

  mockUserOperations.canChangeGameForUser = jest.fn().mockReturnValue(true);
  mockMacroOperations.handleTileMacroFiring = jest.fn();

  socketController = new SocketController(
    mockSocket,
    mockUser,
    mockGameChanger,
    mockReactionCoordinator,
    mockEntityFinder,
    mockUserOperations,
    mockMacroOperations,
  );
});

it('should initialize the socket listener, listen, and exit early if we cannot change scene for current user', async () => {
  let socketOnArgs;

  mockUserOperations.canChangeGameForUser = jest.fn().mockReturnValue(false);

  mockSocket.on = jest.fn((...args) => {
    socketOnArgs = args;

    // This is the callback function for `socket.on`. Let's call it to
    // validate what happens.
    args[1](onCallbackData);
  });

  mockGameChanger.execute = jest.fn();

  await socketController.init();

  expect(socketOnArgs[0]).toEqual('module.hey-wait');
  expect(mockGameChanger.execute).not.toHaveBeenCalled();
  expect(mockReactionCoordinator.handleTokenReaction).not.toHaveBeenCalled();
  expect(mockMacroOperations.handleTileMacroFiring).not.toHaveBeenCalled();
  expect(mockGameChanger.pan).not.toHaveBeenCalled();
});

it('should initialize the socket listener, listen, and handle all game changing', async () => {
  let socketOnArgs;

  mockSocket.on = jest.fn((...args) => {
    socketOnArgs = args;

    // This is the callback function for `socket.on`. Let's call it to
    // validate what happens.
    args[1](onCallbackData);
  });

  mockGameChanger.execute = jest.fn();

  await socketController.init();

  expect(socketOnArgs[0]).toEqual('module.hey-wait');
  expect(mockGameChanger.execute).toHaveBeenCalledWith(
    'a_tile_id',
    { x: 1, y: 2 },
    'a_scene_id',
  );
  expect(mockReactionCoordinator.handleTokenReaction).toHaveBeenCalledWith(
    'a_scene',
    mockToken,
    Animator.animationTypes.TYPE_QUESTION,
  );
  expect(mockGameChanger.pan).toHaveBeenCalledWith(
    { x: 1, y: 2 },
  );
  expect(mockMacroOperations.handleTileMacroFiring).toHaveBeenCalledWith(
    'a_tile_id',
    mockTokenDoc,
  );
});

it('should initialize the socket listener and throw an error when executing on game changer', async () => {
  mockSocket.on = jest.fn((...args) => {
    const callbackData = {
      tokenId: 'a_token_id',
      tileId: 'a_tile_id',
      sceneId: 'a_scene_id',
      pos: { x: 1, y: 2 },
      animType: Animator.animationTypes.TYPE_QUESTION,
    };

    // This is the callback function for `socket.on`. Let's call it to
    // validate what happens.
    args[1](callbackData);
  });

  mockGameChanger.execute = () => {
    throw new Error('an_error');
  };
  console.error = jest.fn();

  await socketController.init();

  expect(console.error).toHaveBeenCalledWith('hey-wait | Error: an_error');
});

it('should deactivate the socket listener', async () => {
  mockSocket.off = jest.fn();

  await socketController.deactivate();

  expect(mockSocket.off).toHaveBeenCalledTimes(1);
  expect(mockSocket.off).toHaveBeenCalledWith('module.hey-wait');
});
