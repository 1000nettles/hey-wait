import UserOperations from 'module/userOperations';

it('should be allowed to change game for user if GM', () => {
  const mockUser = {
    isGM: true,
  };

  const userOperations = new UserOperations(mockUser, {});
  const result = userOperations.canChangeGameForUser('a_scene_id');

  expect(result).toBeTruthy();
});

it('should be allowed to change game for user if provided sceneId is current scene', () => {
  const sceneId = 'a_scene_id';

  const mockUser = {
    isGM: false,
    viewedScene: sceneId,
  };

  const userOperations = new UserOperations(mockUser, {});
  const result = userOperations.canChangeGameForUser(sceneId);

  expect(result).toBeTruthy();
});

it('should be allowed to change game for user if allowed to warp players and current scene does not match', () => {
  const mockUser = {
    isGM: false,
    viewedScene: 'a_different_scene_id',
  };
  const mockSettings = {
    get: jest.fn().mockReturnValue(true),
  };

  const userOperations = new UserOperations(mockUser, mockSettings);
  const result = userOperations.canChangeGameForUser('a_scene_id');

  expect(result).toBeTruthy();
});

it('should NOT be allowed to change game for user if NOT allowed to warp players and current scene does not match', () => {
  const mockUser = {
    isGM: false,
    viewedScene: 'a_different_scene_id',
  };
  const mockSettings = {
    get: jest.fn().mockReturnValue(false),
  };

  const userOperations = new UserOperations(mockUser, mockSettings);
  const result = userOperations.canChangeGameForUser('a_scene_id');

  expect(result).toBeFalsy();
});
