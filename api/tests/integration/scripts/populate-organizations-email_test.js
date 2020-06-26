const { expect, databaseBuilder, knex } = require('../../test-helper');

const populateOrganizations = require('../../../scripts/populate-organizations-email');

describe('Integration | Scripts | populate-organizations-email.js', () => {

  describe('#populateOrganizations', () => {

    const externalId1 = 'uai1';
    const externalId2 = 'uai2';

    beforeEach(async () => {
      databaseBuilder.factory.buildOrganization({ externalId: externalId1, email: 'first.last@example.net' });
      databaseBuilder.factory.buildOrganization({ externalId: externalId2 });

      await databaseBuilder.commit();
    });

    it('should populate organization\'s email', async () => {
      // given
      const csvData = [
        { uai: 'uai1', email: 'uai1@example.net' },
        { uai: 'uai2', email: 'uai2@example.net' },
      ];

      // when
      await populateOrganizations(csvData);

      // then
      const organizations = await knex('organizations').select('externalId as uai', 'email');
      expect(organizations).to.have.deep.members(csvData);
    });

  });
});
