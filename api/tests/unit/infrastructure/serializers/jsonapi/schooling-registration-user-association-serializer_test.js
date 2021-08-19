const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/schooling-registration-user-association-serializer');
const SchoolingRegistration = require('../../../../../lib/domain/models/SchoolingRegistration');

describe('Unit | Serializer | JSONAPI | schooling-registration-user-association-serializer', function() {

  describe('#serialize', function() {

    it('should convert a SchoolingRegistration model object into JSON API data', function() {
      // given
      const schoolingRegistration = new SchoolingRegistration({
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2020-01-01',
      });

      schoolingRegistration.username = 'john.doe0101';

      const expectedSerializedStudent = {
        data: {
          type: 'schooling-registration-user-associations',
          id: '5',
          attributes: {
            'first-name': schoolingRegistration.firstName,
            'last-name': schoolingRegistration.lastName,
            'birthdate': schoolingRegistration.birthdate,
          },
        },
      };

      // when
      const json = serializer.serialize(schoolingRegistration);

      // then
      expect(json).to.deep.equal(expectedSerializedStudent);
    });
  });
});
