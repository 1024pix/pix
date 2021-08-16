const { expect, sinon, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const { NoOrganizationToAttach, NotFoundError } = require('../../../../lib/domain/errors');
const attachOrganizationsFromExistingTargetProfile = require('../../../../lib/domain/usecases/attach-organizations-from-existing-target-profile');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const skillDatasource = require('../../../../lib/infrastructure/datasources/learning-content/skill-datasource');

describe('Integration | UseCase | attach-organizations-from-existing-target-profile', () => {
  beforeEach(() => {
    sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([]);
  });
  afterEach(() => {
    return knex('target-profile-shares').delete();
  });

  describe('#attachOrganizationsFromExistingTargetProfile', () => {
    it('attaches organizations to target profile with given existing target profile', async () => {
      const existingTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const organizationId1 = databaseBuilder.factory.buildOrganization().id;
      const organizationId2 = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: existingTargetProfileId, organizationId: organizationId1 });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: existingTargetProfileId, organizationId: organizationId2 });
      await databaseBuilder.commit();

      const expectedOrganizationIds = [organizationId1, organizationId2];

      await attachOrganizationsFromExistingTargetProfile({
        targetProfileId,
        existingTargetProfileId,
        targetProfileRepository,
      });

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId });
      const organizationIds = rows.map(({ organizationId }) => organizationId);

      expect(organizationIds).to.exactlyContain(expectedOrganizationIds);
    });

    it('throws error when no organizations to attach', async () => {
      const existingTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      await databaseBuilder.commit();

      const error = await catchErr(attachOrganizationsFromExistingTargetProfile)({
        targetProfileId,
        existingTargetProfileId,
        targetProfileRepository,
      });

      expect(error).to.be.instanceOf(NoOrganizationToAttach);
    });

    it('throws error when new target profile does not exist', async () => {
      const existingTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: existingTargetProfileId, organizationId });
      await databaseBuilder.commit();

      const error = await catchErr(attachOrganizationsFromExistingTargetProfile)({
        targetProfileId: 999,
        existingTargetProfileId,
        targetProfileRepository,
      });

      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('throws error when old target profile does not exist', async () => {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      await databaseBuilder.commit();

      const error = await catchErr(attachOrganizationsFromExistingTargetProfile)({
        targetProfileId,
        existingTargetProfileId: 999,
        targetProfileRepository,
      });

      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
