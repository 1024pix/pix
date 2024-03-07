import { CnavOidcAuthenticationService } from '../../../../../lib/domain/services/authentication/cnav-oidc-authentication-service.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Services | cnav-oidc-authentication-service', function () {
  describe('#getRedirectLogoutUrl', function () {
    it('returns null', async function () {
      // given
      const cnavOidcAuthenticationService = new CnavOidcAuthenticationService({});

      // when
      const result = await cnavOidcAuthenticationService.getRedirectLogoutUrl();

      // then
      expect(result).to.be.null;
    });
  });
});
