import { expect } from 'chai';
import sinon from 'sinon';

import { updateEnrolledCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/update-enrolled-candidate.js';
import { CertificationCandidateNotFoundError } from '../../../../../../src/certification/shared/domain/errors.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | update-enrolled-candidate', function () {
  let candidateRepository;
  let candidate;

  beforeEach(function () {
    candidateRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
    candidate = domainBuilder.certification.enrolment.buildCertificationSessionCandidate({
      id: 123,
      accessibilityAdjustmentNeeded: true,
    });
    sinon.stub(DomainTransaction, 'execute');
    DomainTransaction.execute.callsFake((fn) => {
      return fn({});
    });
  });

  context('when the  candidate is found and not linked to a user', function () {
    it('should call update method with correct data', async function () {
      // given
      const foundCandidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .withParameters({
          reconciledAt: null,
          userId: null,
        })
        .build();
      candidateRepository.get.withArgs({ certificationCandidateId: candidate.id }).resolves(foundCandidate);
      candidateRepository.update.resolves();

      // when
      await updateEnrolledCandidate({
        candidate,
        candidateRepository,
      });

      // then
      expect(candidateRepository.update).to.have.been.calledOnceWithExactly(foundCandidate);
    });
  });

  context('when the candidate is not found', function () {
    it('should throw a CertificationCandidateNotFoundError', async function () {
      // given
      candidateRepository.get.withArgs({ id: 123 }).resolves(null);

      // when
      const error = await catchErr(updateEnrolledCandidate)({
        candidate,
        candidateRepository,
      });

      // then
      expect(error).to.be.instanceOf(CertificationCandidateNotFoundError);
    });
  });

  context('when the candidate is reconciled', function () {
    it('should call update method with correct data', async function () {
      // given
      const foundCandidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled({
          userId: 123,
          reconciledAt: new Date('2024-09-25'),
        })
        .withParameters({
          id: candidate.id,
          accessibilityAdjustmentNeeded: false,
        })
        .build();
      candidateRepository.get.withArgs({ certificationCandidateId: candidate.id }).resolves(foundCandidate);

      // when
      const error = await catchErr(updateEnrolledCandidate)({
        candidate,
        candidateRepository,
      });

      // then
      expect(error).to.be.instanceOf(CandidateAlreadyLinkedToUserError);
    });
  });
});
