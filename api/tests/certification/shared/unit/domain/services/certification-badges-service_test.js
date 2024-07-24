import * as certificationBadgesService from '../../../../../../src/certification/shared/domain/services/certification-badges-service.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Service | certification-badges-service', function () {
  describe('#findStillValidBadgeAcquisitions', function () {
    it('should return all still valid badge acquisitions based on highest certifiable ones', async function () {
      // given
      const userId = 123;
      const limitDate = new Date();
      const highestBadgeAcquisition1 = domainBuilder.buildCertifiableBadgeAcquisition({ badgeId: 1 });
      const highestBadgeAcquisition2 = domainBuilder.buildCertifiableBadgeAcquisition({ badgeId: 2 });
      const highestBadgeAcquisition3 = domainBuilder.buildCertifiableBadgeAcquisition({ badgeId: 3 });
      const highestBadgeAcquisition4 = domainBuilder.buildCertifiableBadgeAcquisition({ badgeId: 4 });
      const badgeStillValid1 = domainBuilder.buildBadgeForCalculation.mockObtainable({
        id: highestBadgeAcquisition1.badgeId,
      });
      const badgeNoMoreValid2 = domainBuilder.buildBadgeForCalculation.mockNotObtainable({
        id: highestBadgeAcquisition2.badgeId,
      });
      const badgeStillValid3 = domainBuilder.buildBadgeForCalculation.mockObtainable({
        id: highestBadgeAcquisition3.badgeId,
      });
      const certifiableBadgeAcquisitionRepository = {
        findHighestCertifiable: sinon.stub(),
      };
      certifiableBadgeAcquisitionRepository.findHighestCertifiable
        .withArgs({ userId, limitDate })
        .resolves([highestBadgeAcquisition1, highestBadgeAcquisition2, highestBadgeAcquisition3]);

      const knowledgeElementRepository = {
        findUniqByUserId: sinon.stub().resolves([domainBuilder.buildKnowledgeElement()]),
      };
      const badgeForCalculationRepository = {
        getByCertifiableBadgeAcquisition: sinon.stub(),
      };

      badgeForCalculationRepository.getByCertifiableBadgeAcquisition
        .withArgs({ certifiableBadgeAcquisition: highestBadgeAcquisition1 })
        .resolves(badgeStillValid1);
      badgeForCalculationRepository.getByCertifiableBadgeAcquisition
        .withArgs({ certifiableBadgeAcquisition: highestBadgeAcquisition2 })
        .resolves(badgeNoMoreValid2);
      badgeForCalculationRepository.getByCertifiableBadgeAcquisition
        .withArgs({ certifiableBadgeAcquisition: highestBadgeAcquisition3 })
        .resolves(badgeStillValid3);
      badgeForCalculationRepository.getByCertifiableBadgeAcquisition
        .withArgs({ certifiableBadgeAcquisition: highestBadgeAcquisition4 })
        .resolves(null);

      // when
      const stillValidBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
        userId,
        limitDate,
        dependencies: {
          certifiableBadgeAcquisitionRepository,
          knowledgeElementRepository,
          badgeForCalculationRepository,
        },
      });

      // then
      expect(stillValidBadgeAcquisitions).to.deepEqualArray([highestBadgeAcquisition1, highestBadgeAcquisition3]);
    });

    describe('when a highest certifiable badge is detached', function () {
      it('should not return it', async function () {
        // given
        const userId = 123;
        const limitDate = new Date();
        const highestBadgeAcquisition1 = domainBuilder.buildCertifiableBadgeAcquisition({
          badgeId: 1,
          isOutdated: true,
        });
        domainBuilder.buildBadgeForCalculation.mockObtainable({
          id: highestBadgeAcquisition1.badgeId,
        });
        const certifiableBadgeAcquisitionRepository = {
          findHighestCertifiable: sinon.stub(),
        };
        certifiableBadgeAcquisitionRepository.findHighestCertifiable
          .withArgs({ userId, limitDate })
          .resolves([highestBadgeAcquisition1]);

        const knowledgeElementRepository = {
          findUniqByUserId: sinon.stub().resolves([domainBuilder.buildKnowledgeElement()]),
        };
        const badgeForCalculationRepository = {
          getByCertifiableBadgeAcquisition: sinon.stub(),
        };

        // when
        const stillValidBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
          userId,
          limitDate,
          shouldGetOutdated: false,
          dependencies: {
            certifiableBadgeAcquisitionRepository,
            knowledgeElementRepository,
            badgeForCalculationRepository,
          },
        });

        // then
        expect(stillValidBadgeAcquisitions).to.be.empty;
        expect(badgeForCalculationRepository.getByCertifiableBadgeAcquisition).to.not.be.called;
      });
    });
  });

  describe('#findLatestBadgeAcquisitions', function () {
    it('should return all badge acquisitions based on highest certifiable ones', async function () {
      // given
      const userId = 123;
      const limitDate = new Date();
      const highestBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        badgeId: 1,
        isDetached: true,
      });
      const badgeNotValid = domainBuilder.buildBadgeForCalculation.mockObtainable({
        id: highestBadgeAcquisition.badgeId,
      });
      const certifiableBadgeAcquisitionRepository = {
        findHighestCertifiable: sinon.stub(),
      };
      certifiableBadgeAcquisitionRepository.findHighestCertifiable
        .withArgs({ userId, limitDate })
        .resolves([highestBadgeAcquisition]);

      const knowledgeElementRepository = {
        findUniqByUserId: sinon.stub().resolves([domainBuilder.buildKnowledgeElement()]),
      };
      const badgeForCalculationRepository = {
        getByCertifiableBadgeAcquisition: sinon.stub(),
      };

      badgeForCalculationRepository.getByCertifiableBadgeAcquisition
        .withArgs({ certifiableBadgeAcquisition: highestBadgeAcquisition })
        .resolves(badgeNotValid);

      // when
      const badgeAcquisitions = await certificationBadgesService.findLatestBadgeAcquisitions({
        userId,
        limitDate,
        dependencies: {
          certifiableBadgeAcquisitionRepository,
          knowledgeElementRepository,
          badgeForCalculationRepository,
        },
      });

      // then
      expect(badgeAcquisitions).to.deepEqualArray([highestBadgeAcquisition]);
    });
  });
});
