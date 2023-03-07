const { expect, sinon, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const { NoOrganizationToAttach, NotFoundError } = require('../../../../lib/domain/errors');
const attachOrganizationsFromExistingTargetProfile = require('../../../../lib/domain/usecases/attach-organizations-from-existing-target-profile');
const organizationsToAttachToTargetProfileRepository = require('../../../../lib/infrastructure/repositories/organizations-to-attach-to-target-profile-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const { skillDatasource } = require('../../../../lib/infrastructure/datasources/learning-content/skill-datasource');

describe('Integration | UseCase | attach-organizations-from-existing-target-profile', function () {
  beforeEach(function () {
    sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([]);
  });
  afterEach(function () {
    return knex('target-profile-shares').delete();
  });

  describe('#attachOrganizationsFromExistingTargetProfile', function () {
    it('attaches organizations to target profile with given existing target profile', async function () {
      const existingTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const organizationId1 = databaseBuilder.factory.buildOrganization().id;
      const organizationId2 = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfileShare({
        targetProfileId: existingTargetProfileId,
        organizationId: organizationId1,
      });
      databaseBuilder.factory.buildTargetProfileShare({
        targetProfileId: existingTargetProfileId,
        organizationId: organizationId2,
      });
      await databaseBuilder.commit();

      const expectedOrganizationIds = [organizationId1, organizationId2];

      await attachOrganizationsFromExistingTargetProfile({
        targetProfileId,
        existingTargetProfileId,
        organizationsToAttachToTargetProfileRepository,
        targetProfileRepository,
      });

      const rows = await knex('target-profile-shares').select('organizationId').where({ targetProfileId });
      const organizationIds = rows.map(({ organizationId }) => organizationId);

      expect(organizationIds).to.exactlyContain(expectedOrganizationIds);
    });

    it('throws error when no organizations to attach', async function () {
      const existingTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      await databaseBuilder.commit();

      const error = await catchErr(attachOrganizationsFromExistingTargetProfile)({
        targetProfileId,
        existingTargetProfileId,
        organizationsToAttachToTargetProfileRepository,
        targetProfileRepository,
      });

      expect(error).to.be.instanceOf(NoOrganizationToAttach);
    });

    it('throws error when new target profile does not exist', async function () {
      const existingTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: existingTargetProfileId, organizationId });
      await databaseBuilder.commit();

      const error = await catchErr(attachOrganizationsFromExistingTargetProfile)({
        targetProfileId: 999,
        existingTargetProfileId,
        organizationsToAttachToTargetProfileRepository,
        targetProfileRepository,
      });

      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('throws error when old target profile does not exist', async function () {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      await databaseBuilder.commit();

      const error = await catchErr(attachOrganizationsFromExistingTargetProfile)({
        targetProfileId,
        existingTargetProfileId: 999,
        organizationsToAttachToTargetProfileRepository,
        targetProfileRepository,
      });

      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
