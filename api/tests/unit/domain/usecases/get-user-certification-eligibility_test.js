const { sinon, expect, domainBuilder } = require('../../../test-helper');
const getUserCertificationEligibility = require('../../../../lib/domain/usecases/get-user-certification-eligibility');
const CertificationEligibility = require('../../../../lib/domain/read-models/CertificationEligibility');

describe('Unit | UseCase | get-user-certification-eligibility', function() {

  let clock;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const pixPlusDroitMaitreBadgeKey = CertificationEligibility.pixPlusDroitMaitreBadgeKey;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const pixPlusDroitExpertBadgeKey = CertificationEligibility.pixPlusDroitExpertBadgeKey;
  const now = new Date(2020, 1, 1);
  const placementProfileService = {
    getPlacementProfile: () => undefined,
  };
  const certificationBadgesService = {
    findStillValidBadgeAcquisitions: () => undefined,
    hasStillValidCleaBadgeAcquisition: () => undefined,
  };

  beforeEach(function() {
    clock = sinon.useFakeTimers(now);
    placementProfileService.getPlacementProfile = sinon.stub();
    certificationBadgesService.findStillValidBadgeAcquisitions = sinon.stub();
    certificationBadgesService.hasStillValidCleaBadgeAcquisition = sinon.stub();
  });

  afterEach(function() {
    clock.restore();
  });

  context('when pix certification is not eligible', function() {

    it('should return the user certification eligibility with not eligible complementary certifications', async function() {
      // given
      const placementProfile = {
        isCertifiable: () => false,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      certificationBadgesService.hasStillValidCleaBadgeAcquisition.throws(new Error('I should not be called'));
      certificationBadgesService.findStillValidBadgeAcquisitions.throws(new Error('I should not be called'));

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      const expectedCertificationEligibility = domainBuilder.buildCertificationEligibility({
        id: 2,
        pixCertificationEligible: false,
        cleaCertificationEligible: false,
        pixPlusDroitMaitreCertificationEligible: false,
        pixPlusDroitExpertCertificationEligible: false,
      });
      expect(certificationEligibility).to.deep.equal(expectedCertificationEligibility);
    });
  });

  context('when clea badge is acquired and still valid', function() {

    it('should return the user certification eligibility with eligible clea', async function() {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      certificationBadgesService.hasStillValidCleaBadgeAcquisition.resolves(true);
      certificationBadgesService.findStillValidBadgeAcquisitions.resolves([]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.cleaCertificationEligible).to.be.true;
    });
  });

  context('when pix plus droit maitre badge is not acquired', function() {

    it('should return the user certification eligibility with not eligible pix plus droit maitre', async function() {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      certificationBadgesService.hasStillValidCleaBadgeAcquisition.resolves(false);
      const someOtherBadge = domainBuilder.buildBadge({
        key: 'someKey',
      });
      const someOtherBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: someOtherBadge,
      });
      certificationBadgesService.findStillValidBadgeAcquisitions.resolves([someOtherBadgeAcquisition]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.pixPlusDroitMaitreCertificationEligible).to.be.false;
    });
  });

  context('when pix plus droit maitre badge is acquired', function() {

    it('should return the user certification eligibility with eligible pix plus droit maitre', async function() {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      certificationBadgesService.hasStillValidCleaBadgeAcquisition.resolves(false);
      const maitreBadge = domainBuilder.buildBadge({
        key: pixPlusDroitMaitreBadgeKey,
      });
      const maitreBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: maitreBadge,
      });
      certificationBadgesService.findStillValidBadgeAcquisitions.resolves([maitreBadgeAcquisition]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.pixPlusDroitMaitreCertificationEligible).to.be.true;
    });
  });

  context('when pix plus droit expert badge is not acquired', function() {

    it('should return the user certification eligibility with not eligible pix plus droit expert', async function() {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      certificationBadgesService.hasStillValidCleaBadgeAcquisition.resolves(false);
      const someOtherBadge = domainBuilder.buildBadge({
        key: 'someKey',
      });
      const someOtherBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: someOtherBadge,
      });
      certificationBadgesService.findStillValidBadgeAcquisitions.resolves([someOtherBadgeAcquisition]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.pixPlusDroitExpertCertificationEligible).to.be.false;
    });
  });

  context('when pix plus droit expert badge is acquired', function() {

    it('should return the user certification eligibility with eligible pix plus droit expert', async function() {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      certificationBadgesService.hasStillValidCleaBadgeAcquisition.resolves(false);
      const expertBadge = domainBuilder.buildBadge({
        key: pixPlusDroitExpertBadgeKey,
      });
      const expertBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: expertBadge,
      });
      certificationBadgesService.findStillValidBadgeAcquisitions.resolves([expertBadgeAcquisition]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.pixPlusDroitExpertCertificationEligible).to.be.true;
    });
  });
});
