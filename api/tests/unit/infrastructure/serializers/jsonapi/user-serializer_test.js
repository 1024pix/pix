const { expect } = require('../../../../test-helper');

const BookshelfUser = require('../../../../../lib/infrastructure/data/user');
const User = require('../../../../../lib/domain/models/User');

const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-serializer');

describe('Unit | Serializer | JSONAPI | user-serializer', () => {
  let jsonUser;

  beforeEach(() => {
    jsonUser = {
      data: {
        type: 'user',
        attributes: {
          'first-name': 'Luke',
          'last-name': 'Skywalker',
          email: 'lskywalker@deathstar.empire',
          password: ''
        },
        relationships: {}
      }
    };
  });

  describe('#serialize', () => {
    context('when the given parameter is a BookshelfUser', () => {
      it('should serialize excluding email and password', () => {
        // Given
        const modelObject = new BookshelfUser({
          id: '234567',
          firstName: 'Luke',
          lastName: 'Skywalker',
          email: 'lskywalker@deathstar.empire',
          password: ''
        });

        // When
        const json = serializer.serialize(modelObject);

        // Then
        expect(json).to.be.deep.equal({
          data: {
            attributes: {
              'first-name': 'Luke',
              'last-name': 'Skywalker',
            },
            id: '234567',
            type: 'users'
          }
        });
      });
    });

    context('when the given parameter is a User', () => {
      it('should serialize excluding email and password', () => {
        // Given
        const modelObject = new User({
          id: '234567',
          firstName: 'Luke',
          lastName: 'Skywalker',
          email: 'lskywalker@deathstar.empire',
          password: ''
        });

        // When
        const json = serializer.serialize(modelObject);

        // Then
        expect(json).to.be.deep.equal({
          data: {
            attributes: {
              'first-name': 'Luke',
              'last-name': 'Skywalker',
            },
            id: '234567',
            type: 'users'
          }
        });
      });
    });
  });

  describe('#deserialize()', () => {

    it('should convert JSON API data into an User model object', () => {
      // When
      const user = serializer.deserialize(jsonUser);

      // Then
      expect(user).to.be.an.instanceOf(User);
      expect(user.firstName).to.equal('Luke');
      expect(user.lastName).to.equal('Skywalker');
      expect(user.email).to.equal('lskywalker@deathstar.empire');
      expect(user.password).to.equal('');
    });

    it('should contain an ID attribute', () => {
      jsonUser.data.id = '42';

      // When
      const user = serializer.deserialize(jsonUser);

      // Then
      expect(user.id).to.equal('42');
    });

    it('should not contain an ID attribute when not given', () => {
      // When
      const user = serializer.deserialize(jsonUser);

      // Then
      expect(user.id).to.be.undefined;
    });

  });

});
