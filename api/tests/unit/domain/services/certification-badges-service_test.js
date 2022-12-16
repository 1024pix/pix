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
      const badge1 = domainBuilder.buildBadge({ id: 1 });
      const badge2 = domainBuilder.buildBadge({ id: 2 });
      const badge3 = domainBuilder.buildBadge({ id: 3 });
      const badge4 = domainBuilder.buildBadge({ id: 4 });
      const highestBadgeAcquisition1 = domainBuilder.buildCertifiableBadgeAcquisition({ badge: badge1 });
      const highestBadgeAcquisition2 = domainBuilder.buildCertifiableBadgeAcquisition({ badge: badge2 });
      const highestBadgeAcquisition3 = domainBuilder.buildCertifiableBadgeAcquisition({ badge: badge3 });
      const highestBadgeAcquisition4 = domainBuilder.buildCertifiableBadgeAcquisition({ badge: badge4 });
      const badgeStillValid1 = domainBuilder.buildBadgeForCalculation.mockObtainable({
        id: badge1.id,
      });
      const badgeNoMoreValid2 = domainBuilder.buildBadgeForCalculation.mockNotObtainable({
        id: badge2.id,
      });
      const badgeStillValid3 = domainBuilder.buildBadgeForCalculation.mockObtainable({
        id: badge3.id,
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
