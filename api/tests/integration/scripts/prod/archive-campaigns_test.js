const { expect, databaseBuilder, knex, sinon } = require('../../../test-helper');
const archiveCampaigns = require('../../../../scripts/prod/archive-campaigns');

describe('Script | Prod | Archive Campaign', function () {
  let clock;
  let now;

  beforeEach(function () {
    now = new Date('2022-01-01');
    clock = sinon.useFakeTimers(now);
  });
  afterEach(function () {
    clock.restore();
  });

  describe('#archiveCampaigns', function () {
    it('archives all given campaigns', async function () {
      const file = './tests/tooling/fixtures/campaigns-to-archive.csv';
      const logger = { setTotal: () => {}, log: () => {}, logCount: () => {} };
      databaseBuilder.factory.buildCampaign({ code: 'ABC123' });
      databaseBuilder.factory.buildCampaign({ code: 'ABC456' });
      databaseBuilder.factory.buildUser({ id: 1 });
      databaseBuilder.factory.buildUser({ id: 2 });
      await databaseBuilder.commit();

      await archiveCampaigns(file, logger);

      const rows = await knex('campaigns').select(['code', 'archivedAt', 'archivedBy']);
      expect(rows).to.exactlyContain([
        { code: 'ABC123', archivedAt: now, archivedBy: 1 },
        { code: 'ABC456', archivedAt: now, archivedBy: 2 },
      ]);
    });

    it('archives all archivable campaigns', async function () {
      const file = './tests/tooling/fixtures/campaigns-unarchivable.csv';
      const logger = { setTotal: () => {}, log: () => {}, logCount: () => {} };
      databaseBuilder.factory.buildCampaign({ code: 'ARCHIVABLE' });
      databaseBuilder.factory.buildCampaign({ code: 'UNARCHIVABLE' });
      databaseBuilder.factory.buildUser({ id: 1 });
      await databaseBuilder.commit();

      await archiveCampaigns(file, logger);

      const rows = await knex('campaigns').select(['code', 'archivedAt', 'archivedBy']);
      expect(rows).to.exactlyContain([
        { code: 'ARCHIVABLE', archivedAt: now, archivedBy: 1 },
        { code: 'UNARCHIVABLE', archivedAt: null, archivedBy: null },
      ]);
    });
  });
});
