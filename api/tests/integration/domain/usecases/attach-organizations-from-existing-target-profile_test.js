import { expect, sinon, databaseBuilder, knex, catchErr } from '../../../test-helper.js';
import { NoOrganizationToAttach } from '../../../../lib/domain/errors.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { attachOrganizationsFromExistingTargetProfile } from '../../../../lib/domain/usecases/attach-organizations-from-existing-target-profile.js';
import * as organizationsToAttachToTargetProfileRepository from '../../../../lib/infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import * as targetProfileRepository from '../../../../lib/infrastructure/repositories/target-profile-repository.js';
import { skillDatasource } from '../../../../lib/infrastructure/datasources/learning-content/skill-datasource.js';

describe('Integration | UseCase | attach-organizations-from-existing-target-profile', function () {
  beforeEach(function () {
    sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([]);
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
