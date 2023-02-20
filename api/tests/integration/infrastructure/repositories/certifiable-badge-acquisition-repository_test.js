import { expect, databaseBuilder, domainBuilder } from '../../../test-helper';
import certifiableBadgeAcquisitionRepository from '../../../../lib/infrastructure/repositories/certifiable-badge-acquisition-repository';
import DomainTransaction from '../../../../lib/infrastructure/DomainTransaction';

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
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          id: 123,
          label: 'Label Certif Complémentaire',
          key: 'KEY',
        });
        const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: acquiredBadge.id,
          complementaryCertificationId: 123,
          level: 2,
          label: 'Label badge',
          imageUrl: 'coucou.svg',
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
        const expectedCertifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
          badgeId: acquiredBadge.id,
          badgeKey: acquiredBadge.key,
          campaignId,
          complementaryCertificationId: complementaryCertification.id,
          complementaryCertificationKey: complementaryCertification.key,
          complementaryCertificationBadgeId: complementaryCertificationBadge.id,
          complementaryCertificationBadgeLabel: complementaryCertificationBadge.label,
          complementaryCertificationBadgeImageUrl: complementaryCertificationBadge.imageUrl,
        });
        expect(certifiableBadgesAcquiredByUser).to.deepEqualArray([expectedCertifiableBadgeAcquisition]);
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
          await databaseBuilder.commit();

          // when
          const certifiableBadgesAcquiredByUser = await certifiableBadgeAcquisitionRepository.findHighestCertifiable({
            userId: user.id,
          });

          // then
          const expectedCertifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
            badgeId: acquiredBadge.id,
            badgeKey: acquiredBadge.key,
            campaignId,
            complementaryCertificationId: complementaryCertification.id,
            complementaryCertificationKey: complementaryCertification.key,
            complementaryCertificationBadgeId: complementaryCertificationBadge.id,
            complementaryCertificationBadgeLabel: complementaryCertificationBadge.label,
            complementaryCertificationBadgeImageUrl: complementaryCertificationBadge.imageUrl,
          });
          expect(certifiableBadgesAcquiredByUser).to.deepEqualArray([expectedCertifiableBadgeAcquisition]);
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
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
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
        await databaseBuilder.commit();

        // when
        const certifiableBadgesAcquiredByUser = await DomainTransaction.execute(async (domainTransaction) => {
          return certifiableBadgeAcquisitionRepository.findHighestCertifiable({
            userId: user.id,
            domainTransaction,
          });
        });

        // then
        const expectedCertifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
          badgeId: acquiredBadge.id,
          badgeKey: acquiredBadge.key,
          campaignId: latestCampaignId,
          complementaryCertificationId: complementaryCertification.id,
          complementaryCertificationKey: complementaryCertification.key,
          complementaryCertificationBadgeId: complementaryCertificationBadge.id,
          complementaryCertificationBadgeLabel: complementaryCertificationBadge.label,
          complementaryCertificationBadgeImageUrl: complementaryCertificationBadge.imageUrl,
        });
        expect(certifiableBadgesAcquiredByUser).to.deepEqualArray([expectedCertifiableBadgeAcquisition]);
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
        expect(certifiableBadgesAcquiredByUser.map(({ badgeKey }) => badgeKey)).to.deep.equal(['level-2', 'level-3']);
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

  return [badgeLevel1, badgeLevel2];
}
