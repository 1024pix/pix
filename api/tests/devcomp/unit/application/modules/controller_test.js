import { modulesController } from '../../../../../src/devcomp/application/modules/controller.js';
import * as moduleUnderTest from '../../../../../src/devcomp/application/modules/index.js';
import { ModuleInstantiationError } from '../../../../../src/devcomp/domain/errors.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

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

    it('should throw an error if referential data is incorrect', async function () {
      // given
      sinon.stub(modulesController, 'getBySlug').throws(new ModuleInstantiationError());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/modules/slug');

      expect(response.statusCode).to.equal(502);
    });
  });
});
