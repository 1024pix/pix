import jsonwebtoken from 'jsonwebtoken';

import { AgentConnectOidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/agent-connect-oidc-authentication-service.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Services | agent-connect-oidc-authentication-service', function () {
  describe('#getUserInfo', function () {
    it('returns user info for agent connect', async function () {
      // given
      const idToken = jsonwebtoken.sign(
        {
          given_name: 'givenName',
          usual_name: 'familyName',
          nonce: 'nonce-id',
          sub: 'sub-id',
        },
        'secret',
      );

      const agentConnectOidcAuthenticationService = new AgentConnectOidcAuthenticationService({});

      // when
      const result = await agentConnectOidcAuthenticationService.getUserInfo({ idToken });

      // then
      expect(result).to.deep.equal({
        firstName: 'givenName',
        lastName: 'familyName',
        externalIdentityId: 'sub-id',
      });
    });
  });
});
