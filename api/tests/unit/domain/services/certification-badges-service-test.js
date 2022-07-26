const { expect, sinon, domainBuilder } = require('../../../test-helper');
const certificationBadgesService = require('./../../../../lib/domain/services/certification-badges-service');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');
const { PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3 } =
  require('../../../../lib/domain/models/Badge').keys;

describe('Unit | Service | Certification Badges Service', function () {
  describe('#findStillValidBadgeAcquisitions', function () {
    beforeEach(function () {
      sinon.stub(badgeAcquisitionRepository, 'findCertifiable');
      sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
      sinon.stub(targetProfileRepository, 'get');
      sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
    });

    context('has no certifiable badges', function () {
      it('should return []', async function () {
        // given
        const userId = 12;
        const domainTransaction = Symbol('someDomainTransaction');
        badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([]);

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
        badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([badgeAcquisition]);
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
          badgeAcquisitionRepository.findCertifiable
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
          badgeAcquisitionRepository.findCertifiable
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

        badgeAcquisitionRepository.findCertifiable
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

  describe('#hasStillValidCleaBadgeAcquisition', function () {
    beforeEach(function () {
      sinon.stub(badgeAcquisitionRepository, 'hasAcquiredBadge');
      sinon.stub(badgeRepository, 'getByKey');
      sinon.stub(targetProfileRepository, 'get');
      sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
      sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
    });

    context('when user has never acquired CleA badge', function () {
      it('should return false', async function () {
        // given
        badgeAcquisitionRepository.hasAcquiredBadge
          .withArgs({ badgeKey: PIX_EMPLOI_CLEA_V3, userId: 123 })
          .resolves(false);
        badgeRepository.getByKey.throws(new Error('"badgeRepository.getByKey" should not be called'));

        // when
        const hasAcquiredBadge = await certificationBadgesService.hasStillValidCleaBadgeAcquisition({ userId: 123 });

        // then
        expect(hasAcquiredBadge).to.be.false;
      });
    });

    context('when user has acquired CleA badge V1', function () {
      it('should return the result computed by the calculation of the criteria', async function () {
        // given
        badgeAcquisitionRepository.hasAcquiredBadge
          .withArgs({ badgeKey: PIX_EMPLOI_CLEA_V1, userId: 123 })
          .resolves(true);
        const badge = domainBuilder.buildBadge({ key: PIX_EMPLOI_CLEA_V1, targetProfileId: 456 });
        badgeRepository.getByKey.withArgs(PIX_EMPLOI_CLEA_V1).resolves(badge);
        const targetProfile = domainBuilder.buildTargetProfile({ id: 456 });
        targetProfileRepository.get.withArgs(456).resolves(targetProfile);
        const knowledgeElement = domainBuilder.buildKnowledgeElement({ userId: 123 });
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId: 123 }).resolves([knowledgeElement]);
        badgeCriteriaService.areBadgeCriteriaFulfilled
          .withArgs({ knowledgeElements: [knowledgeElement], targetProfile, badge })
          .resolves('The boolean result');

        // when
        const hasAcquiredBadge = await certificationBadgesService.hasStillValidCleaBadgeAcquisition({ userId: 123 });

        // then
        expect(hasAcquiredBadge).to.equal('The boolean result');
      });
    });

    context('when user has acquired CleA badge V2', function () {
      it('should return the result computed by the calculation of the criteria', async function () {
        // given
        badgeAcquisitionRepository.hasAcquiredBadge
          .withArgs({ badgeKey: PIX_EMPLOI_CLEA_V2, userId: 123 })
          .resolves(true);
        const badge = domainBuilder.buildBadge({ key: PIX_EMPLOI_CLEA_V2, targetProfileId: 456 });
        badgeRepository.getByKey.withArgs(PIX_EMPLOI_CLEA_V2).resolves(badge);
        const targetProfile = domainBuilder.buildTargetProfile({ id: 456 });
        targetProfileRepository.get.withArgs(456).resolves(targetProfile);
        const knowledgeElement = domainBuilder.buildKnowledgeElement({ userId: 123 });
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId: 123 }).resolves([knowledgeElement]);
        badgeCriteriaService.areBadgeCriteriaFulfilled
          .withArgs({ knowledgeElements: [knowledgeElement], targetProfile, badge })
          .resolves('The boolean result');

        // when
        const hasAcquiredBadge = await certificationBadgesService.hasStillValidCleaBadgeAcquisition({ userId: 123 });

        // then
        expect(hasAcquiredBadge).to.equal('The boolean result');
      });
    });

    context('when user has acquired CleA badge V3', function () {
      it('should return the result computed by the calculation of the criteria', async function () {
        // given
        badgeAcquisitionRepository.hasAcquiredBadge
          .withArgs({ badgeKey: PIX_EMPLOI_CLEA_V3, userId: 123 })
          .resolves(true);
        const badge = domainBuilder.buildBadge({ key: PIX_EMPLOI_CLEA_V3, targetProfileId: 456 });
        badgeRepository.getByKey.withArgs(PIX_EMPLOI_CLEA_V3).resolves(badge);
        const targetProfile = domainBuilder.buildTargetProfile({ id: 456 });
        targetProfileRepository.get.withArgs(456).resolves(targetProfile);
        const knowledgeElement = domainBuilder.buildKnowledgeElement({ userId: 123 });
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId: 123 }).resolves([knowledgeElement]);
        badgeCriteriaService.areBadgeCriteriaFulfilled
          .withArgs({ knowledgeElements: [knowledgeElement], targetProfile, badge })
          .resolves('The boolean result');

        // when
        const hasAcquiredBadge = await certificationBadgesService.hasStillValidCleaBadgeAcquisition({ userId: 123 });

        // then
        expect(hasAcquiredBadge).to.equal('The boolean result');
      });
    });
  });
});
