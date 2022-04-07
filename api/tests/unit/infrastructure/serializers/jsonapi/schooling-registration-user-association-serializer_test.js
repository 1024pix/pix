const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/schooling-registration-user-association-serializer');
const OrganizationLearner = require('../../../../../lib/domain/models/OrganizationLearner');

describe('Unit | Serializer | JSONAPI | schooling-registration-user-association-serializer', function () {
  describe('#serialize', function () {
    it('should convert a OrganizationLearner model object into JSON API data', function () {
      // given
      const organizationLearner = new OrganizationLearner({
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2020-01-01',
      });

      organizationLearner.username = 'john.doe0101';

      const expectedSerializedStudent = {
        data: {
          type: 'schooling-registration-user-associations',
          id: '5',
          attributes: {
            'first-name': organizationLearner.firstName,
            'last-name': organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
          },
        },
      };

      // when
      const json = serializer.serialize(organizationLearner);

      // then
      expect(json).to.deep.equal(expectedSerializedStudent);
    });
  });
});
