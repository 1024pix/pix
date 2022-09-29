const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const certifiableBadgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/certifiable-badge-acquisition-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Integration | Repository | Certifiable Badge Acquisition', function () {
  describe('#findHighestCertifiable', function () {
    describe('when the user has a certifiable acquired badge', function () {
      it('should return the certifiable acquired badge', async function () {
        //given
        const user = databaseBuilder.factory.buildUser();
        const acquiredBadge = databaseBuilder.factory.buildBadge.certifiable({
          key: 'PIX_DROIT_MAITRE_CERTIF',
        });

        const { id: campaignParticipationId, campaignId } = databaseBuilder.factory.buildCampaignParticipation();

        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: acquiredBadge.id,
          userId: user.id,
          campaignParticipationId,
        });

        databaseBuilder.factory.buildComplementaryCertification({
          id: 123,
          label: 'Label Certif Complémentaire',
          key: 'KEY',
        });
        const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: acquiredBadge.id,
          complementaryCertificationId: 123,
          level: 2,
          label: 'Label badge',
        });

        const skillSet = databaseBuilder.factory.buildSkillSet({ badgeId: acquiredBadge.id });

        const badgeCriterion = databaseBuilder.factory.buildBadgeCriterion({
          badgeId: acquiredBadge.id,
          skillSetIds: [skillSet.id],
        });

        await databaseBuilder.commit();

        // when
        const certifiableBadgesAcquiredByUser = await DomainTransaction.execute(async (domainTransaction) => {
          return certifiableBadgeAcquisitionRepository.findHighestCertifiable({
            userId: user.id,
            domainTransaction,
          });
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
        const expectedCertifiableBadge = domainBuilder.buildCertifiableBadgeAcquisition({
          badge: domainBuilder.buildBadge({
            ...expectedBadge,
            skillSets: expectedSkillSetsForCertifiableBadge,
            badgeCriteria: expectedBadgeCriteria,
          }),
          userId: user.id,
          campaignId,
          complementaryCertification: domainBuilder.buildComplementaryCertification({
            id: 123,
            label: 'Label Certif Complémentaire',
            key: 'KEY',
          }),
        });

        expect(certifiableBadgesAcquiredByUser.length).to.equal(1);
        expect(certifiableBadgesAcquiredByUser[0]).to.deepEqualInstanceOmitting(expectedCertifiableBadge, ['id']);
      });

      context('when no domainTransaction is passed in parameters', function () {
        it('should use knex instead to return the highest level certifiable acquired badge', async function () {
          // given
          const user = databaseBuilder.factory.buildUser();
          const { id: campaignParticipationId, campaignId } = databaseBuilder.factory.buildCampaignParticipation();

          const acquiredBadge = databaseBuilder.factory.buildBadge.certifiable({
            key: 'PIX_DROIT_MAITRE_CERTIF',
          });

          databaseBuilder.factory.buildBadgeAcquisition({
            badgeId: acquiredBadge.id,
            userId: user.id,
            campaignParticipationId,
          });

          const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
          const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
            badgeId: acquiredBadge.id,
            complementaryCertificationId: complementaryCertification.id,
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
          const certifiableBadgesAcquiredByUser = await certifiableBadgeAcquisitionRepository.findHighestCertifiable({
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

          const expectedCertifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
            badge: domainBuilder.buildBadge({
              ...expectedBadge,
              skillSets: expectedSkillSetsForCertifiableBadge,
              badgeCriteria: expectedBadgeCriteria,
            }),
            userId: user.id,
            badgeId: expectedBadge.id,
            campaignId,
            complementaryCertification: domainBuilder.buildComplementaryCertification(complementaryCertification),
          });

          expect(certifiableBadgesAcquiredByUser.length).to.equal(1);
          expect(certifiableBadgesAcquiredByUser[0]).to.deepEqualInstanceOmitting(expectedCertifiableBadgeAcquisition, [
            'id',
          ]);
        });
      });
    });

    describe('when the user has the same certifiable acquired badge twice', function () {
      it('should return the latest certifiable acquired badge', async function () {
        //given
        const user = databaseBuilder.factory.buildUser();
        const acquiredBadge = databaseBuilder.factory.buildBadge.certifiable({
          key: 'PIX_DROIT_MAITRE_CERTIF',
        });

        const { id: latestCampaignParticipationId, campaignId: latestCampaignId } =
          databaseBuilder.factory.buildCampaignParticipation();
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation();

        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: acquiredBadge.id,
          userId: user.id,
          campaignParticipationId,
          createdAt: new Date('2022-01-01'),
        });

        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: acquiredBadge.id,
          userId: user.id,
          campaignParticipationId: latestCampaignParticipationId,
          createdAt: new Date('2022-01-02'),
        });

        databaseBuilder.factory.buildComplementaryCertification({
          id: 123,
          label: 'Label Certif Complémentaire',
          key: 'KEY',
        });
        const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: acquiredBadge.id,
          complementaryCertificationId: 123,
          level: 2,
          label: 'Label badge',
        });

        const skillSet = databaseBuilder.factory.buildSkillSet({ badgeId: acquiredBadge.id });

        const badgeCriterion = databaseBuilder.factory.buildBadgeCriterion({
          badgeId: acquiredBadge.id,
          skillSetIds: [skillSet.id],
        });

        await databaseBuilder.commit();

        // when
        const certifiableBadgesAcquiredByUser = await DomainTransaction.execute(async (domainTransaction) => {
          return certifiableBadgeAcquisitionRepository.findHighestCertifiable({
            userId: user.id,
            domainTransaction,
          });
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
        const expectedCertifiableBadge = domainBuilder.buildCertifiableBadgeAcquisition({
          badge: domainBuilder.buildBadge({
            ...expectedBadge,
            skillSets: expectedSkillSetsForCertifiableBadge,
            badgeCriteria: expectedBadgeCriteria,
          }),
          userId: user.id,
          campaignId: latestCampaignId,
          complementaryCertification: domainBuilder.buildComplementaryCertification({
            id: 123,
            label: 'Label Certif Complémentaire',
            key: 'KEY',
          }),
        });

        expect(certifiableBadgesAcquiredByUser.length).to.equal(1);
        expect(certifiableBadgesAcquiredByUser[0]).to.deepEqualInstanceOmitting(expectedCertifiableBadge, ['id']);
      });
    });

    describe('when the user has several acquired badges', function () {
      it('should return the highest level and latest certifiable badge acquired for each complementary certification', async function () {
        //given
        const userId = databaseBuilder.factory.buildUser().id;

        const firstComplementaryBadges = buildComplementaryCertificationWithMultipleCertifiableBadges({
          userId,
          keys: [1, 2],
          level: [1, 2],
        });
        const sameDateCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: firstComplementaryBadges[0].id,
          userId,
          sameDateCampaignParticipationId,
          createdAt: new Date('2022-09-29'),
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: firstComplementaryBadges[1].id,
          userId,
          sameDateCampaignParticipationId,
          createdAt: new Date('2022-09-29'),
        });

        const secondComplementaryBadges = buildComplementaryCertificationWithMultipleCertifiableBadges({
          userId,
          keys: [3, 4],
          level: [3, 4],
        });
        const oldestCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: secondComplementaryBadges[0].id,
          userId,
          oldestCampaignParticipationId,
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: secondComplementaryBadges[1].id,
          userId,
          oldestCampaignParticipationId,
          createdAt: new Date('2020-01-01'),
        });
        const latestCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: secondComplementaryBadges[0].id,
          userId,
          latestCampaignParticipationId,
          createdAt: new Date('2022-01-01'),
        });

        await databaseBuilder.commit();

        // when
        const certifiableBadgesAcquiredByUser = await DomainTransaction.execute(async (domainTransaction) => {
          return certifiableBadgeAcquisitionRepository.findHighestCertifiable({
            userId,
            domainTransaction,
          });
        });

        // then
        expect(certifiableBadgesAcquiredByUser.length).to.equal(2);
        expect(
          certifiableBadgesAcquiredByUser.map(({ badge }) => ({
            key: badge.key,
            complementaryCertificationBadgeLevel: badge.complementaryCertificationBadge.level,
          }))
        ).to.deep.equal([
          { key: 'level-2', complementaryCertificationBadgeLevel: 2 },
          { key: 'level-3', complementaryCertificationBadgeLevel: 3 },
        ]);
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
        const certifiableBadgesAcquiredByUser = await DomainTransaction.execute(async (domainTransaction) => {
          return certifiableBadgeAcquisitionRepository.findHighestCertifiable({
            userId: userWithoutCertifiableBadge.id,
            domainTransaction,
          });
        });

        // then
        expect(certifiableBadgesAcquiredByUser).to.be.empty;
      });
    });
  });
});

function buildComplementaryCertificationWithMultipleCertifiableBadges({ keys, level }) {
  const badgeLevel1 = databaseBuilder.factory.buildBadge.certifiable({
    key: `level-${keys[0]}`,
  });
  const badgeLevel2 = databaseBuilder.factory.buildBadge.certifiable({
    key: `level-${keys[1]}`,
  });

  const { id: complementaryCertificationId } = databaseBuilder.factory.buildComplementaryCertification();
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: badgeLevel1.id,
    complementaryCertificationId,
    level: level[0],
    imageUrl: 'complementary-certification-badge-url-2.fr',
  });

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId: badgeLevel2.id,
    complementaryCertificationId,
    level: level[1],
  });

  const badgeLevel1skillSet = databaseBuilder.factory.buildSkillSet({ badgeId: badgeLevel1.id });
  const badgeLevel2skillSet = databaseBuilder.factory.buildSkillSet({ badgeId: badgeLevel2.id });

  databaseBuilder.factory.buildBadgeCriterion({
    badgeId: badgeLevel1.id,
    skillSetIds: [badgeLevel1skillSet.id],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    badgeId: badgeLevel2.id,
    skillSetIds: [badgeLevel2skillSet.id],
  });

  return [badgeLevel1, badgeLevel2];
}
