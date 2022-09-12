const { expect, sinon, domainBuilder } = require('../../../test-helper');
const certificationBadgesService = require('./../../../../lib/domain/services/certification-badges-service');
const certifiableBadgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/certifiable-badge-acquisition-repository');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');

describe('Unit | Service | Certification Badges Service', function () {
  describe('#findStillValidBadgeAcquisitions', function () {
    beforeEach(function () {
      sinon.stub(certifiableBadgeAcquisitionRepository, 'findHighestCertifiable');
      sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
      sinon.stub(campaignRepository, 'findSkillIds');
      sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
    });

    context('has no certifiable badges', function () {
      it('should return []', async function () {
        // given
        const userId = 12;
        const domainTransaction = Symbol('someDomainTransaction');
        certifiableBadgeAcquisitionRepository.findHighestCertifiable
          .withArgs({ userId, domainTransaction })
          .resolves([]);

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
      let userId, knowledgeElements, badge, badgeAcquisition, domainTransaction, skillIds;

      beforeEach(function () {
        userId = 12;
        domainTransaction = Symbol('someDomainTransaction');
        knowledgeElements = [];
        badge = domainBuilder.buildBadge();
        badgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({ id: 'badgeId', userId, badge });
        skillIds = [1, 2, 3];
        certifiableBadgeAcquisitionRepository.findHighestCertifiable
          .withArgs({ userId, domainTransaction })
          .resolves([badgeAcquisition]);
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId, domainTransaction }).resolves(knowledgeElements);
        campaignRepository.findSkillIds
          .withArgs({ campaignId: badgeAcquisition.campaignId, domainTransaction })
          .resolves(skillIds);
      });

      context('and badges are still valid', function () {
        it('should return their badge-acquisitions', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ skillIds, badge, knowledgeElements }).returns(true);

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
            .withArgs({ skillIds, badge, knowledgeElements })
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
      let userId, knowledgeElements, skillIds, domainTransaction;

      beforeEach(function () {
        userId = 12;
        domainTransaction = Symbol('someDomainTransaction');
        knowledgeElements = [];
        skillIds = [1, 2, 3];
      });

      context('has one badge acquisition', function () {
        it('should return badge-acquisition with highest level', async function () {
          // given
          const badgeLevel1 = domainBuilder.buildBadge({
            id: 'maitre',
            key: 'LEVEL_1',
          });
          const badgeAcquisitionLevel1 = domainBuilder.buildCertifiableBadgeAcquisition({
            id: 'badgeId1',
            userId,
            badge: badgeLevel1,
          });
          certifiableBadgeAcquisitionRepository.findHighestCertifiable
            .withArgs({ userId, domainTransaction })
            .resolves([badgeAcquisitionLevel1]);
          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId, domainTransaction })
            .resolves(knowledgeElements);
          campaignRepository.findSkillIds
            .withArgs({ campaignId: badgeAcquisitionLevel1.campaignId, domainTransaction })
            .resolves(skillIds);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ skillIds, badge: badgeLevel1, knowledgeElements })
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
            key: 'LEVEL_1',
          });
          const badgeLevel2 = domainBuilder.buildBadge({
            id: 'expert',
            key: 'LEVEL_2',
          });
          domainBuilder.buildCertifiableBadgeAcquisition({
            id: 'badgeId1',
            userId,
            badge: badgeLevel1,
          });
          const badgeAcquisitionLevel2 = domainBuilder.buildCertifiableBadgeAcquisition({
            id: 'badgeId2',
            userId,
            badge: badgeLevel2,
          });
          certifiableBadgeAcquisitionRepository.findHighestCertifiable
            .withArgs({ userId, domainTransaction })
            .resolves([badgeAcquisitionLevel2]);
          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId, domainTransaction })
            .resolves(knowledgeElements);
          campaignRepository.findSkillIds
            .withArgs({ campaignId: badgeAcquisitionLevel2.campaignId, domainTransaction })
            .resolves(skillIds);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ skillIds, badge: badgeLevel2, knowledgeElements })
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
        const skillIds = [1, 2, 3];

        const pixEduFormationContinue1erDegreExpertBadgeAcquisition =
          domainBuilder.buildCertifiableBadgeAcquisition.forPixEduFormationContinue1erDegreAvance();
        const pixEduFormationContinue1erAvanceBadgeAcquisition =
          domainBuilder.buildCertifiableBadgeAcquisition.forPixEduFormationContinue1erDegreConfirme();
        const pixEduFormationContinue2ndDegreExpertBadgeAcquisition =
          domainBuilder.buildCertifiableBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance();
        const pixEduFormationContinue2ndAvanceBadgeAcquisition =
          domainBuilder.buildCertifiableBadgeAcquisition.forPixEduFormationContinue2ndDegreConfirme();
        const pixDroitMaitreBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition.forPixDroitMaitre();
        const pixDroitExpertBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition.forPixDroitExpert();

        certifiableBadgeAcquisitionRepository.findHighestCertifiable
          .withArgs({ userId, domainTransaction })
          .resolves([
            pixEduFormationContinue1erDegreExpertBadgeAcquisition,
            pixEduFormationContinue2ndDegreExpertBadgeAcquisition,
            pixDroitExpertBadgeAcquisition,
          ]);
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId, domainTransaction }).resolves(knowledgeElements);

        [
          pixEduFormationContinue1erDegreExpertBadgeAcquisition,
          pixEduFormationContinue1erAvanceBadgeAcquisition,
          pixEduFormationContinue2ndDegreExpertBadgeAcquisition,
          pixEduFormationContinue2ndAvanceBadgeAcquisition,
          pixDroitMaitreBadgeAcquisition,
          pixDroitExpertBadgeAcquisition,
        ].forEach(({ badge, campaignId }) => {
          campaignRepository.findSkillIds.withArgs({ campaignId, domainTransaction }).resolves(skillIds);
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ skillIds, badge, knowledgeElements }).returns(true);
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
