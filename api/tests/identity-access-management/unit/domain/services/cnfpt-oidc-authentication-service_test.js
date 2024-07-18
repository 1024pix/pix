import jsonwebtoken from 'jsonwebtoken';

import { CnfptOidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/cnfpt-oidc-authentication-service.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Services | cnfpt-oidc-authentication-service', function () {
  describe('#getUserInfo', function () {
    it('returns email and external identity id', async function () {
      // given
      const idToken = jsonwebtoken.sign(
        {
          given_name: 'givenName',
          name: 'familyName',
          nonce: 'nonce-id',
          sub: 'sub-id',
        },
        'secret',
      );

      const cnfptOidcAuthenticationService = new CnfptOidcAuthenticationService({});

      // when
      const result = await cnfptOidcAuthenticationService.getUserInfo({ idToken });

      // then
      expect(result).to.deep.equal({
        firstName: 'givenName',
        lastName: 'familyName',
        externalIdentityId: 'sub-id',
      });
    });
  });
});
