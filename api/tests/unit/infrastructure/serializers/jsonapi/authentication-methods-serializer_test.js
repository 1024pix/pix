const { expect, domainBuilder } = require('../../../../test-helper');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
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
              'identity-provider': AuthenticationMethod.identityProviders.POLE_EMPLOI,
            },
          },
        ],
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
});
