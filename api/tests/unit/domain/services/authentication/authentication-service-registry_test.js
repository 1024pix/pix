import { expect, catchErr } from '../../../../test-helper';
import authenticationRegistry from '../../../../../lib/domain/services/authentication/authentication-service-registry';
import PoleEmploiOidcAuthenticationService from '../../../../../lib/domain/services/authentication/pole-emploi-oidc-authentication-service';
import { InvalidIdentityProviderError } from '../../../../../lib/domain/errors';

describe('Unit | Domain | Services | authentication registry', function () {
  describe('#lookupAuthenticationService', function () {
    it('should find the identity provider service', async function () {
      // given
      const identityProvider = 'POLE_EMPLOI';

      // when
      const service = await authenticationRegistry.lookupAuthenticationService(identityProvider);

      // then
      expect(service).to.be.an.instanceOf(PoleEmploiOidcAuthenticationService);
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
