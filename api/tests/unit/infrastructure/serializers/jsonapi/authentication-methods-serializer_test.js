import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/authentication-methods-serializer.js';
import * as OidcIdentityProviders from '../../../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | authentication-methods-serializer', function () {
  describe('#serialize()', function () {
    it('should format a authentication method model object into JSON API data', function () {
      // given
      const user = domainBuilder.buildUser();
      const authenticationMethods = [
        domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId: user.id }),
      ];

      // when
      const json = serializer.serialize(authenticationMethods);

      // then
      const expectedJson = {
        data: [
          {
            type: 'authentication-methods',
            attributes: {
              'identity-provider': OidcIdentityProviders.POLE_EMPLOI.code,
            },
          },
        ],
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
});
