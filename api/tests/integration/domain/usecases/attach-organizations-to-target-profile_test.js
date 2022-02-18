const { expect, sinon, databaseBuilder, knex } = require('../../../test-helper');
const attachOrganizationsToTargetProfile = require('../../../../lib/domain/usecases/attach-organizations-to-target-profile');
const targetProfileShareRepository = require('../../../../lib/infrastructure/repositories/target-profile-share-repository');
const skillDatasource = require('../../../../lib/infrastructure/datasources/learning-content/skill-datasource');

describe('Integration | UseCase | attach-organizations-to-target-profile', function () {
  beforeEach(function () {
    sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([]);
  });
  afterEach(function () {
    return knex('target-profile-shares').delete();
  });
  describe('#attachOrganizationsToTargetProfile', function () {
    it('attaches organization to target profile', async function () {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const organizationIds = [organization1.id, organization2.id];

      await attachOrganizationsToTargetProfile({
        targetProfileId: targetProfile.id,
        organizationIds,
        targetProfileShareRepository,
      });

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId: targetProfile.id });
      const organizationIdsWithTargetProfile = rows.map(({ organizationId }) => organizationId);

      expect(organizationIdsWithTargetProfile).to.exactlyContain(organizationIds);
    });
  });
});
