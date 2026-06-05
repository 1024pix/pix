import sinon from 'sinon';

import { modulesController } from '../../../../../src/devcomp/application/modules/module-controller.js';
import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Application | Modules | Module Controller', function () {
  describe('#getByShortId', function () {
    it('should call getModuleByShortId use-case and return serialized modules', async function () {
      const shortId = 's0l3il';
      const encryptedRedirectionUrl = 'encryptedRedirectionUrl';
      const serializedModule = Symbol('serialized modules');
      const module = Symbol('modules');
      const getModuleByShortIdStub = sinon.stub(usecases, 'getModuleByShortId');
      usecases.getModuleByShortId.withArgs({ shortId, encryptedRedirectionUrl }).returns(module);
      const moduleSerializer = {
        serialize: sinon.stub(),
      };
      moduleSerializer.serialize.withArgs(module).returns(serializedModule);

      const result = await modulesController.getByShortId(
        { params: { shortId }, query: { encryptedRedirectionUrl } },
        null,
        {
          moduleSerializer,
          usecases,
        },
      );

      expect(result).to.equal(serializedModule);
      expect(getModuleByShortIdStub).to.have.been.calledOnceWithExactly({ shortId, encryptedRedirectionUrl });
    });
  });
});
