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

      const cleaBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: domainBuilder.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA_V1 }),
      });
      certificationBadgesService.findStillValidBadgeAcquisitions
        .withArgs({ userId })
        .resolves([pixPlusDroitExpertBadgeAcquisition, cleaBadgeAcquisition]);

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

      const cleaBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: domainBuilder.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA_V1 }),
      });

      certificationCandidateRepository.getWithComplementaryCertifications
        .withArgs(certificationCandidateId)
        .resolves(candidateWithComplementaryCertifications);

      certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId }).resolves([cleaBadgeAcquisition]);

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

  context('when the candidate is registered and eligible to Pix+Edu 1er Degré', function () {
    it('should return the candidate with Pix+Edu 1er Degré as eligible complementary certifications', async function () {
      // given
      const certificationCandidateId = 123;
      const userId = 456;
      const sessionId = 789;

      const pixPlusEdu1erDegreComplementaryCertification = domainBuilder.buildComplementaryCertification({
        name: ComplementaryCertification.PIX_PLUS_EDU_1ER_DEGRE,
      });
      const candidateWithComplementaryCertifications = domainBuilder.buildCertificationCandidate({
        id: certificationCandidateId,
        userId,
        sessionId,
        complementaryCertifications: [pixPlusEdu1erDegreComplementaryCertification],
      });
      certificationCandidateRepository.getWithComplementaryCertifications
        .withArgs(certificationCandidateId)
        .resolves(candidateWithComplementaryCertifications);

      const pixPlusEdu1erDegreAvanceBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: domainBuilder.buildBadge({ key: Badge.keys.PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE }),
      });
      certificationBadgesService.findStillValidBadgeAcquisitions
        .withArgs({ userId })
        .resolves([pixPlusEdu1erDegreAvanceBadgeAcquisition]);

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
          eligibleSubscriptions: [pixPlusEdu1erDegreComplementaryCertification],
          nonEligibleSubscriptions: [],
        })
      );
    });
  });

  context('when the candidate is registered and eligible to Pix+Edu 2nd Degré', function () {
    it('should return the candidate with Pix+Edu 2nd Degré as eligible complementary certifications', async function () {
      // given
      const certificationCandidateId = 123;
      const userId = 456;
      const sessionId = 789;

      const pixPlusEdu2ndDegreComplementaryCertification = domainBuilder.buildComplementaryCertification({
        name: ComplementaryCertification.PIX_PLUS_EDU_2ND_DEGRE,
      });
      const candidateWithComplementaryCertifications = domainBuilder.buildCertificationCandidate({
        id: certificationCandidateId,
        userId,
        sessionId,
        complementaryCertifications: [pixPlusEdu2ndDegreComplementaryCertification],
      });
      certificationCandidateRepository.getWithComplementaryCertifications
        .withArgs(certificationCandidateId)
        .resolves(candidateWithComplementaryCertifications);

      const pixPlusEdu2ndDegreAvanceBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: domainBuilder.buildBadge({ key: Badge.keys.PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE }),
      });
      certificationBadgesService.findStillValidBadgeAcquisitions
        .withArgs({ userId })
        .resolves([pixPlusEdu2ndDegreAvanceBadgeAcquisition]);

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
          eligibleSubscriptions: [pixPlusEdu2ndDegreComplementaryCertification],
          nonEligibleSubscriptions: [],
        })
      );
    });
  });
});
