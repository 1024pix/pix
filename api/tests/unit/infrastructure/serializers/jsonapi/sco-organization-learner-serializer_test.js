const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/sco-organization-learner-serializer');
const OrganizationLearner = require('../../../../../lib/domain/models/OrganizationLearner');

describe('Unit | Serializer | JSONAPI | sco-organization-learner-serializer', function () {
  describe('#serializeIdentity', function () {
    it('should convert an organizationLearner model object into JSON API data', function () {
      // given
      const organizationLearner = new OrganizationLearner({
        id: 5,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2020-01-01',
      });

      const expectedSerializedOrganizationLearner = {
        data: {
          type: 'sco-organization-learners',
          id: '5',
          attributes: {
            'first-name': organizationLearner.firstName,
            'last-name': organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
          },
        },
      };

      // when
      const json = serializer.serializeIdentity(organizationLearner);

      // then
      expect(json).to.deep.equal(expectedSerializedOrganizationLearner);
    });
  });
});
