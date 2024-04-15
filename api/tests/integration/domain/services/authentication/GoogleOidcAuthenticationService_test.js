import { GoogleOidcAuthenticationService } from '../../../../../lib/domain/services/authentication/google-oidc-authentication-service.js';
import { config } from '../../../../../src/shared/config.js';
import { expect } from '../../../../test-helper.js';

describe('Integration | Domain | Service | google-oidc-authentication-service', function () {
  describe('instantiate', function () {
    it('has specific properties related to this identity provider', async function () {
      // when
      const authenticationService = new GoogleOidcAuthenticationService({
        ...config.oidcExampleNet,
        identityProvider: 'GOOGLE',
        organizationName: 'Google',
        shouldCloseSession: true,
        slug: 'google',
        source: 'google',
      });

      // then
      expect(authenticationService.source).to.equal('google');
      expect(authenticationService.identityProvider).to.equal('GOOGLE');
      expect(authenticationService.slug).to.equal('google');
      expect(authenticationService.organizationName).to.equal('Google');
    });
  });
});
