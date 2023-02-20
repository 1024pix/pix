import { expect, sinon, domainBuilder } from '../../../test-helper';
import getCertificationCandidateSubscription from '../../../../lib/domain/usecases/get-certification-candidate-subscription';

describe('Unit | UseCase | get-certification-candidate-subscription', function () {
  let certificationBadgesService;
  let certificationCandidateRepository;
  let certificationCenterRepository;

  beforeEach(function () {
    certificationBadgesService = {
      findStillValidBadgeAcquisitions: sinon.stub(),
    };
    certificationCandidateRepository = {
      getWithComplementaryCertifications: sinon.stub(),
    };

    certificationCenterRepository = {
      getBySessionId: sinon.stub(),
    };
  });

  context('when certification center is not habilitated', function () {
    context('when the candidate is registered and eligible to one complementary certification', function () {
      it('should return the candidate without eligible complementary certification', async function () {
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

        const certificationCenter = domainBuilder.buildCertificationCenter({
          habilitations: [],
        });

        certificationCandidateRepository.getWithComplementaryCertifications
          .withArgs(certificationCandidateId)
          .resolves(candidateWithComplementaryCertifications);

        certificationCenterRepository.getBySessionId.withArgs(sessionId).resolves(certificationCenter);

        certificationBadgesService.findStillValidBadgeAcquisitions
          .withArgs({ userId })
          .resolves([certifiableBadgeAcquisition]);

        // when
        const certificationCandidateSubscription = await getCertificationCandidateSubscription({
          certificationCandidateId,
          certificationBadgesService,
          certificationCandidateRepository,
          certificationCenterRepository,
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
  });

  context('when certification center is habilitated', function () {
    context('when the candidate is not registered but eligible to one complementary certification', function () {
      it('should return the candidate without any complementary certification', async function () {
        // given
        const certificationCandidateId = 123;
        const userId = 456;
        const sessionId = 789;

        const complementaryCertification = domainBuilder.buildComplementaryCertification({ key: 'PIX+' });

        const certificationCenter = domainBuilder.buildCertificationCenter({
          habilitations: [complementaryCertification],
        });

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

        certificationCenterRepository.getBySessionId.withArgs(sessionId).resolves(certificationCenter);

        certificationBadgesService.findStillValidBadgeAcquisitions
          .withArgs({ userId })
          .resolves([certifiableBadgeAcquisition]);

        // when
        const certificationCandidateSubscription = await getCertificationCandidateSubscription({
          certificationCandidateId,
          certificationBadgesService,
          certificationCandidateRepository,
          certificationCenterRepository,
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

          const certificationCenter = domainBuilder.buildCertificationCenter({
            habilitations: [complementaryCertification1, complementaryCertification2],
          });

          const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
            badgeKey: 'PIX+_BADGE',
            complementaryCertificationKey: complementaryCertification1.key,
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

          certificationCenterRepository.getBySessionId.withArgs(sessionId).resolves(certificationCenter);

          certificationBadgesService.findStillValidBadgeAcquisitions
            .withArgs({ userId })
            .resolves([certifiableBadgeAcquisition]);

          // when
          const certificationCandidateSubscription = await getCertificationCandidateSubscription({
            certificationCandidateId,
            certificationBadgesService,
            certificationCandidateRepository,
            certificationCenterRepository,
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
});
