import sinon from 'sinon';

import { CertificationCandidateForbiddenDeletionError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { deleteUnlinkedCertificationCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/delete-unlinked-certification-candidate.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | delete-unlinked-certification-candidate', function () {
  let candidateId;
  let candidateRepository;

  beforeEach(async function () {
    candidateId = 'dummy certification candidate id';
    candidateRepository = {
      get: sinon.stub(),
      remove: sinon.stub(),
    };
    candidateRepository.remove.withArgs({ id: candidateId }).resolves(true);
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
  });

  context('When the certification candidate is not linked to a user', function () {
    beforeEach(function () {
      candidateRepository.get
        .withArgs({ certificationCandidateId: candidateId })
        .resolves(domainBuilder.certification.enrolment.candidateBuilder().build());
    });

    it('should delete the certification candidate', async function () {
      // when
      const res = await deleteUnlinkedCertificationCandidate({
        candidateId,
        candidateRepository,
      });

      // then
      expect(res).to.deep.equal(true);
    });
  });

  context('When the certification candidate does not exist', function () {
    it('should throw an error', async function () {
      // given
      candidateRepository.get.withArgs({ certificationCandidateId: candidateId }).resolves(null);

      // when
      const error = await catchErr(deleteUnlinkedCertificationCandidate)({
        candidateId,
        candidateRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('When the certification candidate is reconciled', function () {
    it('should throw a forbidden deletion error', async function () {
      candidateRepository.get
        .withArgs({ certificationCandidateId: candidateId })
        .resolves(domainBuilder.certification.enrolment.candidateBuilder().asReconciled({ userId: 123 }).build());

      // when
      const err = await catchErr(deleteUnlinkedCertificationCandidate)({
        candidateId,
        candidateRepository,
      });

      // then
      expect(err).to.be.instanceOf(CertificationCandidateForbiddenDeletionError);
    });
  });
});
