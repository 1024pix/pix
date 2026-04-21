import sinon from 'sinon';

import { getCertificationCandidateSubscription } from '../../../../../../src/certification/enrolment/domain/usecases/get-certification-candidate-subscription.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | Domain | UseCase | get-certification-candidate-subscription', function () {
  let certificationBadgesService;
  let certificationCandidateRepository;
  let certificationCenterRepository;
  let certificationCandidateData;
  const certificationCandidateId = 123;
  const userId = 456;
  const sessionId = 789;

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

    certificationCandidateData = {
      id: certificationCandidateId,
      userId,
      sessionId,
      subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
      reconciledAt: new Date('2024-10-09'),
    };
  });

  context('when the candidate is not enrolled to any complementary certification', function () {
    it('returns an empty certification candidate subscription', async function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        ...certificationCandidateData,
        complementaryCertification: null,
        subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId })],
      });

      certificationCandidateRepository.getWithComplementaryCertification
        .withArgs({ id: certificationCandidateId })
        .resolves(certificationCandidate);

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
          nonEligibleSubscription: null,
          sessionVersion: 2,
        }),
      );
    });
  });

  context('when the candidate is enrolled to a "simple" complementary certification', function () {
    it('returns an empty certification candidate subscription', async function () {
      // given
      const complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification({
        key: 'PIX+SOMETHING',
      });

      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        ...certificationCandidateData,
        complementaryCertification,
        subscriptions: [
          domainBuilder.certification.enrolment.buildComplementarySubscription({
            certificationCandidateId,
            complementaryCertificationId: complementaryCertification.id,
          }),
        ],
      });

      certificationCandidateRepository.getWithComplementaryCertification
        .withArgs({ id: certificationCandidateId })
        .resolves(certificationCandidate);

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
          nonEligibleSubscription: null,
          sessionVersion: 2,
        }),
      );
    });
  });

  context('when the candidate is enrolled to a double certification', function () {
    context('when the center is not habilitated for the candidate complementary certification', function () {
      it('returns an empty certification candidate subscription', async function () {
        // given
        const complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification({
          key: ComplementaryCertificationKeys.CLEA,
        });

        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          ...certificationCandidateData,
          complementaryCertification,
          subscriptions: [
            domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId }),
            domainBuilder.certification.enrolment.buildComplementarySubscription({
              certificationCandidateId,
              complementaryCertificationId: complementaryCertification.id,
            }),
          ],
        });

        const center = domainBuilder.certification.enrolment.buildCenter({
          habilitations: [],
        });

        certificationCandidateRepository.getWithComplementaryCertification
          .withArgs({ id: certificationCandidateId })
          .resolves(certificationCandidate);

        certificationCenterRepository.getBySessionId
          .withArgs({ sessionId: certificationCandidate.sessionId })
          .resolves(center);

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
            nonEligibleSubscription: null,
            sessionVersion: 2,
          }),
        );
      });
    });

    context('but did not get the associated badge', function () {
      it('returns an uneligible double certification candidate subscription', async function () {
        // given
        const complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification({
          key: ComplementaryCertificationKeys.CLEA,
        });

        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          ...certificationCandidateData,
          complementaryCertification,
          subscriptions: [
            domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId }),
            domainBuilder.certification.enrolment.buildComplementarySubscription({
              certificationCandidateId,
              complementaryCertificationId: complementaryCertification.id,
            }),
          ],
        });

        const center = domainBuilder.certification.enrolment.buildCenter({
          habilitations: [complementaryCertification],
        });

        certificationCandidateRepository.getWithComplementaryCertification
          .withArgs({ id: certificationCandidateId })
          .resolves(certificationCandidate);

        certificationCenterRepository.getBySessionId
          .withArgs({ sessionId: certificationCandidate.sessionId })
          .resolves(center);

        certificationBadgesService.findStillValidBadgeAcquisitions
          .withArgs({ userId, limitDate: certificationCandidate.reconciledAt })
          .resolves([]);

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
            enrolledDoubleCertificationLabel: 'Complementary certification name',
            doubleCertificationEligibility: false,
          }),
        );
      });
    });

    context('and got the associated badge', function () {
      it('returns an eligible double certification candidate subscription', async function () {
        // given
        const complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification({
          key: ComplementaryCertificationKeys.CLEA,
        });

        const badge = domainBuilder.buildBadge({
          key: ComplementaryCertificationKeys.CLEA,
          isCertifiable: true,
        });

        const complementaryCertificationBadge =
          domainBuilder.certification.complementaryCertification.buildComplementaryCertificationBadge({
            badgeId: badge.id,
            complementaryCertificationId: complementaryCertification.id,
          });

        const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
          badgeId: badge.id,
          badgeKey: badge.key,
          complementaryCertificationId: complementaryCertification.id,
          complementaryCertificationKey: complementaryCertification.key,
          complementaryCertificationBadgeId: complementaryCertificationBadge.id,
        });

        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          ...certificationCandidateData,
          complementaryCertification,
          subscriptions: [
            domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId }),
            domainBuilder.certification.enrolment.buildComplementarySubscription({
              certificationCandidateId,
              complementaryCertificationId: complementaryCertification.id,
            }),
          ],
        });

        const center = domainBuilder.certification.enrolment.buildCenter({
          habilitations: [complementaryCertification],
        });

        certificationCandidateRepository.getWithComplementaryCertification
          .withArgs({ id: certificationCandidateId })
          .resolves(certificationCandidate);

        certificationCenterRepository.getBySessionId
          .withArgs({ sessionId: certificationCandidate.sessionId })
          .resolves(center);

        certificationBadgesService.findStillValidBadgeAcquisitions
          .withArgs({ userId, limitDate: certificationCandidate.reconciledAt })
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
            enrolledDoubleCertificationLabel: 'Complementary certification name',
            doubleCertificationEligibility: true,
          }),
        );
      });
    });
  });
});
