import { expect, catchErr } from '../../../../test-helper.js';
import * as authenticationRegistry from '../../../../../lib/domain/services/authentication/authentication-service-registry.js';
import { InvalidIdentityProviderError } from '../../../../../lib/domain/errors.js';

describe('Unit | Domain | Services | authentication registry', function () {
  describe('#getOidcProviderServiceByCode', function () {
    it('finds an OIDC Provider', async function () {
      // given
      const identityProvider = 'POLE_EMPLOI';

      // when
      const service = await authenticationRegistry.getOidcProviderServiceByCode(identityProvider);

      // then
      expect(service.code).to.equal('POLE_EMPLOI');
    });

    it('throws an error when identity provider is not supported', async function () {
      // given
      const identityProvider = 'UNSUPPORTED_OIDC_PROVIDER';

      // when
      const error = await catchErr(authenticationRegistry.getOidcProviderServiceByCode)(identityProvider);

      // then
      expect(error).to.be.an.instanceOf(InvalidIdentityProviderError);
      expect(error.message).to.equal(`Identity provider ${identityProvider} is not supported.`);
    });
  });
});
