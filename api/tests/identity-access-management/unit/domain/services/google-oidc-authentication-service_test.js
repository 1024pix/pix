import jsonwebtoken from 'jsonwebtoken';

import { GoogleOidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/google-oidc-authentication-service.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Services | google-oidc-authentication-service', function () {
  describe('#getUserInfo', function () {
    it('returns email and external identity id', async function () {
      // given
      const idToken = jsonwebtoken.sign(
        {
          given_name: 'givenName',
          family_name: 'familyName',
          nonce: 'nonce-id',
          sub: 'sub-id',
          email: 'given.family@example.net',
        },
        'secret',
      );

      const googleOidcAuthenticationService = new GoogleOidcAuthenticationService({});

      // when
      const result = await googleOidcAuthenticationService.getUserInfo({ idToken });

      // then
      expect(result).to.deep.equal({
        externalIdentityId: 'sub-id',
        email: 'given.family@example.net',
      });
    });
  });
});
