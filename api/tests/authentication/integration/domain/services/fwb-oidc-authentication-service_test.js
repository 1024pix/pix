import { randomUUID } from 'node:crypto';

import { temporaryStorage } from '../../../../../lib/infrastructure/temporary-storage/index.js';
import { FwbOidcAuthenticationService } from '../../../../../src/authentication/domain/services/fwb-oidc-authentication-service.js';
import { config } from '../../../../../src/shared/config.js';
import { expect } from '../../../../test-helper.js';

const defaultSessionTemporaryStorage = temporaryStorage.withPrefix('oidc-session:');

describe('Integration | Authentication | Domain | Service | fwb-oidc-authentication-service', function () {
  describe('#getRedirectLogoutUrl', function () {
    it('removes the idToken from temporary storage and returns a redirect logout url', async function () {
      // given
      const idToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const userId = 1;
      const logoutUrlUUID = randomUUID();
      const key = `${userId}:${logoutUrlUUID}`;
      const fwbOidcAuthenticationService = new FwbOidcAuthenticationService({
        ...config.oidcExampleNet,
        additionalRequiredProperties: { logoutUrl: 'https://logout-url.org' },
        identityProvider: 'FWB',
        organizationName: 'Fédération Wallonie-Bruxelles',
        shouldCloseSession: true,
        slug: 'fwb',
        source: 'fwb',
      });
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
