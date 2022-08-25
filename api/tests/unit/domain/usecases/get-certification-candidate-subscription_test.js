const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getCertificationCandidateSubscription = require('../../../../lib/domain/usecases/get-certification-candidate-subscription');

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

  context('when the candidate is registered and eligible to one complementary certification', function () {
    it('should return the candidate with one eligible complementary certification', async function () {
      // given
      const certificationCandidateId = 123;
      const userId = 456;
      const sessionId = 789;

      const complementaryCertification = domainBuilder.buildComplementaryCertification({ key: 'PIX+' });

      const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        badge: domainBuilder.buildBadge({
          key: 'PIX+_BADGE',
          isCertifiable: true,
        }),
        complementaryCertification,
      });

      const candidateWithComplementaryCertifications = domainBuilder.buildCertificationCandidate({
        id: certificationCandidateId,
        userId,
        sessionId,
        complementaryCertifications: [complementaryCertification],
      });
      certificationCandidateRepository.getWithComplementaryCertifications
        .withArgs(certificationCandidateId)
        .resolves(candidateWithComplementaryCertifications);

      certificationBadgesService.findStillValidBadgeAcquisitions
        .withArgs({ userId })
        .resolves([certifiableBadgeAcquisition]);

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
          eligibleSubscriptions: [complementaryCertification],
          nonEligibleSubscriptions: [],
        })
      );
    });
  });

  context('when the candidate is registered and not eligible to a given complementary certification', function () {
    it('should return the candidate with one non eligible complementary certification', async function () {
      // given
      const certificationCandidateId = 123;
      const userId = 456;
      const sessionId = 789;

      const complementaryCertification = domainBuilder.buildComplementaryCertification({ key: 'PIX+' });

      const candidateWithComplementaryCertifications = domainBuilder.buildCertificationCandidate({
        id: certificationCandidateId,
        userId,
        sessionId,
        complementaryCertifications: [complementaryCertification],
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
          nonEligibleSubscriptions: [complementaryCertification],
        })
      );
    });
  });

  context('when the candidate is not registered but eligible to one complementary certification', function () {
    it('should return the candidate without any complementary certification', async function () {
      // given
      const certificationCandidateId = 123;
      const userId = 456;
      const sessionId = 789;

      const complementaryCertification = domainBuilder.buildComplementaryCertification({ key: 'PIX+' });

      const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        badge: domainBuilder.buildBadge({
          key: 'PIX+_BADGE',
          isCertifiable: true,
        }),
        complementaryCertification,
      });

      const candidateWithoutComplementaryCertifications = domainBuilder.buildCertificationCandidate({
        id: certificationCandidateId,
        userId,
        sessionId,
        complementaryCertifications: [],
      });
      certificationCandidateRepository.getWithComplementaryCertifications
        .withArgs(certificationCandidateId)
        .resolves(candidateWithoutComplementaryCertifications);

      certificationBadgesService.findStillValidBadgeAcquisitions
        .withArgs({ userId })
        .resolves([certifiableBadgeAcquisition]);

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

  context('when the candidate is registered to several complementary certifications', function () {
    context('when the candidate is eligible to only one complementary certification', function () {
      it('should return the candidate with one eligible and one non eligible complementary certifications', async function () {
        // given
        const certificationCandidateId = 123;
        const userId = 456;
        const sessionId = 789;

        const complementaryCertification1 = domainBuilder.buildComplementaryCertification({ key: 'PIX+1' });
        const complementaryCertification2 = domainBuilder.buildComplementaryCertification({ key: 'PIX+2' });

        const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
          badge: domainBuilder.buildBadge({
            key: 'PIX+_BADGE',
            isCertifiable: true,
          }),
          complementaryCertification: complementaryCertification1,
        });

        const candidateWithComplementaryCertifications = domainBuilder.buildCertificationCandidate({
          id: certificationCandidateId,
          userId,
          sessionId,
          complementaryCertifications: [complementaryCertification1, complementaryCertification2],
        });
        certificationCandidateRepository.getWithComplementaryCertifications
          .withArgs(certificationCandidateId)
          .resolves(candidateWithComplementaryCertifications);

        certificationBadgesService.findStillValidBadgeAcquisitions
          .withArgs({ userId })
          .resolves([certifiableBadgeAcquisition]);

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
            eligibleSubscriptions: [complementaryCertification1],
            nonEligibleSubscriptions: [complementaryCertification2],
          })
        );
      });
    });
  });
});
