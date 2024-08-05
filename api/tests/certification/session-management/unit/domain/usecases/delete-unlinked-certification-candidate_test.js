import { CertificationCandidateForbiddenDeletionError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { deleteUnlinkedCertificationCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/delete-unlinked-certification-candidate.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | delete-unlinked-certification-candidate', function () {
  let candidateId;
  let candidateRepository;

  beforeEach(async function () {
    candidateId = 'dummy certification candidate id';
    candidateRepository = {
      isNotLinked: sinon.stub(),
      remove: sinon.stub(),
    };
  });

  context('When the certification candidate is not linked to a user', function () {
    beforeEach(function () {
      candidateRepository.isNotLinked.withArgs({ id: candidateId }).resolves(true);
      candidateRepository.remove.withArgs({ id: candidateId }).resolves(true);
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

  context('When the certification candidate is linked to a user ', function () {
    beforeEach(function () {
      candidateRepository.isNotLinked.withArgs({ id: candidateId }).resolves(false);
    });

    it('should throw a forbidden deletion error', async function () {
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
