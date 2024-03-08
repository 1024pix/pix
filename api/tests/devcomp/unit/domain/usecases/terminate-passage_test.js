import { PassageDoesNotExistError, PassageTerminatedError } from '../../../../../src/devcomp/domain/errors.js';
import { terminatePassage } from '../../../../../src/devcomp/domain/usecases/terminate-passage.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | UseCases | terminate-passage', function () {
  describe('#terminatePassage', function () {
    describe('when passage is not found', function () {
      it('should throw a PassageDoesNotExistError', async function () {
        // given
        const passageId = Symbol('passageId');
        const passageRepository = {
          get: sinon.stub(),
        };
        passageRepository.get.withArgs({ passageId }).rejects(new NotFoundError());

        // when
        const error = await catchErr(terminatePassage)({ passageId, passageRepository });

        // then
        expect(error).to.be.instanceof(PassageDoesNotExistError);
      });
    });

    describe('when passage is found', function () {
      it('should not verify if passage is terminated', async function () {
        // given
        const passageId = Symbol('passageId');

        const passage = {
          terminatedAt: Symbol('terminatedAt'),
        };
        const passageRepository = {
          get: sinon.stub(),
        };
        passageRepository.get.withArgs({ passageId }).resolves(passage);

        // when
        const error = await catchErr(terminatePassage)({
          passageId,
          passageRepository,
        });

        // then
        expect(error).to.be.instanceof(PassageTerminatedError);
      });

      it('should call terminate method and update passage and return it', async function () {
        // given
        const passageId = Symbol('passageId');

        const passageRepository = {
          get: sinon.stub(),
          update: sinon.stub(),
        };
        const passage = {
          terminatedAt: null,
          terminate: sinon.stub(),
        };
        passageRepository.get.withArgs({ passageId }).resolves(passage);

        const updatedPassage = Symbol();
        passageRepository.update.withArgs({ passage }).resolves(updatedPassage);

        // when
        const returnedPassage = await terminatePassage({
          passageId,
          passageRepository,
        });

        // then
        expect(passage.terminate).to.have.been.calledOnce;
        expect(returnedPassage).to.equal(updatedPassage);
      });
    });
  });
});
