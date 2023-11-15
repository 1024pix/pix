import { expect, sinon } from '../../../../test-helper.js';
import { modulesController } from '../../../../../src/devcomp/application/modules/controller.js';

describe('Devcomp | Unit | Application | Module | Module Controller', function () {
  describe('#getBySlug', function () {
    it('should call getModule use-case and return serialized modules', async function () {
      const slug = 'slug';
      const serializedModule = Symbol('serialized modules');
      const module = Symbol('modules');
      const usecases = {
        getModule: sinon.stub(),
      };
      usecases.getModule.withArgs({ slug }).returns(module);
      const moduleSerializer = {
        serialize: sinon.stub(),
      };
      moduleSerializer.serialize.withArgs(module).returns(serializedModule);

      const result = await modulesController.getBySlug({ params: { slug } }, null, { moduleSerializer, usecases });

      expect(result).to.equal(serializedModule);
    });
  });

  describe('#validate-answer', function () {
    it('should call validateAnswer use-case and return the serialized CorrectionResponse', async function () {
      // Given
      const moduleSlug = 'slug';
      const serializedCorrection = Symbol('serialized correction');
      const userResponse = Symbol('user-response');
      const elementId = Symbol('elementId');
      const correctionResponse = Symbol('correction');

      const usecases = {
        validateAnswer: sinon.stub(),
      };
      usecases.validateAnswer.withArgs({ moduleSlug, userResponse, elementId }).returns(correctionResponse);

      const elementAnswerSerializer = {
        serialize: sinon.stub(),
      };
      elementAnswerSerializer.serialize.withArgs(correctionResponse).returns(serializedCorrection);

      // When
      const result = await modulesController.validateAnswer(
        { payload: { data: { attributes: { 'user-response': userResponse } } }, params: { moduleSlug, elementId } },
        null,
        { elementAnswerSerializer, usecases },
      );

      // Then
      expect(result).to.equal(serializedCorrection);
    });
  });
});
