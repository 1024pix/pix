const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/authentication-serializer');
const Authentication = require('../../../../../lib/domain/models/Authentication');

describe('Unit | Serializer | JSONAPI | authentication-serializer', function() {

  const expectedJsonAnswer = {
    data: {
      id: '8',
      type: 'authentications',
      attributes: {
        'user-id': '8',
        token: 'my-token',
        password: ''
      }
    }
  };

  describe('#serialize()', function() {

    it('should format a login model object into JSON API data', function() {
      // Given
      const login = new Authentication(8, 'my-token');

      // when
      const json = serializer.serialize(login);

      // then
      expect(json).to.deep.equal(expectedJsonAnswer);
    });

  });
});
