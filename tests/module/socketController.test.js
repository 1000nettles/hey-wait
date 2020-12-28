import SocketController from 'module/socketController';

/* eslint-disable no-console */

let mockSocket;
let mockUser;
let mockGameChanger;
let mockAnimationCoordinator;
let mockEntityFinder;
let socketController;
let mockToken;

beforeEach(() => {
  mockSocket = {};
  mockUser = {};
  mockGameChanger = {};
  mockAnimationCoordinator = {};
  mockEntityFinder = {};

  mockAnimationCoordinator.handleTokenAnimationAfterUpdate = jest.fn();

  mockToken = {
    _id: 'an_id',
    x: 1,
    y: 2,
  };

  mockEntityFinder.findScene = jest.fn().mockReturnValue('a_scene');
  mockEntityFinder.findToken = jest.fn().mockReturnValue(mockToken);

  socketController = new SocketController(
    mockSocket,
    mockUser,
    mockGameChanger,
    mockAnimationCoordinator,
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
  expect(mockAnimationCoordinator.handleTokenAnimationAfterUpdate).toHaveBeenCalledWith(
    'a_scene',
    mockToken,
  );
});

it('should initialize the socket listener and throw and error when executing on game changer', async () => {
  mockSocket.on = jest.fn((...args) => {
    const callbackData = {
      tokenId: 'a_token_id',
      tileId: 'a_tile_id',
      sceneId: 'a_scene_id',
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
