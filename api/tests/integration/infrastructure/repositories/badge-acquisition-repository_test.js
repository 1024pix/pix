const { expect, databaseBuilder, knex } = require('../../../test-helper');
const _ = require('lodash');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

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

    afterEach(async function () {
      await knex('badge-acquisitions').delete();
    });

    it('should persist the badge acquisition in db', async function () {
      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        return badgeAcquisitionRepository.createOrUpdate([badgeAcquisitionToCreate], domainTransaction);
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
        return badgeAcquisitionRepository.createOrUpdate([badgeAcquisitionToCreate], domainTransaction);
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
  });

  describe('#hasAcquiredBadge', function () {
    it('should return true when user has acquired badge', async function () {
      // given
      databaseBuilder.factory.buildUser({ id: 123 });
      databaseBuilder.factory.buildBadge({ id: 456, key: 'someKey' });
      databaseBuilder.factory.buildBadgeAcquisition({
        badgeId: 456,
        userId: 123,
      });
      await databaseBuilder.commit();

      // when
      const hasAcquiredBadge = await badgeAcquisitionRepository.hasAcquiredBadge({ badgeKey: 'someKey', userId: 123 });

      // then
      expect(hasAcquiredBadge).to.be.true;
    });

    it('should return false when user has not acquired badge', async function () {
      // given
      databaseBuilder.factory.buildUser({ id: 123 });
      databaseBuilder.factory.buildUser({ id: 789 });
      databaseBuilder.factory.buildBadge({ id: 456, key: 'someKey' });
      databaseBuilder.factory.buildBadgeAcquisition({
        badgeId: 456,
        userId: 789,
      });
      await databaseBuilder.commit();

      // when
      const hasAcquiredBadge = await badgeAcquisitionRepository.hasAcquiredBadge({ badgeKey: 'someKey', userId: 123 });

      // then
      expect(hasAcquiredBadge).to.be.false;
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
      const acquiredBadgeIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({ userId, badgeIds: [badgeId] });

      // then
      expect(acquiredBadgeIds).to.deep.equal([badgeId]);
    });

    it('should check that the user has not acquired the badge', async function () {
      // when
      const acquiredBadgeIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({ userId, badgeIds: [-1] });

      // then
      expect(acquiredBadgeIds.length).to.equal(0);
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
        const acquiredBadgesByCampaignParticipations =
          await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
            campaignParticipationsIds: [campaignParticipationId],
          });

        // then
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId][0]).to.includes(badge1);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId][1]).to.includes(badge2);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId].length).to.eq(2);
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
        const acquiredBadgesByCampaignParticipations =
          await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({ campaignParticipationsIds });

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
        const acquiredBadgesByCampaignParticipations =
          await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({ campaignParticipationsIds });

        // then
        expect(_.map(acquiredBadgesByCampaignParticipations[campaignParticipationId], 'id')).to.deep.equal([
          badge1.id,
          badge2.id,
        ]);
      });
    });
  });

  describe('#getCampaignAcquiredBadgesByUsers', function () {
    let campaign;
    let user1;
    let user2;
    let user3;
    let badge1;
    let badge2;

    beforeEach(async function () {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      badge1 = databaseBuilder.factory.buildBadge({ key: 'badge1', targetProfileId: targetProfile.id });
      badge2 = databaseBuilder.factory.buildBadge({ key: 'badge2', targetProfileId: targetProfile.id });
      user1 = databaseBuilder.factory.buildUser();
      user2 = databaseBuilder.factory.buildUser();
      user3 = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge1.id, userId: user1.id });
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge1.id, userId: user2.id });
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge2.id, userId: user2.id });
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge2.id, userId: user3.id });

      await databaseBuilder.commit();
    });

    it('should return badge ids acquired by user for a campaign', async function () {
      // when
      const acquiredBadgeIdsByUsers = await badgeAcquisitionRepository.getCampaignAcquiredBadgesByUsers({
        campaignId: campaign.id,
        userIds: [user1.id, user2.id],
      });

      // then
      expect(acquiredBadgeIdsByUsers[user1.id][0]).to.includes(badge1);
      expect(acquiredBadgeIdsByUsers[user2.id][0]).to.includes(badge1);
      expect(acquiredBadgeIdsByUsers[user2.id][1]).to.includes(badge2);
    });
  });

  describe('#findCertifiable', function () {
    let badgeCertifiable, badgeNonCertifiable, skillSet, badgePartnerCriterion, user, userWithoutBadge;
    beforeEach(async function () {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      badgeCertifiable = databaseBuilder.factory.buildBadge({
        key: 'key1',
        targetProfileId: targetProfile.id,
        isCertifiable: true,
      });
      databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id, isCertifiable: true });
      badgeNonCertifiable = databaseBuilder.factory.buildBadge({
        key: 'key2',
        targetProfileId: targetProfile.id,
        isCertifiable: false,
      });
      user = databaseBuilder.factory.buildUser();
      userWithoutBadge = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badgeCertifiable.id, userId: user.id });
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badgeNonCertifiable.id, userId: user.id });
      skillSet = databaseBuilder.factory.buildSkillSet({ badgeId: badgeCertifiable.id });
      badgePartnerCriterion = databaseBuilder.factory.buildBadgeCriterion({ badgeId: badgeCertifiable.id });
      await databaseBuilder.commit();
    });

    it('should return certifiable badges acquired by the user', async function () {
      // when
      const certifiableBadgesAcquiredByUser = await badgeAcquisitionRepository.findCertifiable({
        userId: user.id,
      });

      // then
      const expectedSkillSets = [
        {
          id: skillSet.id,
          badgeId: badgeCertifiable.id,
          name: skillSet.name,
          skillIds: skillSet.skillIds,
        },
      ];

      const expectedBadgeCriteria = [
        {
          id: badgePartnerCriterion.id,
          scope: badgePartnerCriterion.scope,
          threshold: badgePartnerCriterion.threshold,
          skillSetIds: badgePartnerCriterion.skillSetIds,
          badgeId: badgeCertifiable.id,
        },
      ];

      expect(certifiableBadgesAcquiredByUser.length).to.equal(1);
      expect(certifiableBadgesAcquiredByUser[0].badge).to.includes(badgeCertifiable);
      expect(certifiableBadgesAcquiredByUser[0].badge.skillSets).to.deep.equal(expectedSkillSets);
      expect(certifiableBadgesAcquiredByUser[0].badge.badgeCriteria).to.deep.equal(expectedBadgeCriteria);
    });

    it('should return an empty array when user has no certifiable acquired badge', async function () {
      // when
      const certifiableBadgesAcquiredByUser = await badgeAcquisitionRepository.findCertifiable({
        userId: userWithoutBadge.id,
      });

      // then
      expect(certifiableBadgesAcquiredByUser).to.deep.equal([]);
    });
  });
});
