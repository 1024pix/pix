const { expect, databaseBuilder, knex } = require('../../../test-helper');

const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Integration | Repository | Badge Acquisition', () => {

  let badgeAcquisitionToCreate;

  describe('#create', () => {

    beforeEach(async () => {
      const badgeId = databaseBuilder.factory.buildBadge({ key: 'éclair_au_chocolat' }).id;
      const userId = databaseBuilder.factory.buildUser().id;

      badgeAcquisitionToCreate = databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
      badgeAcquisitionToCreate.id = undefined;
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('badge-acquisitions').delete();
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should persist the badge acquisition in db', async () => {
      // when
      const badgeAcquisitionIds = await DomainTransaction.execute(async (domainTransaction) => {
        return badgeAcquisitionRepository.create([badgeAcquisitionToCreate], domainTransaction);
      });

      // then
      expect(badgeAcquisitionIds).to.have.lengthOf(1);
      const result = await knex('badge-acquisitions').where('id', badgeAcquisitionIds[0]);
      expect(result).to.have.lengthOf(1);
    });
  });

  describe('#getAcquiredBadgeIds', () => {
    let userId;
    let badgeId;

    beforeEach(async () => {
      badgeId = databaseBuilder.factory.buildBadge({ key: 'beignet_a_la_creme' }).id;
      userId = databaseBuilder.factory.buildUser().id;

      badgeAcquisitionToCreate = databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
      await databaseBuilder.commit();
    });

    it('should check that the user has acquired the badge', async () => {
      // when
      const acquiredBadgeIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({ userId, badgeIds: [badgeId] });

      // then
      expect(acquiredBadgeIds).to.deep.equal([badgeId]);
    });

    it('should check that the user has not acquired the badge', async () => {
      // when
      const acquiredBadgeIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({ userId, badgeIds: [-1] });

      // then
      expect(acquiredBadgeIds.length).to.equal(0);
    });
  });

  describe('#getAcquiredBadgesByCampaignParticipations', () => {
    context('when there is just one campaignParticipionId', () => {
      let campaign;
      let user1;
      let badge1;
      let badge2;
      let campaignParticipationId;

      beforeEach(async () => {
        user1 = databaseBuilder.factory.buildUser();
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId: user1.id, campaignId: campaign.id }).id;
        badge1 = databaseBuilder.factory.buildBadge({ key: 'badge1', targetProfileId: targetProfile.id });
        badge2 = databaseBuilder.factory.buildBadge({ key: 'badge2', targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildBadge({ key: 'badge3', targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge1.id, campaignParticipationId, userId: user1.id });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge2.id, campaignParticipationId, userId: user1.id });

        await databaseBuilder.commit();
      });

      it('should return badge ids acquired by user for a campaignParticipation', async () => {
        // when
        const acquiredBadgesByCampaignParticipations = await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
          campaignParticipationsIds: [campaignParticipationId],
        });

        // then
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId][0]).to.includes(badge1);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId][1]).to.includes(badge2);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId].length).to.eq(2);
      });
    });

    context('when there are several campaignParticipationsIds', () => {
      let campaign;
      let user1;
      let user2;
      let badge1;
      let badge2;
      let badge3;
      let campaignParticipationId1;
      let campaignParticipationId2;

      beforeEach(async () => {
        user1 = databaseBuilder.factory.buildUser();
        user2 = databaseBuilder.factory.buildUser();
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        campaignParticipationId1 = databaseBuilder.factory.buildCampaignParticipation({ userId: user1.id, campaignId: campaign.id }).id;
        campaignParticipationId2 = databaseBuilder.factory.buildCampaignParticipation({ userId: user2.id, campaignId: campaign.id }).id;
        badge1 = databaseBuilder.factory.buildBadge({ key: 'badge1', targetProfileId: targetProfile.id });
        badge2 = databaseBuilder.factory.buildBadge({ key: 'badge2', targetProfileId: targetProfile.id });
        badge3 = databaseBuilder.factory.buildBadge({ key: 'badge3', targetProfileId: targetProfile.id });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge1.id, campaignParticipationId: campaignParticipationId2, userId: user2.id });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge2.id, campaignParticipationId: campaignParticipationId1, userId: user1.id });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge3.id, campaignParticipationId: campaignParticipationId2, userId: user2.id });

        await databaseBuilder.commit();
      });

      it('should return badge ids acquired by user for a campaignParticipation', async () => {
        // when
        const campaignParticipationsIds = [campaignParticipationId1, campaignParticipationId2];
        const acquiredBadgesByCampaignParticipations = await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({ campaignParticipationsIds });

        // then
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId2][0]).to.includes(badge1);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId2][1]).to.includes(badge3);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId2].length).to.eq(2);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId1][0]).to.includes(badge2);
        expect(acquiredBadgesByCampaignParticipations[campaignParticipationId1].length).to.eq(1);
      });
    });
  });

  describe('#getCampaignAcquiredBadgesByUsers', () => {
    let campaign;
    let user1;
    let user2;
    let user3;
    let badge1;
    let badge2;

    beforeEach(async () => {
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

    it('should return badge ids acquired by user for a campaign', async () => {
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

  describe('#findCertifiable', () => {
    let badgeCertifiable, badgeNonCertifiable, badgePartnerCompetence, badgePartnerCriterion, user, userWithoutBadge;
    beforeEach(async () => {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      badgeCertifiable = databaseBuilder.factory.buildBadge({ key: 'key1', targetProfileId: targetProfile.id, isCertifiable: true });
      databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id, isCertifiable: true });
      badgeNonCertifiable = databaseBuilder.factory.buildBadge({ key: 'key2', targetProfileId: targetProfile.id, isCertifiable: false });
      user = databaseBuilder.factory.buildUser();
      userWithoutBadge = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badgeCertifiable.id, userId: user.id });
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badgeNonCertifiable.id, userId: user.id });
      badgePartnerCompetence = databaseBuilder.factory.buildBadgePartnerCompetence({ badgeId: badgeCertifiable.id });
      badgePartnerCriterion = databaseBuilder.factory.buildBadgeCriterion({ badgeId: badgeCertifiable.id });
      await databaseBuilder.commit();
    });

    it('should return certifiable badges acquired by the user', async () => {
      // when
      const certifiableBadgesAcquiredByUser = await badgeAcquisitionRepository.findCertifiable({
        userId: user.id,
      });

      // then
      const expectedBadgePartnerCompetences = [
        {
          id: badgePartnerCompetence.id,
          name: badgePartnerCompetence.name,
          skillIds: badgePartnerCompetence.skillIds,
        },
      ];

      const expectedBadgeCriteria = [
        {
          id: badgePartnerCriterion.id,
          scope: badgePartnerCriterion.scope,
          threshold: badgePartnerCriterion.threshold,
          partnerCompetenceIds: badgePartnerCriterion.partnerCompetenceIds,
        },
      ];

      expect(certifiableBadgesAcquiredByUser.length).to.equal(1);
      expect(certifiableBadgesAcquiredByUser[0].badge).to.includes(badgeCertifiable);
      expect(certifiableBadgesAcquiredByUser[0].badge.badgePartnerCompetences).to.deep.equal(expectedBadgePartnerCompetences);
      expect(certifiableBadgesAcquiredByUser[0].badge.badgeCriteria).to.deep.equal(expectedBadgeCriteria);
    });

    it('should return an empty array when user has no certifiable acquired badge', async () => {
      // when
      const certifiableBadgesAcquiredByUser = await badgeAcquisitionRepository.findCertifiable({
        userId: userWithoutBadge.id,
      });

      // then
      expect(certifiableBadgesAcquiredByUser).to.deep.equal([]);
    });

  });
});
