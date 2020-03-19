const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/student-with-user-info-serializer');
const StudentWithUserInfo = require('../../../../../lib/domain/models/StudentWithUserInfo');

describe('Unit | Serializer | JSONAPI | studentWithUserInfo-serializer', () => {

  describe('#serialize', () => {

    it('should convert a StudentWithUserInfo model object into JSON API data', () => {
      // given
      const studentWithUserInfo = new StudentWithUserInfo({
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2020-01-01',
        userId: 4,
        username: 'john.doe0101',
        email: 'john.doe@example.net',
        isAuthenticatedFromGAR: false,
      });

      const expectedSerializedStudent = {
        data: {
          type: 'students',
          id: '5',
          attributes: {
            'first-name': studentWithUserInfo.firstName,
            'last-name': studentWithUserInfo.lastName,
            'birthdate': studentWithUserInfo.birthdate,
            'username': studentWithUserInfo.username,
            'email': studentWithUserInfo.email,
            'is-authenticated-from-gar': false,
          }
        }
      };

      // when
      const json = serializer.serialize(studentWithUserInfo);

      // then
      expect(json).to.deep.equal(expectedSerializedStudent);
    });
  });
});
