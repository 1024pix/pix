const { expect, databaseBuilder, knex, domainBuilder } = require('../../../test-helper');
const _ = require('lodash');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const Badge = require('../../../../lib/domain/models/Badge');

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

  describe('#findHighestCertifiable', function () {
    describe('when the user has a certifiable acquired badge', function () {
      it('should return the highest level certifiable acquired badge', async function () {
        //given
        const user = databaseBuilder.factory.buildUser();
        const acquiredBadge = databaseBuilder.factory.buildBadge.certifiable({
          key: 'PIX_DROIT_MAITRE_CERTIF',
        });

        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: acquiredBadge.id, userId: user.id });

        const { id: complementaryCertificationId } = databaseBuilder.factory.buildComplementaryCertification();
        const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: acquiredBadge.id,
          complementaryCertificationId,
          level: 2,
          label: 'Label Certif Complémentaire',
        });

        const skillSet = databaseBuilder.factory.buildSkillSet({ badgeId: acquiredBadge.id });

        const badgeCriterion = databaseBuilder.factory.buildBadgeCriterion({
          badgeId: acquiredBadge.id,
          skillSetIds: [skillSet.id],
        });

        await databaseBuilder.commit();

        // when
        const certifiableBadgesAcquiredByUser = await badgeAcquisitionRepository.findHighestCertifiable({
          userId: user.id,
        });

        // then
        const expectedSkillSetsForCertifiableBadge = [
          {
            id: skillSet.id,
            badgeId: acquiredBadge.id,
            name: skillSet.name,
            skillIds: skillSet.skillIds,
          },
        ];

        const expectedBadgeCriteria = [
          {
            id: badgeCriterion.id,
            scope: badgeCriterion.scope,
            threshold: badgeCriterion.threshold,
            skillSetIds: badgeCriterion.skillSetIds,
            badgeId: acquiredBadge.id,
          },
        ];

        const expectedBadge = new Badge({
          ...acquiredBadge,
          complementaryCertificationBadge: domainBuilder.buildComplementaryCertificationBadge({
            ...complementaryCertificationBadge,
          }),
        });
        expect(certifiableBadgesAcquiredByUser.length).to.equal(1);
        expect(certifiableBadgesAcquiredByUser[0]).to.deepEqualInstanceOmitting(
          domainBuilder.buildBadgeAcquisition({
            badge: domainBuilder.buildBadge({
              ...expectedBadge,
              skillSets: expectedSkillSetsForCertifiableBadge,
              badgeCriteria: expectedBadgeCriteria,
            }),
            userId: user.id,
            badgeId: expectedBadge.id,
            campaignParticipationId: null,
          }),
          ['id']
        );
      });
    });

    describe('when the user has several acquired badges', function () {
      it('should return the highest level certifiable badge acquired for each complementary certification', async function () {
        //given
        const user = databaseBuilder.factory.buildUser();
        const badgeLevel1 = databaseBuilder.factory.buildBadge.certifiable({
          key: 'level-1',
        });
        const badgeLevel2 = databaseBuilder.factory.buildBadge.certifiable({
          key: 'level-2',
          imageUrl: 'badge-url-2.fr',
        });
        const badgeLevel3 = databaseBuilder.factory.buildBadge.certifiable({
          key: 'level-3',
        });

        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badgeLevel1.id, userId: user.id });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badgeLevel2.id, userId: user.id });

        const { id: complementaryCertificationId } = databaseBuilder.factory.buildComplementaryCertification();
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: badgeLevel2.id,
          complementaryCertificationId,
          level: 2,
          imageUrl: 'complementary-certification-badge-url-2.fr',
        });

        databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: badgeLevel1.id,
          complementaryCertificationId,
          level: 1,
        });

        databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: badgeLevel3.id,
          complementaryCertificationId,
          level: 3,
        });

        const badgeLevel1skillSet = databaseBuilder.factory.buildSkillSet({ badgeId: badgeLevel1.id });
        const badgeLevel2skillSet = databaseBuilder.factory.buildSkillSet({ badgeId: badgeLevel2.id });
        const badgeLevel3SkillSet = databaseBuilder.factory.buildSkillSet({
          badgeId: badgeLevel3.id,
        });

        databaseBuilder.factory.buildBadgeCriterion({
          badgeId: badgeLevel1.id,
          skillSetIds: [badgeLevel1skillSet.id],
        });
        databaseBuilder.factory.buildBadgeCriterion({
          badgeId: badgeLevel2.id,
          skillSetIds: [badgeLevel2skillSet.id],
        });
        databaseBuilder.factory.buildBadgeCriterion({
          badgeId: badgeLevel3.id,
          skillSetIds: [badgeLevel3SkillSet.id],
        });
        await databaseBuilder.commit();

        // when
        const certifiableBadgesAcquiredByUser = await badgeAcquisitionRepository.findHighestCertifiable({
          userId: user.id,
        });

        // then
        expect(certifiableBadgesAcquiredByUser.length).to.equal(1);
        expect(
          certifiableBadgesAcquiredByUser.map(({ badgeId, badge }) => ({ badgeId, imageUrl: badge.imageUrl }))
        ).to.deep.equal([{ badgeId: badgeLevel2.id, imageUrl: badgeLevel2.imageUrl }]);
      });
    });
    describe('when the user has no certifiable acquired badge', function () {
      it('should return an empty array', async function () {
        // given
        const userWithoutCertifiableBadge = databaseBuilder.factory.buildUser();
        const badgeNonCertifiable = databaseBuilder.factory.buildBadge.notCertifiable({
          key: 'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT',
        });

        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badgeNonCertifiable.id,
          userId: userWithoutCertifiableBadge.id,
        });
        await databaseBuilder.commit();

        // when
        const certifiableBadgesAcquiredByUser = await badgeAcquisitionRepository.findHighestCertifiable({
          userId: userWithoutCertifiableBadge.id,
        });

        // then
        expect(certifiableBadgesAcquiredByUser).to.be.empty;
      });
    });
  });
});
