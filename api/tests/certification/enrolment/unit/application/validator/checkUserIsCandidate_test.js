import * as checkUserIsCandidateUseCase from '../../../../../../src/certification/enrolment/application/usecases/checkUserIsCandidate.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Application | Validator | checkUserIsCandidateUseCase', function () {
  context('When user is the candidate', function () {
    it('should return true', async function () {
      // given
      const userId = 'userId';
      const certificationCandidateId = 'certificationCandidateId';
      const candidateRepositoryStub = {
        isUserCertificationCandidate: sinon.stub(),
      };

      candidateRepositoryStub.isUserCertificationCandidate
        .withArgs({ userId, certificationCandidateId })
        .resolves(true);

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
        isUserCertificationCandidate: sinon.stub(),
      };

      candidateRepositoryStub.isUserCertificationCandidate
        .withArgs({ userId, certificationCandidateId })
        .returns(false);

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
