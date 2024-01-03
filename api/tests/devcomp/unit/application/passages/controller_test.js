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
});
