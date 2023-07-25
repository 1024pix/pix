import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import * as certificationBadgesService from '../../../../lib/domain/services/certification-badges-service.js';

describe('Unit | Service | certification-badges-service', function () {
  describe('#findStillValidBadgeAcquisitions', function () {
    it('should return all still valid badge acquisitions based on highest certifiable ones', async function () {
      // given
      const userId = 123;
      const limitDate = new Date();
      const domainTransaction = Symbol('domainTransaction');
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
        .withArgs({ userId, domainTransaction, limitDate })
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
        domainTransaction,
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
  });
});
