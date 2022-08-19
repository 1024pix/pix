const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/oidc-serializer');

describe('Unit | Serializer | JSONAPI | oidc-serializer', function () {
  describe('#serialize()', function () {
    it('should format into JSON API data', function () {
      // given
      const authenticationMethods = [
        { identityProvider: 'PIX', userId: 1 },
        { identityProvider: 'PIX', userId: 1 },
        { identityProvider: 'CNAV', userId: 1 },
      ];
      const authenticationContent = {
        accessToken: 'access.token',
        logoutUrlUUID: 'logout.url.uuid',
        fullNameFromPix: 'Sarah Pix',
        fullNameFromExternalIdentityProvider: 'Sarah Idp',
        username: 'sarahcroche123',
        email: 'sarahcroche@example.net',
        authenticationMethods,
      };

      // when
      const json = serializer.serialize(authenticationContent);

      // then
      const expectedJson = {
        data: {
          attributes: {
            'access-token': 'access.token',
            'logout-url-uuid': 'logout.url.uuid',
            'full-name-from-pix': 'Sarah Pix',
            'full-name-from-external-identity-provider': 'Sarah Idp',
            username: 'sarahcroche123',
            email: 'sarahcroche@example.net',
            'authentication-methods': [
              { identityProvider: 'PIX', userId: 1 },
              { identityProvider: 'PIX', userId: 1 },
              { identityProvider: 'CNAV', userId: 1 },
            ],
          },
          type: 'user-oidc-authentication-requests',
        },
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
});
