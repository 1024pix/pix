import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { getCertificationCandidateSubscription } from '../../../../lib/shared/domain/usecases/get-certification-candidate-subscription.js';

describe('Unit | UseCase | get-certification-candidate-subscription', function () {
  let certificationBadgesService;
  let certificationCandidateRepository;
  let certificationCenterRepository;

  beforeEach(function () {
    certificationBadgesService = {
      findStillValidBadgeAcquisitions: sinon.stub(),
    };
    certificationCandidateRepository = {
      getWithComplementaryCertification: sinon.stub(),
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

        const candidateWithComplementaryCertification = domainBuilder.buildCertificationCandidate({
          id: certificationCandidateId,
          userId,
          sessionId,
          complementaryCertification,
        });

        const certificationCenter = domainBuilder.buildCertificationCenter({
          habilitations: [],
        });

        certificationCandidateRepository.getWithComplementaryCertification
          .withArgs(certificationCandidateId)
          .resolves(candidateWithComplementaryCertification);

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
            eligibleSubscription: null,
            nonEligibleSubscription: null,
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

        const candidateWithoutComplementaryCertification = domainBuilder.buildCertificationCandidate({
          id: certificationCandidateId,
          userId,
          sessionId,
          complementaryCertification: null,
        });
        certificationCandidateRepository.getWithComplementaryCertification
          .withArgs(certificationCandidateId)
          .resolves(candidateWithoutComplementaryCertification);

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
            eligibleSubscription: null,
            nonEligibleSubscription: null,
          })
        );
      });
    });
  });
});
