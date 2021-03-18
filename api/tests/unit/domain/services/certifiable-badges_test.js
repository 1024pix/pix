const { expect, sinon, domainBuilder } = require('../../../test-helper');
const certifiableBadgesService = require('../../../../lib/domain/services/certifiable-badges');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');

describe('Unit | Domain | Service | Certifiable Badges', function() {
  const userIdWithCertifiableBadges = 'userId1';
  const userIdWithoutCertifiableBadges = 'userId2';
  let targetProfileId1, targetProfileId2;

  beforeEach(async () => {
    targetProfileId1 = 'targetProfileId1';
    targetProfileId2 = 'targetProfileId2';
    const badge1 = domainBuilder.buildBadge({ isCertifiable: true, targetProfileId: targetProfileId1 });
    const badge2 = domainBuilder.buildBadge({ isCertifiable: true, targetProfileId: targetProfileId2 });
    const badge3 = domainBuilder.buildBadge({ isCertifiable: true, targetProfileId: targetProfileId2 });
    const badgeAcquisition1 = domainBuilder.buildBadgeAcquisition({ badgeId: badge1.id });
    const badgeAcquisition2 = domainBuilder.buildBadgeAcquisition({ badgeId: badge2.id });
    const badgeAcquisition3 = domainBuilder.buildBadgeAcquisition({ badgeId: badge3.id });
    badgeAcquisition1.badge = badge1;
    badgeAcquisition2.badge = badge2;
    badgeAcquisition3.badge = badge3;

    // given
    const findCertifiableStub = sinon.stub(badgeAcquisitionRepository, 'findCertifiable');
    findCertifiableStub.withArgs({ userId: userIdWithoutCertifiableBadges }).resolves([]);
    findCertifiableStub.withArgs({ userId: userIdWithCertifiableBadges }).resolves([badgeAcquisition1, badgeAcquisition2, badgeAcquisition3]);
  });

  describe('#hasCertifiableBadges', () => {

    it('should return true when user has certifiable badges', async () => {
      // when
      const hasCertifiableBadge = await certifiableBadgesService.hasCertifiableBadges(userIdWithCertifiableBadges);

      // then
      expect(hasCertifiableBadge).to.be.true;
    });

    it('should return false when user has no certifiable badges', async () => {
      // when
      const hasCertifiableBadge = await certifiableBadgesService.hasCertifiableBadges(userIdWithoutCertifiableBadges);

      // then
      expect(hasCertifiableBadge).to.be.false;
    });
  });

  describe('#getTargetProfileIdFromAcquiredCertifiableBadges', () => {

    it('should return an array with the list of unique targetProfileId', async () => {
      // when
      const targetProfileIds = await certifiableBadgesService.getTargetProfileIdFromAcquiredCertifiableBadges(userIdWithCertifiableBadges);

      // then
      expect(targetProfileIds).to.deep.equal([targetProfileId1, targetProfileId2]);
    });

    it('should return an empty array when user has no certifiable badges', async () => {
      // when
      const targetProfileIds = await certifiableBadgesService.getTargetProfileIdFromAcquiredCertifiableBadges(userIdWithoutCertifiableBadges);

      // then
      expect(targetProfileIds).to.deep.equal([]);
    });
  });
});

