import SocketController from 'module/socketController';

let mockSocket;
let mockUser;
let mockGameChanger;
let socketController;

beforeEach(() => {
  mockSocket = {};
  mockUser = {};
  mockGameChanger = {};

  socketController = new SocketController(mockSocket, mockUser, mockGameChanger);
});

it('should initialize the socket listener and listen', async () => {
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

  mockGameChanger.execute = jest.fn();

  await socketController.init();

  expect(socketOnArgs[0]).toEqual('module.hey-wait');
  expect(mockGameChanger.execute).toHaveBeenCalledWith(
    'a_tile_id',
    { x: 1, y: 1 },
    'a_scene_id',
  );
});

it('should initialize the socket listener and throw and error when executing on game changer', async () => {
  mockSocket.on = jest.fn((...args) => {
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
