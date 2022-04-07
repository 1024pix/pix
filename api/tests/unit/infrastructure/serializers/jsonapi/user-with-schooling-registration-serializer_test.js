const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-with-schooling-registration-serializer');
const UserWithOrganizationLearner = require('../../../../../lib/domain/models/UserWithOrganizationLearner');

describe('Unit | Serializer | JSONAPI | UserWithSchoolingRegistration-serializer', function () {
  describe('#serialize', function () {
    it('should convert a UserWithOrganizationLearner model object into JSON API data', function () {
      // given
      const userWithOrganizationLearner = new UserWithOrganizationLearner({
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2020-01-01',
        userId: 4,
        username: 'john.doe0101',
        email: 'john.doe@example.net',
        isAuthenticatedFromGAR: false,
        studentNumber: '123456789',
        division: '3A',
        group: 'AB1',
      });

      const expectedSerializedUserWithOrganizationLearner = {
        data: {
          type: 'students',
          id: '5',
          attributes: {
            'first-name': userWithOrganizationLearner.firstName,
            'last-name': userWithOrganizationLearner.lastName,
            birthdate: userWithOrganizationLearner.birthdate,
            username: userWithOrganizationLearner.username,
            'user-id': userWithOrganizationLearner.userId,
            email: userWithOrganizationLearner.email,
            'is-authenticated-from-gar': false,
            'student-number': userWithOrganizationLearner.studentNumber,
            division: userWithOrganizationLearner.division,
            group: userWithOrganizationLearner.group,
          },
        },
      };

      // when
      const json = serializer.serialize(userWithOrganizationLearner);

      // then
      expect(json).to.deep.equal(expectedSerializedUserWithOrganizationLearner);
    });
  });
});
