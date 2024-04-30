import _ from 'lodash';

import * as organizationsToAttachToTargetProfileRepository from '../../../../../../src/prescription/target-profile/infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | Organizations-to-attach-to-target-profile', function () {
  describe('#addTargetProfilesToOrganization', function () {
    let organizationId;
    let targetProfileIdA;
    let targetProfileIdB;
    let targetProfileIdC;

    beforeEach(function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      targetProfileIdA = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileIdB = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileIdC = databaseBuilder.factory.buildTargetProfile().id;
      return databaseBuilder.commit();
    });

    it('should save all the target profile shares for the organization', async function () {
      // given
      const targetProfileIdList = [targetProfileIdA, targetProfileIdB, targetProfileIdC];

      // when
      await organizationsToAttachToTargetProfileRepository.addTargetProfilesToOrganization({
        organizationId,
        targetProfileIdList,
      });

      // then
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId });
      expect(targetProfileShares).to.have.lengthOf(3);
      expect(_.map(targetProfileShares, 'targetProfileId')).exactlyContain([
        targetProfileIdA,
        targetProfileIdB,
        targetProfileIdC,
      ]);
    });

    it('should not create another target profile share nor throw an error when it already exists', async function () {
      // given
      databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId: targetProfileIdA });
      const targetProfileIdList = [targetProfileIdA, targetProfileIdB, targetProfileIdC];

      // when
      await organizationsToAttachToTargetProfileRepository.addTargetProfilesToOrganization({
        organizationId,
        targetProfileIdList,
      });

      // then
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId });
      expect(targetProfileShares).to.have.lengthOf(3);
      expect(_.map(targetProfileShares, 'targetProfileId')).to.have.members([
        targetProfileIdA,
        targetProfileIdB,
        targetProfileIdC,
      ]);
    });

    it('should not erase old target profil share', async function () {
      // given
      databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId: targetProfileIdA });
      await databaseBuilder.commit();
      const targetProfileIdList = [targetProfileIdB, targetProfileIdC];

      // when
      await organizationsToAttachToTargetProfileRepository.addTargetProfilesToOrganization({
        organizationId,
        targetProfileIdList,
      });

      // then
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId });
      expect(targetProfileShares).to.have.lengthOf(3);
      expect(_.map(targetProfileShares, 'targetProfileId')).exactlyContain([
        targetProfileIdA,
        targetProfileIdB,
        targetProfileIdC,
      ]);
    });
  });

  describe('#attachOrganizations', function () {
    it('should return attachedIds', async function () {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();

      await databaseBuilder.commit();

      const targetProfileOrganizations = domainBuilder.buildOrganizationsToAttachToTargetProfile({
        id: targetProfileId,
      });

      targetProfileOrganizations.attach([organization1.id, organization2.id]);

      const results =
        await organizationsToAttachToTargetProfileRepository.attachOrganizations(targetProfileOrganizations);

      expect(results).to.deep.equal({ duplicatedIds: [], attachedIds: [organization1.id, organization2.id] });
    });

    it('add organization to the target profile', async function () {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();

      await databaseBuilder.commit();

      const targetProfileOrganizations = domainBuilder.buildOrganizationsToAttachToTargetProfile({
        id: targetProfileId,
      });

      targetProfileOrganizations.attach([organization1.id, organization2.id]);

      await organizationsToAttachToTargetProfileRepository.attachOrganizations(targetProfileOrganizations);

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId: targetProfileOrganizations.id });
      const organizationIds = rows.map(({ organizationId }) => organizationId);

      expect(organizationIds).to.exactlyContain([organization1.id, organization2.id]);
    });

    context('when the organization does not exist', function () {
      it('throws an error', async function () {
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const unknownOrganizationId = 99999;

        await databaseBuilder.commit();

        const targetProfileOrganizations = domainBuilder.buildOrganizationsToAttachToTargetProfile({
          id: targetProfileId,
        });

        targetProfileOrganizations.attach([unknownOrganizationId, organizationId]);

        const error = await catchErr(organizationsToAttachToTargetProfileRepository.attachOrganizations)(
          targetProfileOrganizations,
        );

        expect(error).to.be.an.instanceOf(NotFoundError);
        expect(error.message).to.have.string(`L'organization avec l'id ${unknownOrganizationId} n'existe pas`);
      });
    });

    context('when the organization is already attached', function () {
      it('should return inserted organizationId', async function () {
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const firstOrganization = databaseBuilder.factory.buildOrganization();
        const secondOrganization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildTargetProfileShare({
          targetProfileId: targetProfileId,
          organizationId: firstOrganization.id,
        });

        await databaseBuilder.commit();

        const targetProfileOrganizations = domainBuilder.buildOrganizationsToAttachToTargetProfile({
          id: targetProfileId,
        });

        targetProfileOrganizations.attach([firstOrganization.id, secondOrganization.id]);

        const result =
          await organizationsToAttachToTargetProfileRepository.attachOrganizations(targetProfileOrganizations);

        expect(result).to.deep.equal({ duplicatedIds: [firstOrganization.id], attachedIds: [secondOrganization.id] });
      });
    });
  });
});
