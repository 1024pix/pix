import { expect, sinon } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { oidcAuthenticationServiceRegistry } from '../../../lib/domain/services/authentication/authentication-service-registry.js';

describe('Unit | Server | server', function () {
  describe('#createServer', function () {
    it('should create server with custom validate.failAction', async function () {
      // given
      const expectedFailActionFunctionName = 'handleFailAction';
      sinon.stub(oidcAuthenticationServiceRegistry, 'loadOidcProviderServices').returns();

      // when
      const server = await createServer();

      // then
      expect(server.settings.routes.validate.failAction.name).to.equal(expectedFailActionFunctionName);
    });
  });
});
