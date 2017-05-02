const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-serializer');
const User = require('../../../../../lib/domain/models/data/user');

describe('Unit | Serializer | JSONAPI | user-serializer', function () {

  let jsonUser;

  beforeEach(() => {
    jsonUser = {
      data: {
        type: 'user',
        attributes: {
          firstName: "Luke",
          lastName: "Skywalker",
          email: "lskywalker@deathstar.empire",
          password: ""
        },
        relationships: {}
      }
    };
  });

  describe('#deserialize()', function () {

    it('should convert JSON API data into an User model object', function () {
      // When
      const user = serializer.deserialize(jsonUser);

      // Then
      expect(user.get('firstName')).to.equal('Luke');
      expect(user.get('lastName')).to.equal("Skywalker");
      expect(user.get('email')).to.equal("lskywalker@deathstar.empire");
      expect(user.get('password')).to.equal("");
    });

    it('should contain an ID attribute', function () {
      // Given
      jsonUser.data.id = '42';

      // When
      const user = serializer.deserialize(jsonUser);

      // Then
      expect(user.get('id')).to.equal('42');
    });

    it('should not contain an ID attribute when not given', function () {
      // When
      const user = serializer.deserialize(jsonUser);

      // Then
      expect(user.get('id')).to.be.undefined;
    });

  });

});
