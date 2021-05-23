import TileAuditor from 'module/TileAuditor';
import Constants from 'module/Constants';

it('can determine it is not a hey wait tile by an absent flag', () => {
  const auditor = new TileAuditor();
  const tile = {
    data: {
      _id: 'an_id',
    },
  };
  const result = auditor.isHeyWaitTile(tile);
  expect(result).toBeFalsy();
});

it('can determine it is not a hey wait tile by flag that shows it as being not enabled', () => {
  const auditor = new TileAuditor();
  const tile = {
    data: {
      _id: 'an_id',
      flags: {
        'hey-wait': {
          enabled: false,
        },
      },
    },
  };
  const result = auditor.isHeyWaitTile(tile);
  expect(result).toBeFalsy();
});

it('can determine it is not a hey wait tile by not providing the correct tool', () => {
  const auditor = new TileAuditor();
  const result = auditor.isHeyWaitTile({}, 'an_invalid_tool');
  expect(result).toBeFalsy();
});

it('can determine it is a hey wait tile by the flag', () => {
  const auditor = new TileAuditor();
  const tile = {
    data: {
      _id: 'an_id',
      flags: {
        'hey-wait': {
          enabled: true,
        },
      },
    },
  };
  const result = auditor.isHeyWaitTile(tile);
  expect(result).toBeTruthy();
});

it('can determine it is a hey wait tile by the current tool', () => {
  const auditor = new TileAuditor();

  const result = auditor.isHeyWaitTile({}, Constants.TOOLNAME);
  expect(result).toBeTruthy();
});
