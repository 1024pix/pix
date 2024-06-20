import * as OidcIdentityProviders from '../../../../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import * as serializer from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/authentication-methods.serializer.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Serializer | JSONAPI | authentication-methods', function () {
  describe('#serialize()', function () {
    it('formats a authentication method model object into JSON API data', function () {
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
