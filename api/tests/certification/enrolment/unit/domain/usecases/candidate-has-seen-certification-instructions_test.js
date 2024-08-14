import { CertificationCandidateNotFoundError } from '../../../../../../src/certification/enrolment/domain/errors.js';
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
    it('should proceed to update candidate', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        id: 187,
        createdAt: new Date('2020-01-01T00:00:00Z'),
        hasSeenCertificationInstructions: false,
      });
      candidateRepository.get.withArgs({ certificationCandidateId: 187 }).resolves(candidate);
      candidateRepository.update.resolves();

      // when
      await candidateHasSeenCertificationInstructions({
        certificationCandidateId: 187,
        candidateRepository,
      });

      // then
      const expectedCandidateUpdated = domainBuilder.certification.enrolment.buildCandidate({
        id: 187,
        createdAt: new Date('2020-01-01T00:00:00Z'),
        hasSeenCertificationInstructions: true,
      });
      expect(candidateRepository.update).to.have.been.calledOnceWithExactly(expectedCandidateUpdated);
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
