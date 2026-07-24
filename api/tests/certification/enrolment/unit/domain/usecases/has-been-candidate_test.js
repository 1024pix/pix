import sinon from 'sinon';

import { hasBeenCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/has-been-candidate.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | UseCase | has-been-candidate', function () {
  let candidateRepository;

  beforeEach(function () {
    candidateRepository = { findByUserId: sinon.stub() };
  });

  context('when at least one candidate is reconciled', function () {
    it('should return true', async function () {
      // given
      const candidate1 = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled({
          userId: 4321,
        })
        .build();
      const candidate2 = domainBuilder.certification.enrolment
        .candidateBuilder()
        .asReconciled({ userId: 4321 })
        .build();

      candidateRepository.findByUserId.withArgs({ userId: 4321 }).resolves([candidate1, candidate2]);

      // when
      const result = await hasBeenCandidate({ userId: 4321, candidateRepository });

      // then
      expect(result).to.be.true;
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
