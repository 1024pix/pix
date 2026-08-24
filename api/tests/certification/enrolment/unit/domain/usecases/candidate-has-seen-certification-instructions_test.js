import sinon from 'sinon';

import { candidateHasSeenCertificationInstructions } from '../../../../../../src/certification/enrolment/domain/usecases/candidate-has-seen-certification-instructions.js';
import { CertificationCandidateNotFoundError } from '../../../../../../src/certification/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

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
      const candidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .withParameters({
          id: 187,
          createdAt: new Date('2020-01-01T00:00:00Z'),
          hasSeenCertificationInstructions: false,
        })
        .build();

      const expectedCandidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .withParameters({
          id: 187,
          createdAt: new Date('2020-01-01T00:00:00Z'),
          hasSeenCertificationInstructions: true,
        })
        .build();
      candidateRepository.get.withArgs({ certificationCandidateId: 187 }).resolves(candidate);
      candidateRepository.update.withArgs(expectedCandidate).resolves();

      // when
      const result = await candidateHasSeenCertificationInstructions({
        certificationCandidateId: 187,
        candidateRepository,
      });

      // then
      expect(result.hasSeenCertificationInstructions).to.be.true;
    });

    context('when no candidate is found', function () {
      it('should throw an CertificationCandidateNotFoundError', async function () {
        // given
        const certificationCandidateId = 1;

        // when
        const error = await catchErr(candidateHasSeenCertificationInstructions)({
          certificationCandidateId,
          candidateRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(CertificationCandidateNotFoundError);
      });
    });
  });
});
