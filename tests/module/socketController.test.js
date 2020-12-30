import SocketController from 'module/socketController';
import Animator from '../../src/module/animator';

/* eslint-disable no-console */

let mockSocket;
let mockUser;
let mockGameChanger;
let mockReactionCoordinator;
let mockEntityFinder;
let socketController;
let mockTokenData;
let mockTileData;

beforeEach(() => {
  mockSocket = {};
  mockUser = {};
  mockGameChanger = {};
  mockReactionCoordinator = {};
  mockEntityFinder = {};

  mockGameChanger.pan = jest.fn();

  mockReactionCoordinator.handleTokenReaction = jest.fn();

  mockTokenData = {
    _id: 'a_token_id',
    x: 1,
    y: 2,
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
  mockEntityFinder.findTokenData = jest.fn().mockReturnValue(mockTokenData);
  mockEntityFinder.findTileData = jest.fn().mockReturnValue(mockTileData);

  socketController = new SocketController(
    mockSocket,
    mockUser,
    mockGameChanger,
    mockReactionCoordinator,
    mockEntityFinder,
  );
});

it('should initialize the socket listener and listen', async () => {
  let socketOnArgs;

  mockSocket.on = jest.fn((...args) => {
    socketOnArgs = args;
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
    mockTokenData,
    Animator.animationTypes.TYPE_QUESTION,
  );
  expect(mockGameChanger.pan).toHaveBeenCalledWith(
    { x: 1, y: 2 },
  );
});

it('should initialize the socket listener and throw and error when executing on game changer', async () => {
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
