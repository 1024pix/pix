const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-learner-serializer');
const OrganizationLearner = require('../../../../../lib/domain/models/OrganizationLearner');

describe('Unit | Serializer | JSONAPI | organization-learner-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organizationLearner model object into JSON API data', function () {
      // given
      const organizationLearner = new OrganizationLearner({
        id: 7,
        firstName: 'Michael',
        lastName: 'Jackson',
      });

      const expectedSerializedOrganizationLearner = {
        data: {
          type: 'organization-learners',
          id: '7',
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
