const { expect, sinon, domainBuilder } = require('../../../test-helper');
const certificationBadgesService = require('./../../../../lib/domain/services/certification-badges-service');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');
const { PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF, PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3 } =
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

      context('has maitreBadgeAcquisition', function () {
        it('should return badge-acquisitions with maitreBadgeAcquisition', async function () {
          // given
          const maitreBadge = domainBuilder.buildBadge({
            id: 'maitre',
            targetProfileId: targetProfile.id,
            key: PIX_DROIT_MAITRE_CERTIF,
          });
          const otherBadge = domainBuilder.buildBadge({ id: 'other', targetProfileId: targetProfile.id });
          const maitreBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
            id: 'badgeId1',
            userId,
            badge: maitreBadge,
          });
          const otherBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
            id: 'badgeId2',
            userId,
            badge: otherBadge,
          });
          badgeAcquisitionRepository.findCertifiable
            .withArgs({ userId, domainTransaction })
            .resolves([maitreBadgeAcquisition, otherBadgeAcquisition]);
          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId, domainTransaction })
            .resolves(knowledgeElements);
          targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, badge: maitreBadge, knowledgeElements })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, badge: otherBadge, knowledgeElements })
            .returns(true);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
            userId,
            domainTransaction,
          });

          // then
          expect(badgesAcquisitions).to.deep.equal([otherBadgeAcquisition, maitreBadgeAcquisition]);
        });
      });

      context('has maitreBadgeAcquisition and expertBadgeAcquisition', function () {
        it('should return badge-acquisitions with expertBadgeAcquisition', async function () {
          // given
          const maitreBadge = domainBuilder.buildBadge({
            id: 'maitre',
            targetProfileId: targetProfile.id,
            key: PIX_DROIT_MAITRE_CERTIF,
          });
          const expertBadge = domainBuilder.buildBadge({
            id: 'expert',
            targetProfileId: targetProfile.id,
            key: PIX_DROIT_EXPERT_CERTIF,
          });
          const maitreBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
            id: 'badgeId1',
            userId,
            badge: maitreBadge,
          });
          const expertBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
            id: 'badgeId2',
            userId,
            badge: expertBadge,
          });
          badgeAcquisitionRepository.findCertifiable
            .withArgs({ userId, domainTransaction })
            .resolves([maitreBadgeAcquisition, expertBadgeAcquisition]);
          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId, domainTransaction })
            .resolves(knowledgeElements);
          targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, badge: maitreBadge, knowledgeElements })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, badge: expertBadge, knowledgeElements })
            .returns(true);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
            userId,
            domainTransaction,
          });

          // then
          expect(badgesAcquisitions).to.deep.equal([expertBadgeAcquisition]);
        });
      });
    });

    context('has certifiable badges including Pix+ Édu 2nd degre', function () {
      it('should return badge-acquisitions with highest Pix+ Édu badge and other badge acquisitions', async function () {
        // given
        const userId = 12;
        const domainTransaction = Symbol('someDomainTransaction');
        const knowledgeElements = [];
        const targetProfile = { id: 456 };

        const pixEduFormationContinueAvanceBadgeAcquisition =
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance();
        const pixEduFormationContinueConfirmeBadgeAcquisition =
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreConfirme();
        const otherBadgeAcquisition = domainBuilder.buildBadgeAcquisition();

        badgeAcquisitionRepository.findCertifiable
          .withArgs({ userId, domainTransaction })
          .resolves([
            pixEduFormationContinueConfirmeBadgeAcquisition,
            pixEduFormationContinueAvanceBadgeAcquisition,
            otherBadgeAcquisition,
          ]);
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId, domainTransaction }).resolves(knowledgeElements);
        targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);
        badgeCriteriaService.areBadgeCriteriaFulfilled
          .withArgs({ targetProfile, badge: pixEduFormationContinueAvanceBadgeAcquisition.badge, knowledgeElements })
          .returns(true);
        badgeCriteriaService.areBadgeCriteriaFulfilled
          .withArgs({ targetProfile, badge: pixEduFormationContinueConfirmeBadgeAcquisition.badge, knowledgeElements })
          .returns(true);
        badgeCriteriaService.areBadgeCriteriaFulfilled
          .withArgs({ targetProfile, badge: otherBadgeAcquisition.badge, knowledgeElements })
          .returns(true);

        // when
        const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
          userId,
          domainTransaction,
        });

        // then
        expect(badgesAcquisitions).to.deep.equal([
          otherBadgeAcquisition,
          pixEduFormationContinueAvanceBadgeAcquisition,
        ]);
      });
    });

    context('has certifiable badges including Pix+ Édu 1er degre', function () {
      it('should return badge-acquisitions with highest Pix+ Édu badge and other badge acquisitions', async function () {
        // given
        const userId = 12;
        const domainTransaction = Symbol('someDomainTransaction');
        const knowledgeElements = [];
        const targetProfile = { id: 456 };

        const pixEduFormationContinueAvanceBadgeAcquisition =
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreAvance();
        const pixEduFormationContinueConfirmeBadgeAcquisition =
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreConfirme();
        const otherBadgeAcquisition = domainBuilder.buildBadgeAcquisition();

        badgeAcquisitionRepository.findCertifiable
          .withArgs({ userId, domainTransaction })
          .resolves([
            pixEduFormationContinueConfirmeBadgeAcquisition,
            pixEduFormationContinueAvanceBadgeAcquisition,
            otherBadgeAcquisition,
          ]);
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId, domainTransaction }).resolves(knowledgeElements);
        targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);
        badgeCriteriaService.areBadgeCriteriaFulfilled
          .withArgs({ targetProfile, badge: pixEduFormationContinueAvanceBadgeAcquisition.badge, knowledgeElements })
          .returns(true);
        badgeCriteriaService.areBadgeCriteriaFulfilled
          .withArgs({ targetProfile, badge: pixEduFormationContinueConfirmeBadgeAcquisition.badge, knowledgeElements })
          .returns(true);
        badgeCriteriaService.areBadgeCriteriaFulfilled
          .withArgs({ targetProfile, badge: otherBadgeAcquisition.badge, knowledgeElements })
          .returns(true);

        // when
        const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
          userId,
          domainTransaction,
        });

        // then
        expect(badgesAcquisitions).to.deep.equal([
          otherBadgeAcquisition,
          pixEduFormationContinueAvanceBadgeAcquisition,
        ]);
      });
    });

    context('has certifiable badges including Pix+ Édu and Pix+ Droit', function () {
      it('should return badge-acquisitions with highest Pix+ Édu badge and highest Pix+ Droit badge', async function () {
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
            pixEduFormationContinue1erAvanceBadgeAcquisition,
            pixEduFormationContinue1erDegreExpertBadgeAcquisition,
            pixEduFormationContinue2ndAvanceBadgeAcquisition,
            pixEduFormationContinue2ndDegreExpertBadgeAcquisition,
            pixDroitMaitreBadgeAcquisition,
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
          pixDroitExpertBadgeAcquisition,
          pixEduFormationContinue2ndDegreExpertBadgeAcquisition,
          pixEduFormationContinue1erDegreExpertBadgeAcquisition,
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
