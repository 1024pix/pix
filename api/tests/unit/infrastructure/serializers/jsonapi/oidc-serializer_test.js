const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/oidc-serializer');

describe('Unit | Serializer | JSONAPI | oidc-serializer', function () {
  describe('#serialize()', function () {
    it('should format into JSON API data', function () {
      // given
      const authenticationContent = {
        accessToken: 'access.token',
        logoutUrlUUID: 'logout.url.uuid',
      };

      // when
      const json = serializer.serialize(authenticationContent);

      // then
      const expectedJson = {
        data: {
          attributes: {
            'access-token': 'access.token',
            'logout-url-uuid': 'logout.url.uuid',
          },
          type: 'user-oidc-authentication-requests',
        },
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
});
