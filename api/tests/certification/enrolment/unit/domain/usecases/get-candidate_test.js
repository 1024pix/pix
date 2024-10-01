import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { getCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/get-candidate.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | get-candidate', function () {
  let candidate;
  let candidateRepository;

  beforeEach(function () {
    candidate = domainBuilder.certification.enrolment.buildCandidate({ id: 1234 });
    candidateRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the candidate by id', async function () {
    // given
    candidateRepository.get.withArgs({ certificationCandidateId: 1234 }).resolves(candidate);

    // when
    const actualCandidate = await getCandidate({
      certificationCandidateId: 1234,
      candidateRepository,
    });

    // then
    expect(actualCandidate.id).to.equal(1234);
    expect(actualCandidate).to.be.instanceOf(Candidate);
  });
});
