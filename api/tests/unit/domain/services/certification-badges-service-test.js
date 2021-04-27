const { expect, sinon } = require('../../../test-helper');
const certificationBadgesService = require('./../../../../lib/domain/services/certification-badges-service');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');

describe('Unit | Service | Certification Badges Service', () => {

  describe('#findStillAcquiredBadgeAcquisitions', () => {

    beforeEach(() => {
      sinon.stub(badgeAcquisitionRepository, 'findCertifiable');
    });

    context('has no certifiable badges', () => {
      it('should return []', async () => {
        // given
        const userId = 12;
        const domainTransaction = Symbol('someDomainTransaction');
        badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([]);

        // when
        const badgesAcquisitions = await certificationBadgesService.findStillAcquiredBadgeAcquisitions({ userId, domainTransaction });

        // then
        expect(badgesAcquisitions).to.deep.equal([]);
      });
    });

    context('has certifiable badges but not from pix+droit', () => {
      it('should return their badge-acquisitions', async () => {
        // given
        const userId = 12;
        const domainTransaction = Symbol('someDomainTransaction');
        const badgeAcquisition = { id: 'badgeId', userId };
        badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([badgeAcquisition]);

        // when
        const badgesAcquisitions = await certificationBadgesService.findStillAcquiredBadgeAcquisitions({ userId, domainTransaction });

        // then
        expect(badgesAcquisitions).to.deep.equal([badgeAcquisition]);
      });
    });

    context('has certifiable badges including pix+droit', () => {
      const pixDroitMaitre = 'PIX_DROIT_MAITRE_CERTIF';
      const pixDroitExpert = 'PIX_DROIT_EXPERT_CERTIF';

      context('has maitreBadgeAcquisition', () => {

        it('should return badge-acquisitions with maitreBadgeAcquisition', async () => {
          // given
          const userId = 12;
          const domainTransaction = Symbol('someDomainTransaction');
          const maitreBadgeAcquisition = { id: 'badgeId1', userId, badgeKey: pixDroitMaitre };
          const otherBadgeAcquisition = { id: 'badgeId2', userId };
          badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([maitreBadgeAcquisition, otherBadgeAcquisition]);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillAcquiredBadgeAcquisitions({ userId, domainTransaction });

          // then
          expect(badgesAcquisitions).to.deep.equal([otherBadgeAcquisition, maitreBadgeAcquisition]);
        });
      });

      context('has maitreBadgeAcquisition and expertBadgeAcquisition', () => {

        it('should return badge-acquisitions with expertBadgeAcquisition', async () => {
          // given
          const userId = 12;
          const domainTransaction = Symbol('someDomainTransaction');
          const maitreBadgeAcquisition = { id: 'badgeId1', userId, badgeKey: pixDroitMaitre };
          const expertBadgeAcquisition = { id: 'badgeId2', userId, badgeKey: pixDroitExpert };
          badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([maitreBadgeAcquisition, expertBadgeAcquisition]);

          // when
          const badgesAcquisitions = await certificationBadgesService.findStillAcquiredBadgeAcquisitions({ userId, domainTransaction });

          // then
          expect(badgesAcquisitions).to.deep.equal([expertBadgeAcquisition]);
        });
      });
    });
  });
});
