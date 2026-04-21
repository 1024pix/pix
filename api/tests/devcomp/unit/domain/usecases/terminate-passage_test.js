import sinon from 'sinon';

import { PassageDoesNotExistError, PassageTerminatedError } from '../../../../../src/devcomp/domain/errors.js';
import { terminatePassage } from '../../../../../src/devcomp/domain/usecases/terminate-passage.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | UseCases | terminate-passage', function () {
  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
  });

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
        const passageId = 1234;

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
        const passageId = 1234;

        const passageRepository = {
          get: sinon.stub(),
          update: sinon.stub(),
        };

        const passage = {
          terminatedAt: null,
          terminate: sinon.stub(),
        };
        passageRepository.get.withArgs({ passageId }).resolves(passage);

        const updateCombinedCourseJobRepository = {
          performAsync: sinon.stub(),
        };
        updateCombinedCourseJobRepository.performAsync.resolves();

        const updatedPassage = {
          terminatedAt: new Date('2025-03-04'),
          id: passageId,
        };
        passageRepository.update.withArgs({ passage }).resolves(updatedPassage);

        // when
        const returnedPassage = await terminatePassage({
          passageId,
          passageRepository,
          updateCombinedCourseJobRepository,
        });

        // then
        expect(passage.terminate).to.have.been.calledOnce;
        expect(returnedPassage).to.equal(updatedPassage);
      });

      it('should schedule a job to notify passage termination', async function () {
        // given
        const passageId = 1234;

        const passageRepository = {
          get: sinon.stub(),
          update: sinon.stub(),
        };

        const passage = {
          id: passageId,
          userId: Symbol('user-id'),
          moduleId: Symbol('module-id'),
          terminatedAt: null,
          terminate: sinon.stub(),
        };
        passageRepository.get.withArgs({ passageId }).resolves(passage);

        const updatedPassage = {
          id: passageId,
          userId: passage.userId,
          moduleId: passage.moduleId,
          terminatedAt: new Date('2025-03-04'),
        };
        passageRepository.update.withArgs({ passage }).resolves(updatedPassage);

        const updateCombinedCourseJobRepository = {
          performAsync: sinon.stub(),
        };
        updateCombinedCourseJobRepository.performAsync
          .withArgs({ moduleId: passage.moduleId, userId: passage.userId })
          .resolves();

        // when
        await terminatePassage({
          passageId,
          passageRepository,
          updateCombinedCourseJobRepository,
        });

        // then
        expect(updateCombinedCourseJobRepository.performAsync).to.have.been.calledOnceWith({
          userId: passage.userId,
          moduleId: passage.moduleId,
        });
      });

      it('should not schedule a job to notify passage termination', async function () {
        // given
        const passageId = 1234;

        const passageRepository = {
          get: sinon.stub(),
          update: sinon.stub(),
        };

        const passage = {
          id: passageId,
          userId: null,
          moduleId: Symbol('module-id'),
          terminatedAt: null,
          terminate: sinon.stub(),
        };
        passageRepository.get.withArgs({ passageId }).resolves(passage);

        const updatedPassage = {
          id: passageId,
          terminatedAt: new Date('2025-03-04'),
        };
        passageRepository.update.withArgs({ passage }).resolves(updatedPassage);

        const updateCombinedCourseJobRepository = {
          performAsync: sinon.stub(),
        };

        // when
        await terminatePassage({
          passageId,
          passageRepository,
          updateCombinedCourseJobRepository,
        });

        // then
        expect(updateCombinedCourseJobRepository.performAsync.called).false;
      });
    });
  });
});
