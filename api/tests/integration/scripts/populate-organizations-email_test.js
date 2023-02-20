import { expect, databaseBuilder, knex, sinon } from '../../test-helper';
import populateOrganizations from '../../../scripts/populate-organizations-email';

describe('Integration | Scripts | populate-organizations-email.js', function () {
  describe('#populateOrganizations', function () {
    const externalId1 = 'uai1';
    const externalId2 = 'uai2';

    beforeEach(async function () {
      databaseBuilder.factory.buildOrganization({ externalId: externalId1, email: 'first.last@example.net' });
      databaseBuilder.factory.buildOrganization({ externalId: externalId2 });

      sinon.stub(console, 'error');

      await databaseBuilder.commit();
    });

    it("should populate organization's email", async function () {
      // given
      const csvData = [
        { uai: 'uai1', email: 'uai1@example.net' },
        { uai: 'uai2', email: 'uai2@example.net' },
        { uai: 'unknown', email: 'unknown@example.net' },
      ];

      // when
      await populateOrganizations(csvData);

      // then
      const organizations = await knex('organizations').select('externalId as uai', 'email');
      expect(organizations).to.deep.include(csvData[0]);
      expect(organizations).to.deep.include(csvData[1]);
      expect(organizations).to.not.deep.include(csvData[2]);
      // eslint-disable-next-line no-console
      expect(console.error).to.have.been.calledWith('Organization not found for External ID unknown');
    });
  });
});
