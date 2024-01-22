import { expect, sinon } from '../../../../test-helper.js';
import { modulesController } from '../../../../../src/devcomp/application/modules/controller.js';

describe('Unit | Devcomp | Application | Modules | Module Controller', function () {
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
});
