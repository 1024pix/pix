const { expect, sinon } = require('../../../test-helper');
const certificationBadgesService = require('./../../../../lib/domain/services/certification-badges-service');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');

describe('Unit | Service | Certification Badges Service', () => {

  describe('#findStillValidBadgeAcquisitions', () => {

    beforeEach(() => {
      sinon.stub(badgeAcquisitionRepository, 'findCertifiable');
      sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
      sinon.stub(targetProfileRepository, 'get');
      sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
    });

    context('has no certifiable badges', () => {
      it('should return []', async () => {
        // given
        const userId = 12;
        const domainTransaction = Symbol('someDomainTransaction');
        badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([]);

        // when
        const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({ userId, domainTransaction });

        // then
        expect(badgesAcquisitions).to.deep.equal([]);
      });
    });

    context('has certifiable badges but not from pix+droit', () => {

      let userId, knowledgeElements, badge, targetProfile, badgeAcquisition, domainTransaction;

      beforeEach(() => {
        userId = 12;
        domainTransaction = Symbol('someDomainTransaction');
        knowledgeElements = [];
        targetProfile = { id: 12 };
        badge = { targetProfileId: targetProfile.id };
        badgeAcquisition = { id: 'badgeId', userId, badge };
        badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([badgeAcquisition]);
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId, domainTransaction }).resolves(knowledgeElements);
        targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);
      });

      context('and badges are still valid', () => {
        it('should return their badge-acquisitions', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ targetProfile, badge, knowledgeElements }).returns(true);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({ userId, domainTransaction });

          // then
          expect(badgesAcquisitions).to.deep.equal([badgeAcquisition]);
        });
      });

      context('and badges are not valid', () => {
        it('should return empty badge-acquisitions', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ targetProfile, badge, knowledgeElements }).returns(false);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({ userId, domainTransaction });

          // then
          expect(badgesAcquisitions).to.deep.equal([]);
        });
      });
    });

    context('has certifiable badges including pix+droit', () => {
      const pixDroitMaitre = 'PIX_DROIT_MAITRE_CERTIF';
      const pixDroitExpert = 'PIX_DROIT_EXPERT_CERTIF';

      let userId, knowledgeElements, targetProfile, domainTransaction;

      beforeEach(() => {
        userId = 12;
        domainTransaction = Symbol('someDomainTransaction');
        knowledgeElements = [];
        targetProfile = { id: 12 };
      });

      context('has maitreBadgeAcquisition', () => {

        it('should return badge-acquisitions with maitreBadgeAcquisition', async () => {
          // given
          const maitreBadge = { id: 'maitre', targetProfileId: targetProfile.id };
          const otherBadge = { id: 'other', targetProfileId: targetProfile.id };
          const maitreBadgeAcquisition = { id: 'badgeId1', userId, badgeKey: pixDroitMaitre, badge: maitreBadge };
          const otherBadgeAcquisition = { id: 'badgeId2', userId, badge: otherBadge };
          badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([maitreBadgeAcquisition, otherBadgeAcquisition]);
          knowledgeElementRepository.findUniqByUserId.withArgs({ userId, domainTransaction }).resolves(knowledgeElements);
          targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ targetProfile, badge: maitreBadge, knowledgeElements }).returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ targetProfile, badge: otherBadge, knowledgeElements }).returns(true);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({ userId, domainTransaction });

          // then
          expect(badgesAcquisitions).to.deep.equal([otherBadgeAcquisition, maitreBadgeAcquisition]);
        });
      });

      context('has maitreBadgeAcquisition and expertBadgeAcquisition', () => {

        it('should return badge-acquisitions with expertBadgeAcquisition', async () => {
          // given
          const maitreBadge = { id: 'maitre', targetProfileId: targetProfile.id };
          const expertBadge = { id: 'expert', targetProfileId: targetProfile.id };
          const maitreBadgeAcquisition = { id: 'badgeId1', userId, badgeKey: pixDroitMaitre, badge: maitreBadge };
          const expertBadgeAcquisition = { id: 'badgeId2', userId, badgeKey: pixDroitExpert, badge: expertBadge };
          badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([maitreBadgeAcquisition, expertBadgeAcquisition]);
          knowledgeElementRepository.findUniqByUserId.withArgs({ userId, domainTransaction }).resolves(knowledgeElements);
          targetProfileRepository.get.withArgs(targetProfile.id, domainTransaction).resolves(targetProfile);
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ targetProfile, badge: maitreBadge, knowledgeElements }).returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ targetProfile, badge: expertBadge, knowledgeElements }).returns(true);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({ userId, domainTransaction });

          // then
          expect(badgesAcquisitions).to.deep.equal([expertBadgeAcquisition]);
        });
      });
    });
  });
});
