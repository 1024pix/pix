const { expect, sinon, domainBuilder } = require('../../../test-helper');
const certificationBadgesService = require('./../../../../lib/domain/services/certification-badges-service');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');

describe('Unit | Service | Certification Badges Service', function () {
  describe('#findStillValidBadgeAcquisitions', function () {
    beforeEach(function () {
      sinon.stub(badgeAcquisitionRepository, 'findHighestCertifiable');
      sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
      sinon.stub(targetProfileRepository, 'get');
      sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
    });

    context('has no certifiable badges', function () {
      it('should return []', async function () {
        // given
        const userId = 12;
        const domainTransaction = Symbol('someDomainTransaction');
        badgeAcquisitionRepository.findHighestCertifiable.withArgs({ userId, domainTransaction }).resolves([]);

        // when
        const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
          userId,
          domainTransaction,
        });

        // then
        expect(badgesAcquisitions).to.deep.equal([]);
      });
    });

    context('has certifiable badges but neither from Pix+ Droit nor Pix+ Édu', function () {
      let userId, knowledgeElements, badge, targetProfile, badgeAcquisition, domainTransaction;

      beforeEach(function () {
        userId = 12;
        domainTransaction = Symbol('someDomainTransaction');
        knowledgeElements = [];
        targetProfile = { id: 12 };
        badge = domainBuilder.buildBadge({ targetProfileId: targetProfile.id });
        badgeAcquisition = domainBuilder.buildBadgeAcquisition({ id: 'badgeId', userId, badge });
        badgeAcquisitionRepository.findHighestCertifiable
          .withArgs({ userId, domainTransaction })
          .resolves([badgeAcquisition]);
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId, domainTransaction }).resolves(knowledgeElements);
        targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);
      });

      context('and badges are still valid', function () {
        it('should return their badge-acquisitions', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, badge, knowledgeElements })
            .returns(true);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
            userId,
            domainTransaction,
          });

          // then
          expect(badgesAcquisitions).to.deep.equal([badgeAcquisition]);
        });
      });

      context('and badges are not valid', function () {
        it('should return empty badge-acquisitions', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, badge, knowledgeElements })
            .returns(false);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
            userId,
            domainTransaction,
          });

          // then
          expect(badgesAcquisitions).to.deep.equal([]);
        });
      });
    });

    context('has certifiable badges including Pix+ Droit', function () {
      let userId, knowledgeElements, targetProfile, domainTransaction;

      beforeEach(function () {
        userId = 12;
        domainTransaction = Symbol('someDomainTransaction');
        knowledgeElements = [];
        targetProfile = { id: 12 };
      });

      context('has one badge acquisition', function () {
        it('should return badge-acquisition with highest level', async function () {
          // given
          const badgeLevel1 = domainBuilder.buildBadge({
            id: 'maitre',
            targetProfileId: targetProfile.id,
            key: 'LEVEL_1',
          });
          const badgeAcquisitionLevel1 = domainBuilder.buildBadgeAcquisition({
            id: 'badgeId1',
            userId,
            badge: badgeLevel1,
          });
          badgeAcquisitionRepository.findHighestCertifiable
            .withArgs({ userId, domainTransaction })
            .resolves([badgeAcquisitionLevel1]);
          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId, domainTransaction })
            .resolves(knowledgeElements);
          targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, badge: badgeLevel1, knowledgeElements })
            .returns(true);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
            userId,
            domainTransaction,
          });

          // then
          expect(badgesAcquisitions).to.deep.equal([badgeAcquisitionLevel1]);
        });
      });

      context('has several badge acquisition', function () {
        it('should return the badge-acquisition with the highest level', async function () {
          // given
          const badgeLevel1 = domainBuilder.buildBadge({
            id: 'maitre',
            targetProfileId: targetProfile.id,
            key: 'LEVEL_1',
          });
          const badgeLevel2 = domainBuilder.buildBadge({
            id: 'expert',
            targetProfileId: targetProfile.id,
            key: 'LEVEL_2',
          });
          domainBuilder.buildBadgeAcquisition({
            id: 'badgeId1',
            userId,
            badge: badgeLevel1,
          });
          const badgeAcquisitionLevel2 = domainBuilder.buildBadgeAcquisition({
            id: 'badgeId2',
            userId,
            badge: badgeLevel2,
          });
          badgeAcquisitionRepository.findHighestCertifiable
            .withArgs({ userId, domainTransaction })
            .resolves([badgeAcquisitionLevel2]);
          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId, domainTransaction })
            .resolves(knowledgeElements);
          targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, badge: badgeLevel2, knowledgeElements })
            .returns(true);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
            userId,
            domainTransaction,
          });

          // then
          expect(badgesAcquisitions).to.deep.equal([badgeAcquisitionLevel2]);
        });
      });
    });

    context('has different types of certifiable badges', function () {
      it('should return badge-acquisitions with highest level for each type of certifiable badge', async function () {
        // given
        const userId = 12;
        const domainTransaction = Symbol('someDomainTransaction');
        const knowledgeElements = [];
        const targetProfile = { id: 456 };

        const pixEduFormationContinue1erDegreExpertBadgeAcquisition =
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreAvance();
        const pixEduFormationContinue1erAvanceBadgeAcquisition =
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreConfirme();
        const pixEduFormationContinue2ndDegreExpertBadgeAcquisition =
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance();
        const pixEduFormationContinue2ndAvanceBadgeAcquisition =
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreConfirme();
        const pixDroitMaitreBadgeAcquisition = domainBuilder.buildBadgeAcquisition.forPixDroitMaitre();
        const pixDroitExpertBadgeAcquisition = domainBuilder.buildBadgeAcquisition.forPixDroitExpert();

        badgeAcquisitionRepository.findHighestCertifiable
          .withArgs({ userId, domainTransaction })
          .resolves([
            pixEduFormationContinue1erDegreExpertBadgeAcquisition,
            pixEduFormationContinue2ndDegreExpertBadgeAcquisition,
            pixDroitExpertBadgeAcquisition,
          ]);
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId, domainTransaction }).resolves(knowledgeElements);
        targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);

        [
          pixEduFormationContinue1erDegreExpertBadgeAcquisition.badge,
          pixEduFormationContinue1erAvanceBadgeAcquisition.badge,
          pixEduFormationContinue2ndDegreExpertBadgeAcquisition.badge,
          pixEduFormationContinue2ndAvanceBadgeAcquisition.badge,
          pixDroitMaitreBadgeAcquisition.badge,
          pixDroitExpertBadgeAcquisition.badge,
        ].forEach((badge) => {
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, badge, knowledgeElements })
            .returns(true);
        });

        // when
        const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
          userId,
          domainTransaction,
        });

        // then
        expect(badgesAcquisitions).to.deep.equal([
          pixEduFormationContinue1erDegreExpertBadgeAcquisition,
          pixEduFormationContinue2ndDegreExpertBadgeAcquisition,
          pixDroitExpertBadgeAcquisition,
        ]);
      });
    });
  });
});
