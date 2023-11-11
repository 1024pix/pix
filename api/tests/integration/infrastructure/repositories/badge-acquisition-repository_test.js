import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import _ from 'lodash';
import * as badgeAcquisitionRepository from '../../../../lib/infrastructure/repositories/badge-acquisition-repository.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';

describe('Integration | Repository | Badge Acquisition', function () {
  describe('#createOrUpdate', function () {
    let badgeAcquisitionToCreate;

    beforeEach(async function () {
      const badgeId = databaseBuilder.factory.buildBadge({ key: 'éclair_au_chocolat' }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId }).id;

      badgeAcquisitionToCreate = {
        userId,
        badgeId,
        campaignParticipationId,
      };
      await databaseBuilder.commit();
    });

    it('should persist the badge acquisition in db', async function () {
      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        return badgeAcquisitionRepository.createOrUpdate({
          badgeAcquisitionsToCreate: [badgeAcquisitionToCreate],
          domainTransaction,
        });
      });

      // then
      const result = await knex('badge-acquisitions')
        .where('userId', badgeAcquisitionToCreate.userId)
        .andWhere('badgeId', badgeAcquisitionToCreate.badgeId)
        .andWhere('campaignParticipationId', badgeAcquisitionToCreate.campaignParticipationId);
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.contains(badgeAcquisitionToCreate);
      expect(result[0].createdAt).to.deep.equal(result[0].updatedAt);
    });

    it('should update the badge acquisition in the DB if it already exists', async function () {
      // given
      databaseBuilder.factory.buildBadgeAcquisition(badgeAcquisitionToCreate);
      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        return badgeAcquisitionRepository.createOrUpdate({
          badgeAcquisitionToCreate: [badgeAcquisitionToCreate],
          domainTransaction,
        });
      });

      // then
      const result = await knex('badge-acquisitions')
        .where('userId', badgeAcquisitionToCreate.userId)
        .andWhere('badgeId', badgeAcquisitionToCreate.badgeId)
        .andWhere('campaignParticipationId', badgeAcquisitionToCreate.campaignParticipationId);
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.contains(badgeAcquisitionToCreate);
      expect(result[0].createdAt).to.not.equal(result[0].updatedAt);
    });

    context('when no domainTransaction is passed in parameters', function () {
      it('should use knex instead to persist the badge acquisition', async function () {
        // when
        await badgeAcquisitionRepository.createOrUpdate({
          badgeAcquisitionsToCreate: [badgeAcquisitionToCreate],
        });

        // then
        const result = await knex('badge-acquisitions')
          .where('userId', badgeAcquisitionToCreate.userId)
          .andWhere('badgeId', badgeAcquisitionToCreate.badgeId)
          .andWhere('campaignParticipationId', badgeAcquisitionToCreate.campaignParticipationId);
        expect(result).to.have.lengthOf(1);
        expect(result[0]).to.contains(badgeAcquisitionToCreate);
      });
    });
  });

  describe('#getAcquiredBadgeIds', function () {
    let userId;
    let badgeId;

    beforeEach(async function () {
      badgeId = databaseBuilder.factory.buildBadge({ key: 'beignet_a_la_creme' }).id;
      userId = databaseBuilder.factory.buildUser().id;

      databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
      await databaseBuilder.commit();
    });

    it('should check that the user has acquired the badge', async function () {
      // when
      const acquiredBadgeIds = await DomainTransaction.execute(async (domainTransaction) => {
        return badgeAcquisitionRepository.getAcquiredBadgeIds({
          userId,
          badgeIds: [badgeId],
          domainTransaction,
        });
      });

      // then
      expect(acquiredBadgeIds).to.deep.equal([badgeId]);
    });

    it('should check that the user has not acquired the badge', async function () {
      // when
      const acquiredBadgeIds = await DomainTransaction.execute(async (domainTransaction) => {
        return badgeAcquisitionRepository.getAcquiredBadgeIds({ userId, badgeIds: [-1], domainTransaction });
      });

      // then
      expect(acquiredBadgeIds.length).to.equal(0);
    });

    context('when no domainTransaction is passed in parameters', function () {
      it('should use knex instead to return acquired badges', async function () {
        // when
        const acquiredBadgesIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({
          userId,
          badgeIds: [badgeId],
        });

        // then
        expect(acquiredBadgesIds).to.deep.equal([badgeId]);
      });
    });
  });

  describe('#getAcquiredBadgesByCampaignParticipations', function () {
    context('when there is just one campaignParticipionId', function () {
      let campaign;
      let user1;
      let badge1;
      let badge2;
      let campaignParticipationId;

      beforeEach(async function () {
        user1 = databaseBuilder.factory.buildUser();
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          userId: user1.id,
          campaignId: campaign.id,
        }).id;
        badge1 = databaseBuilder.factory.buildBadge({ key: 'badge1', targetProfileId: targetProfile.id });
        badge2 = databaseBuilder.factory.buildBadge({ key: 'badge2', targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildBadge({ key: 'badge3', targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          campaignParticipationId,
          userId: user1.id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge2.id,
          campaignParticipationId,
          userId: user1.id,
        });

        await databaseBuilder.commit();
      });

      it('should return badge ids acquired by user for a campaignParticipation', async function () {
        // when
        const acquiredBadgesByCampaignParticipations = await DomainTransaction.execute(async (domainTransaction) => {
          return badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
            campaignParticipationsIds: [campaignParticipationId],
            domainTransaction,
          });
        });

        // then
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId][0]).to.includes(badge1);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId][1]).to.includes(badge2);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId].length).to.eq(2);
      });

      context('when no domainTransaction is passed in parameters', function () {
        it('should use knex instead to return badge ids acquired by user for a campaignParticipation', async function () {
          // when
          const acquiredBadgesByCampaignParticipations =
            await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
              campaignParticipationsIds: [campaignParticipationId],
            });

          // then
          expect(acquiredBadgesByCampaignParticipations[campaignParticipationId].length).to.equal(2);
        });
      });
    });

    context('when there are several campaignParticipationsIds', function () {
      let campaign;
      let user1;
      let user2;
      let badge1;
      let badge2;
      let badge3;
      let campaignParticipationId1;
      let campaignParticipationId2;

      beforeEach(async function () {
        user1 = databaseBuilder.factory.buildUser();
        user2 = databaseBuilder.factory.buildUser();
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        campaignParticipationId1 = databaseBuilder.factory.buildCampaignParticipation({
          userId: user1.id,
          campaignId: campaign.id,
        }).id;
        campaignParticipationId2 = databaseBuilder.factory.buildCampaignParticipation({
          userId: user2.id,
          campaignId: campaign.id,
        }).id;
        badge1 = databaseBuilder.factory.buildBadge({ key: 'badge1', targetProfileId: targetProfile.id });
        badge2 = databaseBuilder.factory.buildBadge({ key: 'badge2', targetProfileId: targetProfile.id });
        badge3 = databaseBuilder.factory.buildBadge({ key: 'badge3', targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          campaignParticipationId: campaignParticipationId2,
          userId: user2.id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge2.id,
          campaignParticipationId: campaignParticipationId1,
          userId: user1.id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge3.id,
          campaignParticipationId: campaignParticipationId2,
          userId: user2.id,
        });

        await databaseBuilder.commit();
      });

      it('should return badge ids acquired by user for a campaignParticipation', async function () {
        // when
        const campaignParticipationsIds = [campaignParticipationId1, campaignParticipationId2];
        const acquiredBadgesByCampaignParticipations = await DomainTransaction.execute(async (domainTransaction) => {
          return badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
            campaignParticipationsIds,
            domainTransaction,
          });
        });
        // then
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId2][0]).to.includes(badge1);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId2][1]).to.includes(badge3);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId2].length).to.eq(2);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId1][0]).to.includes(badge2);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId1].length).to.eq(1);
      });
    });

    context('when the participant already has a badge and improve the assessment 4 days later', function () {
      let campaignId;
      let userId;
      let badge1;
      let badge2;
      let campaignParticipationId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id }).id;
        badge1 = databaseBuilder.factory.buildBadge({ key: 'badge1', targetProfileId: targetProfile.id });
        badge2 = databaseBuilder.factory.buildBadge({ key: 'badge2', targetProfileId: targetProfile.id });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId }).id;

        databaseBuilder.factory.buildAssessment({
          userId,
          campaignParticipationId,
          createdAt: new Date('2021-05-01'),
          isImproving: true,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          campaignParticipationId,
          userId,
          createdAt: new Date('2021-05-01'),
        });

        databaseBuilder.factory.buildAssessment({
          userId,
          campaignParticipationId,
          createdAt: new Date('2021-05-05'),
          isImproving: false,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge1.id,
          campaignParticipationId,
          userId,
          createdAt: new Date('2021-05-05'),
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badge2.id,
          campaignParticipationId,
          userId,
          createdAt: new Date('2021-05-05'),
        });

        await databaseBuilder.commit();
      });

      it('should return badge ids acquired by user for a campaignParticipation', async function () {
        // when
        const campaignParticipationsIds = [campaignParticipationId];
        const acquiredBadgesByCampaignParticipations = await DomainTransaction.execute(async (domainTransaction) => {
          return badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
            campaignParticipationsIds,
            domainTransaction,
          });
        });

        // then
        expect(_.map(acquiredBadgesByCampaignParticipations[campaignParticipationId], 'id')).to.deep.equal([
          badge1.id,
          badge2.id,
        ]);
      });
    });
  });
});
