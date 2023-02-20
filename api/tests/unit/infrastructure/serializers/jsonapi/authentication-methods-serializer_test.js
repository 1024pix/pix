import { expect, domainBuilder } from '../../../../test-helper';
import OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/authentication-methods-serializer';

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
              'identity-provider': OidcIdentityProviders.POLE_EMPLOI.service.code,
            },
          },
        ],
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
});
