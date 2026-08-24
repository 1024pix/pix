import sinon from 'sinon';

import * as checkUserIsCandidateUseCase from '../../../../../../src/certification/enrolment/application/usecases/check-user-is-candidate.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Application | Validator | checkUserIsCandidateUseCase', function () {
  context('When user is the candidate', function () {
    it('should return true', async function () {
      // given
      const userId = 'userId';
      const certificationCandidateId = 'certificationCandidateId';
      const candidateRepositoryStub = {
        get: sinon.stub(),
      };

      candidateRepositoryStub.get.withArgs({ certificationCandidateId }).resolves(
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .asReconciled({
            userId,
            reconciledAt: new Date('2024-09-25'),
          })
          .build(),
      );

      // when
      const response = await checkUserIsCandidateUseCase.execute({
        userId,
        certificationCandidateId,
        dependencies: { candidateRepository: candidateRepositoryStub },
      });

      // then
      expect(response).to.be.true;
    });
  });

  context('When user is not the candidate', function () {
    it('should return false', async function () {
      // given
      const userId = 'userId';
      const certificationCandidateId = 'certificationCandidateId';
      const candidateRepositoryStub = {
        get: sinon.stub(),
      };

      candidateRepositoryStub.get
        .withArgs({ certificationCandidateId })
        .resolves(domainBuilder.certification.enrolment.candidateBuilder().build());

      // when
      const response = await checkUserIsCandidateUseCase.execute({
        userId,
        certificationCandidateId,
        dependencies: { candidateRepository: candidateRepositoryStub },
      });

      // then
      expect(response).to.be.false;
    });
  });
});
