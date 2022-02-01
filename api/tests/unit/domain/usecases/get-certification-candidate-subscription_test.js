const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getCertificationCandidateSubscription = require('../../../../lib/domain/usecases/get-certification-candidate-subscription');
const ComplementaryCertification = require('../../../../lib/domain/models/ComplementaryCertification');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Unit | UseCase | get-certification-candidate-subscription', function () {
  let certificationBadgesService;
  let certificationCandidateRepository;

  beforeEach(function () {
    certificationBadgesService = {
      findStillValidBadgeAcquisitions: sinon.stub(),
      hasStillValidCleaBadgeAcquisition: sinon.stub(),
    };
    certificationCandidateRepository = {
      getWithComplementaryCertifications: sinon.stub(),
    };
  });

  context('when the candidate is registered and eligible to both Pix+ Droit and CléA', function () {
    it('should return the candidate with both Pix+ Droit and CléA as eligible complementary certifications', async function () {
      // given
      const certificationCandidateId = 123;
      const userId = 456;
      const sessionId = 789;

      const pixPlusDroitComplementaryCertification = domainBuilder.buildComplementaryCertification({
        name: ComplementaryCertification.PIX_PLUS_DROIT,
      });
      const cleaComplementaryCertifications = domainBuilder.buildComplementaryCertification({
        name: ComplementaryCertification.CLEA,
      });
      const candidateWithComplementaryCertifications = domainBuilder.buildCertificationCandidate({
        id: certificationCandidateId,
        userId,
        sessionId,
        complementaryCertifications: [pixPlusDroitComplementaryCertification, cleaComplementaryCertifications],
      });
      certificationCandidateRepository.getWithComplementaryCertifications
        .withArgs(certificationCandidateId)
        .resolves(candidateWithComplementaryCertifications);

      const pixPlusDroitExpertBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: domainBuilder.buildBadge({ key: Badge.keys.PIX_DROIT_EXPERT_CERTIF }),
      });
      certificationBadgesService.findStillValidBadgeAcquisitions
        .withArgs({ userId })
        .resolves([pixPlusDroitExpertBadgeAcquisition]);

      certificationBadgesService.hasStillValidCleaBadgeAcquisition.withArgs({ userId }).resolves(true);

      // when
      const certificationCandidateSubscription = await getCertificationCandidateSubscription({
        certificationCandidateId,
        certificationBadgesService,
        certificationCandidateRepository,
      });

      // then
      expect(certificationCandidateSubscription).to.deep.equal(
        domainBuilder.buildCertificationCandidateSubscription({
          id: certificationCandidateId,
          sessionId,
          eligibleSubscriptions: [pixPlusDroitComplementaryCertification, cleaComplementaryCertifications],
          nonEligibleSubscriptions: [],
        })
      );
    });
  });

  context('when the candidate is registered to both Pix+ Droit and CléA but he is not eligible to both', function () {
    it('should return the candidate with both Pix+ Droit and CléA as non eligible complementary certifications', async function () {
      // given
      const certificationCandidateId = 123;
      const userId = 456;
      const sessionId = 789;

      const pixPlusDroitComplementaryCertification = domainBuilder.buildComplementaryCertification({
        name: ComplementaryCertification.PIX_PLUS_DROIT,
      });
      const cleaComplementaryCertifications = domainBuilder.buildComplementaryCertification({
        name: ComplementaryCertification.CLEA,
      });
      const candidateWithComplementaryCertifications = domainBuilder.buildCertificationCandidate({
        id: certificationCandidateId,
        userId,
        sessionId,
        complementaryCertifications: [pixPlusDroitComplementaryCertification, cleaComplementaryCertifications],
      });
      certificationCandidateRepository.getWithComplementaryCertifications
        .withArgs(certificationCandidateId)
        .resolves(candidateWithComplementaryCertifications);

      certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId }).resolves([]);

      certificationBadgesService.hasStillValidCleaBadgeAcquisition.withArgs({ userId }).resolves(false);

      // when
      const certificationCandidateSubscription = await getCertificationCandidateSubscription({
        certificationCandidateId,
        certificationBadgesService,
        certificationCandidateRepository,
      });

      // then
      expect(certificationCandidateSubscription).to.deep.equal(
        domainBuilder.buildCertificationCandidateSubscription({
          id: certificationCandidateId,
          sessionId,
          eligibleSubscriptions: [],
          nonEligibleSubscriptions: [pixPlusDroitComplementaryCertification, cleaComplementaryCertifications],
        })
      );
    });
  });

  context('when the candidate is not registered to both Pix+ Droit and CléA but he is eligible to both', function () {
    it('should return the candidate without complementary certifications', async function () {
      // given
      const certificationCandidateId = 123;
      const userId = 456;
      const sessionId = 789;

      const candidateWithoutComplementaryCertifications = domainBuilder.buildCertificationCandidate({
        id: certificationCandidateId,
        userId,
        sessionId,
        complementaryCertifications: [],
      });
      certificationCandidateRepository.getWithComplementaryCertifications
        .withArgs(certificationCandidateId)
        .resolves(candidateWithoutComplementaryCertifications);

      // when
      const certificationCandidateSubscription = await getCertificationCandidateSubscription({
        certificationCandidateId,
        certificationBadgesService,
        certificationCandidateRepository,
      });

      // then
      expect(certificationCandidateSubscription).to.deep.equal(
        domainBuilder.buildCertificationCandidateSubscription({
          id: certificationCandidateId,
          sessionId,
          eligibleSubscriptions: [],
          nonEligibleSubscriptions: [],
        })
      );
    });
  });

  context('when the candidate is registered to both Pix+ Droit and CléA but he is eligible to only one', function () {
    it('should return the candidate with Pix+ Droit as non eligible and CléA as eligible', async function () {
      // given
      const certificationCandidateId = 123;
      const userId = 456;
      const sessionId = 789;

      const pixPlusDroitComplementaryCertification = domainBuilder.buildComplementaryCertification({
        name: ComplementaryCertification.PIX_PLUS_DROIT,
      });
      const cleaComplementaryCertifications = domainBuilder.buildComplementaryCertification({
        name: ComplementaryCertification.CLEA,
      });
      const candidateWithComplementaryCertifications = domainBuilder.buildCertificationCandidate({
        id: certificationCandidateId,
        userId,
        sessionId,
        complementaryCertifications: [pixPlusDroitComplementaryCertification, cleaComplementaryCertifications],
      });
      certificationCandidateRepository.getWithComplementaryCertifications
        .withArgs(certificationCandidateId)
        .resolves(candidateWithComplementaryCertifications);

      certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId }).resolves([]);

      certificationBadgesService.hasStillValidCleaBadgeAcquisition.withArgs({ userId }).resolves(true);

      // when
      const certificationCandidateSubscription = await getCertificationCandidateSubscription({
        certificationCandidateId,
        certificationBadgesService,
        certificationCandidateRepository,
      });

      // then
      expect(certificationCandidateSubscription).to.deep.equal(
        domainBuilder.buildCertificationCandidateSubscription({
          id: certificationCandidateId,
          sessionId,
          eligibleSubscriptions: [cleaComplementaryCertifications],
          nonEligibleSubscriptions: [pixPlusDroitComplementaryCertification],
        })
      );
    });
  });
});
