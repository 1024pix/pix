const { expect, sinon, domainBuilder } = require('../../../test-helper');
const certificationBadgesService = require('../../../../lib/domain/services/certification-badges-service');
const certifiableBadgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/certifiable-badge-acquisition-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const badgeForCalculationRepository = require('../../../../lib/infrastructure/repositories/badge-for-calculation-repository');

describe('Unit | Service | certification-badges-service', function () {
  describe('#findStillValidBadgeAcquisitions', function () {
    const userId = 123;
    let domainTransaction, args;

    beforeEach(function () {
      domainTransaction = Symbol('domainTransaction');
      args = { userId, domainTransaction };
    });

    it('should return all still valid badge acquisitions based on highest certifiable ones', async function () {
      // given
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
      sinon
        .stub(certifiableBadgeAcquisitionRepository, 'findHighestCertifiable')
        .withArgs({ userId, domainTransaction })
        .resolves([highestBadgeAcquisition1, highestBadgeAcquisition2, highestBadgeAcquisition3]);
      sinon.stub(knowledgeElementRepository, 'findUniqByUserId').resolves([domainBuilder.buildKnowledgeElement()]);
      const getByCertifiableBadgeAcquisitionStub = sinon.stub(
        badgeForCalculationRepository,
        'getByCertifiableBadgeAcquisition'
      );
      getByCertifiableBadgeAcquisitionStub
        .withArgs({ certifiableBadgeAcquisition: highestBadgeAcquisition1 })
        .resolves(badgeStillValid1);
      getByCertifiableBadgeAcquisitionStub
        .withArgs({ certifiableBadgeAcquisition: highestBadgeAcquisition2 })
        .resolves(badgeNoMoreValid2);
      getByCertifiableBadgeAcquisitionStub
        .withArgs({ certifiableBadgeAcquisition: highestBadgeAcquisition3 })
        .resolves(badgeStillValid3);
      getByCertifiableBadgeAcquisitionStub
        .withArgs({ certifiableBadgeAcquisition: highestBadgeAcquisition4 })
        .resolves(null);

      // when
      const stillValidBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions(args);

      // then
      expect(stillValidBadgeAcquisitions).to.deepEqualArray([highestBadgeAcquisition1, highestBadgeAcquisition3]);
    });
  });
});
