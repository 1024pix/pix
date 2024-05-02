import jsonwebtoken from 'jsonwebtoken';

import { GoogleOidcAuthenticationService } from '../../../../../src/authentication/domain/services/google-oidc-authentication-service.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Authentication | Domain | Services | google-oidc-authentication-service', function () {
  describe('#getUserInfo', function () {
    it('returns email and external identity id', async function () {
      // given
      function generateIdToken(payload) {
        return jsonwebtoken.sign(
          {
            ...payload,
          },
          'secret',
        );
      }

      const idToken = generateIdToken({
        given_name: 'givenName',
        family_name: 'familyName',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
        sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        email: 'given.family@example.net',
      });

      const googleOidcAuthenticationService = new GoogleOidcAuthenticationService({});

      // when
      const result = await googleOidcAuthenticationService.getUserInfo({
        idToken,
      });

      // then
      expect(result).to.deep.equal({
        externalIdentityId: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        email: 'given.family@example.net',
      });
    });
  });
});
