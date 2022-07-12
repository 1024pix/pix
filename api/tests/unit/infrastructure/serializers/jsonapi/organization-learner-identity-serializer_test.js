const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-learner-identity-serializer');
const OrganizationLearner = require('../../../../../lib/domain/models/OrganizationLearner');

describe('Unit | Serializer | JSONAPI | organization-learner-identity-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organizationLearner model object into JSON API data', function () {
      // given
      const organizationLearner = new OrganizationLearner({
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
      });

      const expectedSerializedOrganizationLearner = {
        data: {
          type: 'schooling-registration-user-associations',
          id: '5',
          attributes: {
            'first-name': organizationLearner.firstName,
            'last-name': organizationLearner.lastName,
          },
        },
      };

      // when
      const json = serializer.serialize(organizationLearner);

      // then
      expect(json).to.deep.equal(expectedSerializedOrganizationLearner);
    });
  });
});
