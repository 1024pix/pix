import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { saveCompanionPing } from '../../../../../../src/certification/session/domain/usecases/save-companion-ping.js';
import { catchErr, expect } from '../../../../../test-helper.js';

describe('Unit | UseCase | save-companion-ping', function () {
  describe('#saveCompanionPing', function () {
    describe('when the user is in a running session', function () {
      it('should persist the companion ping in redis', async function () {
        // given
        const userId = 123;

        await saveCompanionPing({
          userId,
          certificationCandidateRepository,
          temporaryCompanionStorageService,
        });
        const response = await saveCompanionPing({ userId });

        // then
        expect(response).to.deep.equal(123);
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
