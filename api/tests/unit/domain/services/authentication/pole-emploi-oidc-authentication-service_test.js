import { expect } from '../../../../test-helper.js';
import { AuthenticationMethod } from '../../../../../lib/domain/models/AuthenticationMethod.js';
import { PoleEmploiOidcAuthenticationService } from '../../../../../lib/domain/services/authentication/pole-emploi-oidc-authentication-service.js';
import { temporaryStorage } from '../../../../../lib/infrastructure/temporary-storage/index.js';

const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

describe('Unit | Domain | Services | pole-emploi-oidc-authentication-service', function () {
  describe('#getRedirectLogoutUrl', function () {
    it('should return a redirect logout url', async function () {
      // given
      const idToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const userId = '1';
      const logoutUrlUUID = '1f3dbb71-f399-4c1c-85ae-0a863c78aeea';
      const key = `${userId}:${logoutUrlUUID}`;
      await logoutUrlTemporaryStorage.save({ key, value: idToken, expirationDelaySeconds: 1140 });
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();

      // when
      const redirectTarget = await poleEmploiOidcAuthenticationService.getRedirectLogoutUrl({
        userId,
        logoutUrlUUID,
      });

      // then
      expect(redirectTarget).to.equal(
        'http://logout-url.fr/?id_token_hint=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c&redirect_uri=http%3A%2F%2Fafter-logout.url',
      );
    });

    it('removes idToken from temporary storage', async function () {
      // given
      const idToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const userId = '2';
      const logoutUrlUUID = 'f9f1b471-a74e-4722-8dde-f5731279146a';
      const key = `${userId}:${logoutUrlUUID}`;
      await logoutUrlTemporaryStorage.save({ key, value: idToken, expirationDelaySeconds: 1140 });
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();

      // when
      await poleEmploiOidcAuthenticationService.getRedirectLogoutUrl({
        userId,
        logoutUrlUUID,
      });
      const expectedIdToken = await logoutUrlTemporaryStorage.get(key);

      // then
      expect(expectedIdToken).to.be.undefined;
    });
  });

  describe('#createAuthenticationComplement', function () {
    it('should create pole emploi authentication complement', function () {
      // given
      const sessionContent = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();

      // when
      const result = poleEmploiOidcAuthenticationService.createAuthenticationComplement({ sessionContent });

      // then
      expect(result).to.be.instanceOf(AuthenticationMethod.PoleEmploiOidcAuthenticationComplement);
    });
  });
});
