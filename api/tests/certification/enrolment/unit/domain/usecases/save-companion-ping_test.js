import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { saveCompanionPing } from '../../../../../../src/certification/enrolment/domain/usecases/save-companion-ping.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | save-companion-ping', function () {
  describe('#saveCompanionPing', function () {
    describe('when the user is in a running session', function () {
      it('should persist the companion ping in redis', async function () {
        // given
        const userId = 123;
        const companionRepository = { getSessionInfo: sinon.stub() };
        const temporaryStorageService = { saveCompanionPing: sinon.stub() };
        companionRepository.getSessionInfo.withArgs(userId).resolves({ sessionId: 99, certificationCandidate: 101 });
        temporaryStorageService.saveCompanionPing.withArgs({ sessionId: 99, certificationCandidate: 101 }).resolves();

        await saveCompanionPing({
          userId,
          certificationCandidateRepository,
          temporaryCompanionStorageService,
        });
        const response = await saveCompanionPing({ userId });

        // then
        expect(response).to.deep.equal();
        expect(temporaryStorageService).to.have.been.calledWithExactly({ sessionId: 99, certificationCandidate: 101 });
      });
    });

    describe('when the user is not in a running session', function () {
      it('should throw a Not Found error', async function () {
        // given
        const userId = 123;

        // when
        const error = await catchErr(saveCompanionPing)({
          userId,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal(`No candidate found for user id ${userId}`);
      });
    });
  });
});
