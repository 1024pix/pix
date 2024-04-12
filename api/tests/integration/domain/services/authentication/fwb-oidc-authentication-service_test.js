import { randomUUID } from 'node:crypto';

import { FwbOidcAuthenticationService } from '../../../../../lib/domain/services/authentication/fwb-oidc-authentication-service.js';
import { temporaryStorage } from '../../../../../lib/infrastructure/temporary-storage/index.js';
import { expect } from '../../../../test-helper.js';

const defaultSessionTemporaryStorage = temporaryStorage.withPrefix('oidc-session:');
const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

describe('Integration | Domain | Service | fwb-oidc-authentication-service', function () {
  describe('#getRedirectLogoutUrl', function () {
    describe('when the user ID Token is not stored in the parent default temporary storage', function () {
      it('removes the idToken from temporary storage and returns a redirect logout url', async function () {
        // given
        const idToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const userId = 1;
        const logoutUrlUUID = randomUUID();
        const key = `${userId}:${logoutUrlUUID}`;
        const fwbOidcAuthenticationService = new FwbOidcAuthenticationService();
        await logoutUrlTemporaryStorage.save({ key, value: idToken, expirationDelaySeconds: 1140 });

        // when
        const redirectTarget = await fwbOidcAuthenticationService.getRedirectLogoutUrl({ userId, logoutUrlUUID });

        // then
        const expectedResult = await logoutUrlTemporaryStorage.get(key);
        expect(expectedResult).to.be.undefined;

        expect(redirectTarget).to.equal(
          'https://logout-url.org/?id_token_hint=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        );
      });
    });

    describe('when the user ID Token is stored in the parent default temporary storage', function () {
      it('removes the idToken from temporary storage and returns a redirect logout url', async function () {
        // given
        const idToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const userId = 1;
        const logoutUrlUUID = randomUUID();
        const key = `${userId}:${logoutUrlUUID}`;
        const fwbOidcAuthenticationService = new FwbOidcAuthenticationService();
        await defaultSessionTemporaryStorage.save({ key, value: idToken, expirationDelaySeconds: 1140 });

        // when
        const redirectTarget = await fwbOidcAuthenticationService.getRedirectLogoutUrl({ userId, logoutUrlUUID });

        // then
        const expectedResult = await defaultSessionTemporaryStorage.get(key);
        expect(expectedResult).to.be.undefined;

        expect(redirectTarget).to.equal(
          'https://logout-url.org/?id_token_hint=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        );
      });
    });
  });

  describe('#saveIdToken', function () {
    it('saves an idToken and returns an uuid', async function () {
      // given
      const uuidPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
      const userId = 123;
      const fwbOidcAuthenticationService = new FwbOidcAuthenticationService();

      // when
      const uuid = await fwbOidcAuthenticationService.saveIdToken({ idToken: 'id_token', userId });

      // then
      expect(uuid.match(uuidPattern)).to.be.ok;
      const idToken = await defaultSessionTemporaryStorage.get(`${userId}:${uuid}`);
      expect(idToken).to.deep.equal('id_token');
    });
  });
});
