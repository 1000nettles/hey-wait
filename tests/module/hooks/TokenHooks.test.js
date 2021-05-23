import TokenHooks from 'module/hooks/TokenHooks';
import Constants from 'module/constants';

describe('token hooks tests', () => {
  global.CONST = {};
  global.CONST.TOKEN_DISPOSITIONS = {
    HOSTILE: -1,
    NEUTRAL: 0,
    FRIENDLY: 1,
  };

  it('determines that token update hook cannot be run because it is paused', () => {
    const tokenHooks = new TokenHooks({}, {});
    const result = tokenHooks.canRunTokenUpdate({}, 1, true);

    expect(result).toBeFalsy();
  });

  it('determines that token update hook cannot be run because it has no changed data', () => {
    const tokenHooks = new TokenHooks({}, {});
    const result = tokenHooks.canRunTokenUpdate({}, 1, false);

    expect(result).toBeFalsy();
  });

  it('determines that token update hook cannot be run because the user is the GM and not allowed', () => {
    const settings = {
      get: jest.fn().mockReturnValueOnce(true),
    };

    const user = {
      isGM: true,
    };

    const change = {
      x: 5,
    };

    const tokenHooks = new TokenHooks(user, settings);
    const result = tokenHooks.canRunTokenUpdate(change, 1, false);

    expect(settings.get).toHaveBeenCalledWith(Constants.MODULE_NAME, 'restrict-gm');
    expect(result).toBeFalsy();
  });

  it('determines that token update hook cannot be run because the user is the GM and not allowed', () => {
    const settings = {
      get: jest.fn().mockReturnValueOnce(true),
    };

    const user = {
      isGM: true,
    };

    const change = {
      x: 5,
    };

    const tokenHooks = new TokenHooks(user, settings);
    const result = tokenHooks.canRunTokenUpdate(change, 1, false);

    expect(settings.get).toHaveBeenCalledWith(Constants.MODULE_NAME, 'restrict-gm');
    expect(result).toBeFalsy();
  });

  const dispositionData = [
    {
      current: global.CONST.TOKEN_DISPOSITIONS.FRIENDLY,
      allowed: Constants.DISPOSITION_CHOICES.FRIENDLY,
      result: true,
    },
    {
      current: global.CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      allowed: Constants.DISPOSITION_CHOICES.FRIENDLY,
      result: false,
    },
    {
      current: global.CONST.TOKEN_DISPOSITIONS.HOSTILE,
      allowed: Constants.DISPOSITION_CHOICES.FRIENDLY,
      result: false,
    },
    {
      current: global.CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      allowed: Constants.DISPOSITION_CHOICES.FRIENDLY,
      result: false,
    },
    {
      current: global.CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      allowed: Constants.DISPOSITION_CHOICES.FRIENDLY_NETURAL,
      result: true,
    },
    {
      current: global.CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      allowed: Constants.DISPOSITION_CHOICES.FRIENDLY_NEUTRAL_HOSTILE,
      result: true,
    },
    {
      current: global.CONST.TOKEN_DISPOSITIONS.HOSTILE,
      allowed: Constants.DISPOSITION_CHOICES.FRIENDLY,
      result: false,
    },
    {
      current: global.CONST.TOKEN_DISPOSITIONS.HOSTILE,
      allowed: Constants.DISPOSITION_CHOICES.FRIENDLY_NETURAL,
      result: false,
    },
    {
      current: global.CONST.TOKEN_DISPOSITIONS.HOSTILE,
      allowed: Constants.DISPOSITION_CHOICES.FRIENDLY_NEUTRAL_HOSTILE,
      result: true,
    },
  ];
  describe.each(dispositionData)('Check dispositions', (dispositionDatum) => {
    it(`whose current disposition is ${dispositionDatum.current} and what's allowed is ${dispositionDatum.allowed}`, () => {
      const getFn = jest
        .fn()
        .mockImplementation((module, setting) => {
          if (setting === 'restrict-gm') {
            return false;
          }

          if (setting === 'disposition') {
            return dispositionDatum.allowed;
          }

          throw Error('No expected setting provided');
        });

      const settings = {
        get: getFn,
      };

      const user = {
        isGM: true,
      };

      const change = {
        x: 5,
      };

      const tokenHooks = new TokenHooks(user, settings);
      const result = tokenHooks.canRunTokenUpdate(change, dispositionDatum.current, false);

      expect(result).toBe(dispositionDatum.result);
    });
  });
});
