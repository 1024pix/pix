import { PassageDoesNotExistError, PassageTerminatedError } from '../../../../../src/devcomp/domain/errors.js';
import { verifyAndSaveAnswer } from '../../../../../src/devcomp/domain/usecases/verify-and-save-answer.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | UseCases | verify-and-save-answer', function () {
  describe('#verifyAndSaveAnswer', function () {
    describe('when passage is not found', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const passageId = Symbol('passageId');
        const passageRepository = {
          get: sinon.stub(),
        };
        passageRepository.get.withArgs({ passageId }).rejects(new NotFoundError());

        // when
        const error = await catchErr(verifyAndSaveAnswer)({ passageId, passageRepository });

        // then
        expect(error).to.be.instanceof(PassageDoesNotExistError);
      });
    });

    describe('when passage is found', function () {
      it('should not verify if passage is terminated', async function () {
        // given
        const elementId = Symbol('elementId');
        const passageId = Symbol('passageId');
        const userResponse = Symbol('userResponse');
        const moduleRepository = {};
        const elementAnswerRepository = {};

        const passageRepository = {
          get: sinon.stub(),
        };
        const moduleId = Symbol('moduleId');
        passageRepository.get.withArgs({ passageId }).resolves({ moduleId, terminatedAt: new Date('2023-12-31') });

        // when
        const error = await catchErr(verifyAndSaveAnswer)({
          userResponse,
          elementId,
          passageId,
          passageRepository,
          moduleRepository,
          elementAnswerRepository,
        });

        // then
        expect(error).to.be.instanceof(PassageTerminatedError);
      });

      it('should verify, save and return persisted corrected answer', async function () {
        // given
        const elementId = Symbol('elementId');
        const passageId = Symbol('passageId');
        const userResponse = Symbol('userResponse');
        const correction = { status: { status: Symbol('status') } };
        const persistedElementAnswer = Symbol('persistedElementAnswer');

        const passageRepository = {
          get: sinon.stub(),
        };
        const moduleId = Symbol('moduleId');
        passageRepository.get.withArgs({ passageId }).resolves({ moduleId });

        const moduleRepository = {
          getBySlugForVerification: sinon.stub(),
        };

        const module = { getGrainByElementId: sinon.stub() };

        const element = {
          userResponse: Symbol('UserResponse'),
          assess: sinon.stub(),
          validateUserResponseFormat: sinon.stub(),
          setUserResponse: sinon.stub(),
        };
        element.setUserResponse.withArgs(userResponse).returns();
        element.assess.withArgs().returns(correction);

        const grain = { id: 'grain-id', getElementById: sinon.stub() };
        grain.getElementById.withArgs(elementId).returns(element);
        module.getGrainByElementId.withArgs(elementId).returns(grain);

        moduleRepository.getBySlugForVerification.withArgs({ slug: moduleId }).resolves(module);

        const elementAnswerRepository = {
          save: sinon.stub(),
        };
        elementAnswerRepository.save
          .withArgs({
            passageId,
            elementId,
            value: element.userResponse,
            correction: correction,
          })
          .resolves(persistedElementAnswer);

        // when
        const result = await verifyAndSaveAnswer({
          userResponse,
          elementId,
          passageId,
          passageRepository,
          moduleRepository,
          elementAnswerRepository,
        });

        // then
        expect(result).to.equal(persistedElementAnswer);
        expect(element.setUserResponse).to.have.been.calledOnce;
      });
    });
  });
});
