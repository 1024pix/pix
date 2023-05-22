import { expect, catchErr } from '../../../../test-helper.js';
import * as authenticationRegistry from '../../../../../lib/domain/services/authentication/authentication-service-registry.js';
import { InvalidIdentityProviderError } from '../../../../../lib/domain/errors.js';

describe('Unit | Domain | Services | authentication registry', function () {
  describe('#lookupAuthenticationService', function () {
    it('should find the identity provider service', async function () {
      // given
      const identityProvider = 'POLE_EMPLOI';

      // when
      const service = await authenticationRegistry.lookupAuthenticationService(identityProvider);

      // then
      expect(service.identityProvider).to.equal('POLE_EMPLOI');
    });

    it('finds the identity provider service with hasLogoutUrl', async function () {
      // given
      const identityProvider = 'FWB';

      // when
      const service = await authenticationRegistry.lookupAuthenticationService(identityProvider);

      // then
      expect(service.identityProvider).to.equal('FWB');
      expect(service.hasLogoutUrl).to.be.true;
    });

    it('should throw an error when identity provider is not supported', async function () {
      // given
      const identityProvider = 'IDP';

      // when
      const error = await catchErr(authenticationRegistry.lookupAuthenticationService)(identityProvider);

      // then
      expect(error).to.be.an.instanceOf(InvalidIdentityProviderError);
      expect(error.message).to.equal(`Identity provider ${identityProvider} is not supported.`);
    });
  });
});
