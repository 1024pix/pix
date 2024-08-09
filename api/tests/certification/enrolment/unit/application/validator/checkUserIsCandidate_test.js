import * as checkUserIsCandidateUseCase from '../../../../../../src/certification/enrolment/application/usecases/check-user-is-candidate.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

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
        domainBuilder.certification.enrolment.buildCandidate({
          userId,
        }),
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

      candidateRepositoryStub.get.withArgs({ certificationCandidateId }).resolves(
        domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
        }),
      );

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
