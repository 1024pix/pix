import { expect, databaseBuilder } from '../../../../test-helper.js';
import { knex } from '../../../../../db/knex-database-connection.js';
import * as targetProfileRepository from '../../../../../lib/infrastructure/repositories/target-profile-management/target-profile-repository.js';

describe('Integration | Repository | Target Profile Management | Target Profile ', function () {
  describe('#update', function () {
    it('Detach a target profile from an organization', async function () {
      // given
      const organizationIdToDetach = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: organizationIdToDetach });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: otherOrganizationId });

      await databaseBuilder.commit();

      const targetProfile = {
        id: targetProfileId,
        organizationIdsToDetach: [organizationIdToDetach],
      };

      // when
      await targetProfileRepository.update(targetProfile);

      // then
      const result = await knex
        .select('organizationId')
        .from('target-profile-shares')
        .where('targetProfileId', targetProfile.id);

      expect(result.length).to.equal(1);
      expect(result).to.not.deep.include({ organizationId: targetProfile.organizationIdsToDetach[0] });
    });

    it('Detach a target profile from several organizations', async function () {
      // given

      const firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const secondOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: firstOrganizationId });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: secondOrganizationId });

      await databaseBuilder.commit();

      const targetProfile = {
        id: targetProfileId,
        organizationIdsToDetach: [firstOrganizationId, secondOrganizationId],
      };

      // when
      await targetProfileRepository.update(targetProfile);

      // then
      const result = await knex
        .select('organizationId')
        .from('target-profile-shares')
        .where('targetProfileId', targetProfile.id);

      expect(result.length).to.equal(0);
    });

    it('should return detached organization ids', async function () {
      // given

      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: organizationId });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: otherOrganizationId });

      await databaseBuilder.commit();

      const targetProfile = {
        id: targetProfileId,
        organizationIdsToDetach: [organizationId, otherOrganizationId],
      };

      // when
      const result = await targetProfileRepository.update(targetProfile);

      // then
      expect(result).to.deepEqualArray([organizationId, otherOrganizationId]);
    });
  });
});
