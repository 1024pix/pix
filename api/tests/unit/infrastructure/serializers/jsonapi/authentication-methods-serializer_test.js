const { expect, domainBuilder } = require('../../../../test-helper');
const OidcIdentityProviders = require('../../../../../lib/domain/constants/oidc-identity-providers');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/authentication-methods-serializer');

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
