import SocketController from 'module/socketController';
import Constants from 'module/constants';

let mockSocket;
let mockGame;
let mockUser;
let mockCanvas;
let mockTriggering;
let socketController;

beforeEach(() => {
  mockSocket = {};
  mockUser = {};
  mockCanvas = {
    stage: {
      scale: {
        x: 1,
      },
    },
  };

  socketController = new SocketController(mockSocket, mockGame, mockUser, mockCanvas, mockTriggering);
});

it('should initialize the socket listener and listen and not show in scene', async () => {
  mockUser.viewedScene = 'not_a_viewed_scene';
  let socketOnArgs;

  mockSocket.on = jest.fn((...args) => {
    socketOnArgs = args;
    const callbackData = {
      x: 1,
      y: 1,
      tileId: 'a_tile_id',
      sceneId: 'a_scene_id',
    };

    // This is the callback function for `socket.on`. Let's call it to
    // validate what happens.
    args[1](callbackData);
  });

  await socketController.init();

  mockCanvas.animatePan = jest.fn();
  expect(mockCanvas.animatePan).not.toHaveBeenCalled();
  expect(socketOnArgs[0]).toEqual('module.hey-wait');
});

it('should listen and should animate pan in the current scene', async () => {
  let socketOnArgs;
  const x = 1;
  const y = 1;

  mockUser.viewedScene = 'a_scene_id';
  mockUser.isGM = false;

  mockSocket.on = jest.fn((...args) => {
    socketOnArgs = args;
    const callbackData = {
      x,
      y,
      tileId: 'a_tile_id',
      sceneId: 'a_scene_id',
    };

    // This is the callback function for `socket.on`. Let's call it to
    // validate what happens.
    args[1](callbackData);
  });

  mockCanvas.animatePan = jest.fn();
  await socketController.init();

  // Ensure that we are adding the combat number with the correct passing of
  // data.
  expect(mockCanvas.animatePan).toHaveBeenCalledTimes(1);
  expect(mockCanvas.animatePan).toHaveBeenCalledWith({x, y, scale: 1, duration: Constants.CANVAS_PAN_DURATION });
  expect(socketOnArgs[0]).toEqual('module.hey-wait');
});

it('should deactivate the socket listener', async () => {
  mockSocket.off = jest.fn();

  await socketController.deactivate();

  expect(mockSocket.off).toHaveBeenCalledTimes(1);
  expect(mockSocket.off).toHaveBeenCalledWith('module.hey-wait');
});
