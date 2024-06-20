import { CertificationCandidateNotFoundError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { candidateHasSeenCertificationInstructions } from '../../../../../../src/certification/enrolment/domain/usecases/candidate-has-seen-certification-instructions.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | candidate-has-seen-certification-instructions', function () {
  let candidateRepository;

  beforeEach(function () {
    candidateRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
  });

  context('when the candidate is found', function () {
    it('should return updated candidate', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCertificationSessionCandidate({
        id: 187,
        hasSeenCertificationInstructions: false,
      });
      const expectedUpdatedCandidate = new Candidate({ id: 187, hasSeenCertificationInstructions: true });
      candidateRepository.get.withArgs({ certificationCandidateId: 187 }).resolves(candidate);
      candidateRepository.update.withArgs(candidate).resolves(expectedUpdatedCandidate);

      // when
      const updatedCandidate = await candidateHasSeenCertificationInstructions({
        certificationCandidateId: 187,
        candidateRepository,
      });

      // then
      expect(updatedCandidate).to.deep.equal(expectedUpdatedCandidate);
    });

    context('when no candidate is found', function () {
      it('should throw an CertificationCandidateNotFoundError', async function () {
        // given
        // when
        const error = await catchErr(candidateHasSeenCertificationInstructions)({
          certificationCandidateId: 1,
          candidateRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(CertificationCandidateNotFoundError);
      });
    });
  });
});
