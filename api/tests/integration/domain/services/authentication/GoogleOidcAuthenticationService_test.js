import { expect } from '../../../../test-helper.js';
import { temporaryStorage } from '../../../../../lib/infrastructure/temporary-storage/index.js';
import { GoogleOidcAuthenticationService } from '../../../../../lib/domain/services/authentication/GoogleOidcAuthenticationService.js';

const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

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
      expect(authenticationService.hasLogoutUrl).to.be.true;
    });
  });

  describe('#getRedirectLogoutUrl', function () {
    it('removes the idToken from temporary storage and returns a redirect logout url', async function () {
      // given
      const idToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const userId = 1;
      const logoutUrlUUID = '1f3dbb71-f399-4c1c-85ae-0a863c78aeea';
      const key = `${userId}:${logoutUrlUUID}`;
      const authenticationService = new GoogleOidcAuthenticationService();
      await logoutUrlTemporaryStorage.save({ key, value: idToken, expirationDelaySeconds: 1140 });

      // when
      const redirectTarget = await authenticationService.getRedirectLogoutUrl({ userId, logoutUrlUUID });

      // then
      expect(redirectTarget).to.equal(
        'http://logout-url.org/?id_token_hint=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      );
      const expectedResult = await logoutUrlTemporaryStorage.get(key);
      expect(expectedResult).to.be.undefined;
    });
  });

  describe('#saveIdToken', function () {
    it('saves an idToken and returns an uuid', async function () {
      // given
      const uuidPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
      const userId = 123;
      const authenticationService = new GoogleOidcAuthenticationService();

      // when
      const uuid = await authenticationService.saveIdToken({ idToken: 'id_token', userId });

      // then
      expect(uuid.match(uuidPattern)).to.be.ok;
      const idToken = logoutUrlTemporaryStorage.get(`${userId}:${uuid}`);
      expect(idToken).to.deep.equal('id_token');
    });
  });
});
