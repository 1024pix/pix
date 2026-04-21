import sinon from 'sinon';

import { modulesController } from '../../../../../src/devcomp/application/modules/module-controller.js';
import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';

describe('Unit | Devcomp | Application | Modules | Module Controller', function () {
  describe('#getBySlug', function () {
    it('should call getModule use-case and return serialized modules', async function () {
      const slug = 'slug';
      const encryptedRedirectionUrl = 'encryptedRedirectionUrl';
      const serializedModule = Symbol('serialized modules');
      const module = Symbol('modules');
      sinon.stub(usecases, 'getModule');
      usecases.getModule.withArgs({ slug, encryptedRedirectionUrl }).returns(module);
      const moduleSerializer = {
        serialize: sinon.stub(),
      };
      moduleSerializer.serialize.withArgs(module).returns(serializedModule);

      const result = await modulesController.getBySlug({ params: { slug }, query: { encryptedRedirectionUrl } }, null, {
        moduleSerializer,
        usecases,
      });

      expect(result).to.equal(serializedModule);
    });
  });
});
