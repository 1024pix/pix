const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-with-schooling-registration-serializer');
const UserWithSchoolingRegistration = require('../../../../../lib/domain/models/UserWithSchoolingRegistration');

describe('Unit | Serializer | JSONAPI | UserWithSchoolingRegistration-serializer', function() {

  describe('#serialize', function() {

    it('should convert a UserWithSchoolingRegistration model object into JSON API data', function() {
      // given
      const userWithSchoolingRegistration = new UserWithSchoolingRegistration({
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2020-01-01',
        userId: 4,
        username: 'john.doe0101',
        email: 'john.doe@example.net',
        isAuthenticatedFromGAR: false,
        studentNumber: '123456789',
      });

      const expectedSerializedUserWithSchoolingRegistration = {
        data: {
          type: 'students',
          id: '5',
          attributes: {
            'first-name': userWithSchoolingRegistration.firstName,
            'last-name': userWithSchoolingRegistration.lastName,
            'birthdate': userWithSchoolingRegistration.birthdate,
            'username': userWithSchoolingRegistration.username,
            'user-id': userWithSchoolingRegistration.userId,
            'email': userWithSchoolingRegistration.email,
            'is-authenticated-from-gar': false,
            'student-number': userWithSchoolingRegistration.studentNumber,
          },
        },
      };

      // when
      const json = serializer.serialize(userWithSchoolingRegistration);

      // then
      expect(json).to.deep.equal(expectedSerializedUserWithSchoolingRegistration);
    });
  });
});
