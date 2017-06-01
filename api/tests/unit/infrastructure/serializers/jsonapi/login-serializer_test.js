const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/login-serializer');
const Login = require('../../../../../lib/domain/models/data/login');

describe('Unit | Serializer | JSONAPI | login-serializer', function() {

  const jsonAnswer = {
    data: {
      type: 'login',
      attributes: {
        user_id: 8,
        token: 'my-token',
      }
    }
  };

  describe('#serialize()', function() {

    it('should format a login model object into JSON API data', function() {
      // Given
      const login = new Login(8, 'my-token');

      // when
      const json = serializer.serialize(login);

      // then
      expect(json).to.deep.equal(jsonAnswer);
    });

  });
});
