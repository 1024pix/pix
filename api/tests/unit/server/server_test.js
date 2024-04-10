import { oidcAuthenticationServiceRegistry } from '../../../lib/domain/services/authentication/oidc-authentication-service-registry.js';
import { createServer } from '../../../server.js';
import { expect, sinon } from '../../test-helper.js';

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
