import { hasBeenCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/has-been-candidate.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | has-been-candidate', function () {
  let candidateRepository;

  beforeEach(function () {
    candidateRepository = { findByUserId: sinon.stub() };
  });

  context('when at least one candidate is reconciled', function () {
    it('should return true', async function () {
      // given
      const candidate1 = domainBuilder.certification.enrolment.buildCandidate({
        userId: 4321,
        reconciledAt: new Date(),
      });
      const candidate2 = domainBuilder.certification.enrolment.buildCandidate({ userId: 4321 });

      candidateRepository.findByUserId.withArgs({ userId: 4321 }).resolves([candidate1, candidate2]);

      // when
      const result = await hasBeenCandidate({ userId: 4321, candidateRepository });

      // then
      expect(result).to.be.true;
    });
  });

  context('when no candidates are reconciled', function () {
    it('should return false', async function () {
      // given
      const candidate1 = domainBuilder.certification.enrolment.buildCandidate({ userId: 4321 });
      const candidate2 = domainBuilder.certification.enrolment.buildCandidate({ userId: 4321 });

      candidateRepository.findByUserId.withArgs({ userId: 4321 }).resolves([candidate1, candidate2]);

      // when
      const result = await hasBeenCandidate({ userId: 4321, candidateRepository });

      // then
      expect(result).to.be.false;
    });
  });

  context('when no candidates are returned', function () {
    it('should return false', async function () {
      // given
      candidateRepository.findByUserId.withArgs({ userId: 4321 }).resolves([]);

      // when
      const result = await hasBeenCandidate({ userId: 4321, candidateRepository });

      // then
      expect(result).to.be.false;
    });
  });
});
