import sinon from 'sinon';

import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { getCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/get-candidate.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | UseCase | get-candidate', function () {
  let candidateRepository;
  let certificationBadgesService;
  let certificationCenterRepository;

  beforeEach(function () {
    candidateRepository = { get: sinon.stub() };
    certificationBadgesService = { findStillValidBadgeAcquisitions: sinon.stub() };
    certificationCenterRepository = { getBySessionId: sinon.stub() };
  });

  it('should return the candidate by id', async function () {
    // given
    const candidate = domainBuilder.certification.enrolment.buildCandidate({ id: 1234, subscription: Frameworks.CORE });
    candidateRepository.get.withArgs({ certificationCandidateId: 1234 }).resolves(candidate);

    // when
    const result = await getCandidate({
      certificationCandidateId: 1234,
      candidateRepository,
      certificationBadgesService,
      certificationCenterRepository,
    });

    // then
    expect(result).to.be.instanceOf(Candidate);
    expect(result.id).to.equal(1234);
  });

  context('when the candidate is not registered to double certification', function () {
    it('should set doubleCertificationEligibility to false', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({ subscription: Frameworks.CORE });
      candidateRepository.get.resolves(candidate);

      // when
      const result = await getCandidate({
        certificationCandidateId: candidate.id,
        candidateRepository,
        certificationBadgesService,
        certificationCenterRepository,
      });

      // then
      expect(result.doubleCertificationEligibility).to.be.false;
      sinon.assert.notCalled(certificationCenterRepository.getBySessionId);
    });
  });

  context('when the candidate is registered to double certification', function () {
    context('when the center is not habilitated', function () {
      it('should set doubleCertificationEligibility to false', async function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          subscription: Frameworks.CLEA,
          userId: 456,
          sessionId: 789,
          reconciledAt: new Date(),
        });
        const center = domainBuilder.certification.enrolment.buildCenter({ habilitations: [] });
        candidateRepository.get.resolves(candidate);
        certificationCenterRepository.getBySessionId.withArgs({ sessionId: 789 }).resolves(center);

        // when
        const result = await getCandidate({
          certificationCandidateId: candidate.id,
          candidateRepository,
          certificationBadgesService,
          certificationCenterRepository,
        });

        // then
        expect(result.doubleCertificationEligibility).to.be.false;
        sinon.assert.notCalled(certificationBadgesService.findStillValidBadgeAcquisitions);
      });
    });

    context('when the center is habilitated', function () {
      context('when the candidate has no valid badge', function () {
        it('should set doubleCertificationEligibility to false', async function () {
          // given
          const reconciledAt = new Date();
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            subscription: Frameworks.CLEA,
            userId: 456,
            sessionId: 789,
            reconciledAt,
          });
          const habilitation = domainBuilder.certification.shared.buildComplementaryCertification({
            key: Frameworks.CLEA,
          });
          const center = domainBuilder.certification.enrolment.buildCenter({ habilitations: [habilitation] });
          candidateRepository.get.resolves(candidate);
          certificationCenterRepository.getBySessionId.withArgs({ sessionId: 789 }).resolves(center);
          certificationBadgesService.findStillValidBadgeAcquisitions
            .withArgs({ userId: 456, limitDate: reconciledAt })
            .resolves([]);

          // when
          const result = await getCandidate({
            certificationCandidateId: candidate.id,
            candidateRepository,
            certificationBadgesService,
            certificationCenterRepository,
          });

          // then
          expect(result.doubleCertificationEligibility).to.be.false;
        });
      });

      context('when the candidate has a valid badge matching their subscription', function () {
        it('should set doubleCertificationEligibility to true', async function () {
          // given
          const reconciledAt = new Date();
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            subscription: Frameworks.CLEA,
            userId: 456,
            sessionId: 789,
            reconciledAt,
          });
          const habilitation = domainBuilder.certification.shared.buildComplementaryCertification({
            key: Frameworks.CLEA,
          });
          const center = domainBuilder.certification.enrolment.buildCenter({ habilitations: [habilitation] });
          const badgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
            complementaryCertificationKey: Frameworks.CLEA,
          });
          candidateRepository.get.resolves(candidate);
          certificationCenterRepository.getBySessionId.withArgs({ sessionId: 789 }).resolves(center);
          certificationBadgesService.findStillValidBadgeAcquisitions
            .withArgs({ userId: 456, limitDate: reconciledAt })
            .resolves([badgeAcquisition]);

          // when
          const result = await getCandidate({
            certificationCandidateId: candidate.id,
            candidateRepository,
            certificationBadgesService,
            certificationCenterRepository,
          });

          // then
          expect(result.doubleCertificationEligibility).to.be.true;
        });
      });
    });
  });
});
