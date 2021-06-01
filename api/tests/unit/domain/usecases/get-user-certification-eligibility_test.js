const { sinon, expect, domainBuilder } = require('../../../test-helper');
const getUserCertificationEligibility = require('../../../../lib/domain/usecases/get-user-certification-eligibility');
const CertificationEligibility = require('../../../../lib/domain/read-models/CertificationEligibility');

describe('Unit | UseCase | get-user-certification-eligibility', () => {

  let clock;
  const cleaBadgeKey = CertificationEligibility.cleaBadgeKey;
  const pixPlusDroitMaitreBadgeKey = CertificationEligibility.pixPlusDroitMaitreBadgeKey;
  const pixPlusDroitExpertBadgeKey = CertificationEligibility.pixPlusDroitExpertBadgeKey;
  const now = new Date(2020, 1, 1);
  const placementProfileService = {
    getPlacementProfile: () => undefined,
  };
  const badgeAcquisitionRepository = {
    hasAcquiredBadge: () => undefined,
  };
  const badgeRepository = {
    getByKey: () => undefined,
  };
  const targetProfileRepository = {
    get: () => undefined,
  };
  const knowledgeElementRepository = {
    findUniqByUserId: () => undefined,
  };
  const badgeCriteriaService = {
    areBadgeCriteriaFulfilled: () => undefined,
  };
  const certificationBadgesService = {
    findStillValidBadgeAcquisitions: () => undefined,
  };

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
    placementProfileService.getPlacementProfile = sinon.stub();
    badgeAcquisitionRepository.hasAcquiredBadge = sinon.stub();
    badgeRepository.getByKey = sinon.stub();
    targetProfileRepository.get = sinon.stub();
    knowledgeElementRepository.findUniqByUserId = sinon.stub();
    badgeCriteriaService.areBadgeCriteriaFulfilled = sinon.stub();
    certificationBadgesService.findStillValidBadgeAcquisitions = sinon.stub();
  });

  afterEach(() => {
    clock.restore();
  });

  context('when pix certification is not eligible', () => {

    it('should return the user certification eligibility with not eligible complementary certifications', async () => {
      // given
      const placementProfile = {
        isCertifiable: () => false,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      badgeAcquisitionRepository.hasAcquiredBadge.throws(new Error('I should not be called'));
      certificationBadgesService.findStillValidBadgeAcquisitions.throws(new Error('I should not be called'));

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        badgeAcquisitionRepository,
        badgeRepository,
        targetProfileRepository,
        knowledgeElementRepository,
        badgeCriteriaService,
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

  context('when clea badge is not acquired', () => {

    it('should return the user certification eligibility with not eligible clea', async () => {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      badgeAcquisitionRepository.hasAcquiredBadge
        .withArgs({
          badgeKey: cleaBadgeKey,
          userId: 2,
        }).resolves(false);
      badgeRepository.getByKey.throws(new Error('I should not be called'));
      certificationBadgesService.findStillValidBadgeAcquisitions.resolves([]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        badgeAcquisitionRepository,
        badgeRepository,
        targetProfileRepository,
        knowledgeElementRepository,
        badgeCriteriaService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.cleaCertificationEligible).to.be.false;
    });
  });

  context('when clea badge is acquired', () => {

    it('should recompute the current eligibility of clea based on knowledge elements calculation', async () => {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      badgeAcquisitionRepository.hasAcquiredBadge
        .withArgs({
          badgeKey: cleaBadgeKey,
          userId: 2,
        }).resolves(true);
      const cleaBadge = domainBuilder.buildBadge({
        key: cleaBadgeKey,
        targetProfileId: 789,
      });
      badgeRepository.getByKey
        .withArgs(cleaBadgeKey)
        .resolves(cleaBadge);
      const targetProfile = domainBuilder.buildTargetProfile({ id: 789 });
      targetProfileRepository.get
        .withArgs(789)
        .resolves(targetProfile);
      const knowledgeElement = domainBuilder.buildKnowledgeElement();
      knowledgeElementRepository.findUniqByUserId
        .withArgs({
          userId: 2,
          limitDate: now,
        }).resolves([knowledgeElement]);
      badgeCriteriaService.areBadgeCriteriaFulfilled.returns('coucou');
      badgeCriteriaService.areBadgeCriteriaFulfilled
        .withArgs({
          knowledgeElements: [knowledgeElement],
          targetProfile,
          badge: cleaBadge,
        }).returns(true);
      certificationBadgesService.findStillValidBadgeAcquisitions.resolves([]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        badgeAcquisitionRepository,
        badgeRepository,
        targetProfileRepository,
        knowledgeElementRepository,
        badgeCriteriaService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.cleaCertificationEligible).to.be.true;
    });
  });

  context('when pix plus droit maitre badge is not acquired', () => {

    it('should return the user certification eligibility with not eligible pix plus droit maitre', async () => {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      badgeAcquisitionRepository.hasAcquiredBadge
        .withArgs({
          badgeKey: cleaBadgeKey,
          userId: 2,
        }).resolves(false);
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
        badgeAcquisitionRepository,
        badgeRepository,
        targetProfileRepository,
        knowledgeElementRepository,
        badgeCriteriaService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.pixPlusDroitMaitreCertificationEligible).to.be.false;
    });
  });

  context('when pix plus droit maitre badge is acquired', () => {

    it('should return the user certification eligibility with eligible pix plus droit maitre', async () => {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      badgeAcquisitionRepository.hasAcquiredBadge
        .withArgs({
          badgeKey: cleaBadgeKey,
          userId: 2,
        }).resolves(false);
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
        badgeAcquisitionRepository,
        badgeRepository,
        targetProfileRepository,
        knowledgeElementRepository,
        badgeCriteriaService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.pixPlusDroitMaitreCertificationEligible).to.be.true;
    });
  });

  context('when pix plus droit expert badge is not acquired', () => {

    it('should return the user certification eligibility with not eligible pix plus droit expert', async () => {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      badgeAcquisitionRepository.hasAcquiredBadge
        .withArgs({
          badgeKey: cleaBadgeKey,
          userId: 2,
        }).resolves(false);
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
        badgeAcquisitionRepository,
        badgeRepository,
        targetProfileRepository,
        knowledgeElementRepository,
        badgeCriteriaService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.pixPlusDroitExpertCertificationEligible).to.be.false;
    });
  });

  context('when pix plus droit expert badge is acquired', () => {

    it('should return the user certification eligibility with eligible pix plus droit expert', async () => {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile
        .withArgs({ userId: 2, limitDate: now })
        .resolves(placementProfile);
      badgeAcquisitionRepository.hasAcquiredBadge
        .withArgs({
          badgeKey: cleaBadgeKey,
          userId: 2,
        }).resolves(false);
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
        badgeAcquisitionRepository,
        badgeRepository,
        targetProfileRepository,
        knowledgeElementRepository,
        badgeCriteriaService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.pixPlusDroitExpertCertificationEligible).to.be.true;
    });
  });
});
