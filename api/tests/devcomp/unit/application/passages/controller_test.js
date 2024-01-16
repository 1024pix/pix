import { expect, sinon } from '../../../../test-helper.js';
import { passageController } from '../../../../../src/devcomp/application/passages/controller.js';

describe('Unit | Devcomp | Application | Passages | Controller', function () {
  describe('#create', function () {
    it('should call createPassage use-case and return serialized passage', async function () {
      // given
      const serializedPassage = Symbol('serialized modules');
      const moduleId = Symbol('module-id');
      const passage = Symbol('passage');
      const usecases = {
        createPassage: sinon.stub(),
      };
      usecases.createPassage.withArgs({ moduleId }).returns(passage);
      const passageSerializer = {
        serialize: sinon.stub(),
      };
      passageSerializer.serialize.withArgs(passage).returns(serializedPassage);
      const hStub = {
        response: sinon.stub(),
      };
      const created = sinon.stub();
      hStub.response.withArgs(serializedPassage).returns({ created });

      // when
      await passageController.create({ payload: { data: { attributes: { 'module-id': moduleId } } } }, hStub, {
        passageSerializer,
        usecases,
      });

      // then
      expect(created).to.have.been.called;
    });
  });

  describe('#verifyAndSaveAnswer', function () {
    it('should call verifyAndSave use-case and return serialized element-answer', async function () {
      // given
      const passageId = Symbol('passage-id');
      const elementId = Symbol('element-id');
      const userResponse = Symbol('user-response');
      const uselessField = Symbol('useless-field');

      const createdElementAnswer = Symbol('created element-answer');
      const usecases = {
        verifyAndSaveAnswer: sinon.stub(),
      };
      usecases.verifyAndSaveAnswer.withArgs({ passageId, elementId, userResponse }).resolves(createdElementAnswer);

      const hStub = {
        response: sinon.stub(),
      };

      const serializedElementAnswer = Symbol('serialized element-answer');

      const elementAnswerSerializer = {
        serialize: sinon.stub(),
      };
      elementAnswerSerializer.serialize.withArgs(createdElementAnswer).returns(serializedElementAnswer);

      const createdStub = sinon.stub();
      hStub.response.withArgs(serializedElementAnswer).returns({ created: createdStub });
      createdStub.returns(serializedElementAnswer);

      // when
      const result = await passageController.verifyAndSaveAnswer(
        {
          params: { passageId },
          payload: { data: { attributes: { 'element-id': elementId, 'user-response': userResponse, uselessField } } },
        },
        hStub,
        {
          usecases,
          elementAnswerSerializer,
        },
      );

      // then
      expect(result).to.equal(serializedElementAnswer);
    });
  });
});
