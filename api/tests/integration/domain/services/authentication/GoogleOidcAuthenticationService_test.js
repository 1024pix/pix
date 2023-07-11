import { expect } from '../../../../test-helper.js';
import { GoogleOidcAuthenticationService } from '../../../../../lib/domain/services/authentication/GoogleOidcAuthenticationService.js';

describe('Integration | Domain | Service | google-oidc-authentication-service', function () {
  describe('instantiate', function () {
    it('has specific properties related to this identity provider', async function () {
      // when
      const authenticationService = new GoogleOidcAuthenticationService();

      // then
      expect(authenticationService.source).to.equal('google');
      expect(authenticationService.identityProvider).to.equal('GOOGLE');
      expect(authenticationService.slug).to.equal('google');
      expect(authenticationService.organizationName).to.equal('Google');
    });
  });
});
