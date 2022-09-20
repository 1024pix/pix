const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const certifiableBadgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/certifiable-badge-acquisition-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Integration | Repository | Certifiable Badge Acquisition', function () {
  describe('#findHighestCertifiable', function () {
    describe('when the user has a certifiable acquired badge', function () {
      it('should return the highest level certifiable acquired badge', async function () {
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

        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;

        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badgeLevel1.id,
          userId: user.id,
          campaignParticipationId,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: badgeLevel2.id,
          userId: user.id,
          campaignParticipationId,
        });

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
        const certifiableBadgesAcquiredByUser = await DomainTransaction.execute(async (domainTransaction) => {
          return certifiableBadgeAcquisitionRepository.findHighestCertifiable({
            userId: user.id,
            domainTransaction,
          });
        });

        // then
        expect(certifiableBadgesAcquiredByUser.length).to.equal(1);
        expect(certifiableBadgesAcquiredByUser.map(({ badge }) => ({ imageUrl: badge.imageUrl }))).to.deep.equal([
          { imageUrl: badgeLevel2.imageUrl },
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
